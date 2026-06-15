import type { FoodAnalysisResultDto } from '@/apis'
import { findFoodAiLabel } from './foodAiLabelMap'
import type * as Ort from 'onnxruntime-web'

type OrtModule = typeof import('onnxruntime-web')

export type FoodAiSegmentationBbox = [
    x1: number,
    y1: number,
    x2: number,
    y2: number
]

export type FoodAiSegmentationInstance = {
    instanceId: number
    bbox: FoodAiSegmentationBbox
    classId: number
    confidence: number
}

export type FoodAiRawPrediction = {
    imageId: string
    bboxCount: number
    maskCount: number
    instances: FoodAiSegmentationInstance[]
    topInstance: FoodAiSegmentationInstance
}

export type FoodAiAnalyzeSuccess = {
    ok: true
    foodAnalysis: FoodAnalysisResultDto
    raw: FoodAiRawPrediction
}

export type FoodAiAnalyzeSkipReason =
    | 'runtime-unavailable'
    | 'no-prediction'
    | 'unknown-class-id'
    | 'low-confidence'

export type FoodAiAnalyzeSkipped = {
    ok: false
    reason: FoodAiAnalyzeSkipReason
    message: string
}

export type FoodAiAnalyzeResult = FoodAiAnalyzeSuccess | FoodAiAnalyzeSkipped

const MODEL_URL = '/food-ai/segmentation/yolo11n_seg.onnx'
const INPUT_SIZE = 640
const MIN_CONFIDENCE = 0.25
const NMS_IOU_THRESHOLD = 0.5
const OUTPUT0_NAME = 'output0'
const OUTPUT1_NAME = 'output1'
const OUTPUT_BOX_CHANNELS = 4
const OUTPUT_MASK_CHANNELS = 32

type FoodAiSession = {
    session: Ort.InferenceSession
    inputName: string
}

type ImageTensor = {
    tensor: Ort.Tensor
    imageId: string
    width: number
    height: number
    scale: number
    padX: number
    padY: number
}

type Candidate = FoodAiSegmentationInstance & {
    area: number
}

let sessionPromise: Promise<FoodAiSession> | null = null
let ortPromise: Promise<OrtModule> | null = null

const loadOrt = async (): Promise<OrtModule> => {
    if (!ortPromise) {
        ortPromise = import('onnxruntime-web')
    }

    return ortPromise
}

const configureOrt = (ort: OrtModule): void => {
    ort.env.wasm.wasmPaths = {
        mjs: new URL(
            '/onnxruntime/ort-wasm-simd-threaded.jsep.mjs',
            window.location.origin
        ).toString(),
        wasm: new URL(
            '/onnxruntime/ort-wasm-simd-threaded.jsep.wasm',
            window.location.origin
        ).toString()
    }
    ort.env.wasm.numThreads = 1
    ort.env.wasm.proxy = false
}

const getFoodAiSession = async (): Promise<FoodAiSession> => {
    const ort = await loadOrt()

    if (!sessionPromise) {
        configureOrt(ort)
        sessionPromise = ort.InferenceSession.create(MODEL_URL, {
            executionProviders: ['wasm']
        }).then(session => ({
            session,
            inputName: session.inputNames[0] ?? 'images'
        }))
    }

    return sessionPromise
}

const imageIdFromFile = (file: File): string => {
    const stem = file.name.replace(/\.[^.]+$/, '')
    return stem || crypto.randomUUID()
}

const createImageTensor = async (
    file: File,
    ort: OrtModule
): Promise<ImageTensor> => {
    const bitmap = await createImageBitmap(file)
    const originalWidth = bitmap.width
    const originalHeight = bitmap.height
    const canvas = document.createElement('canvas')
    canvas.width = INPUT_SIZE
    canvas.height = INPUT_SIZE

    const context = canvas.getContext('2d', { willReadFrequently: true })
    if (!context) {
        bitmap.close()
        throw new Error('food-ai image preprocessing canvas is unavailable.')
    }

    context.fillStyle = 'rgb(114, 114, 114)'
    context.fillRect(0, 0, INPUT_SIZE, INPUT_SIZE)

    const scale = Math.min(
        INPUT_SIZE / originalWidth,
        INPUT_SIZE / originalHeight
    )
    const targetWidth = Math.round(originalWidth * scale)
    const targetHeight = Math.round(originalHeight * scale)
    const padX = Math.floor((INPUT_SIZE - targetWidth) / 2)
    const padY = Math.floor((INPUT_SIZE - targetHeight) / 2)

    context.drawImage(bitmap, padX, padY, targetWidth, targetHeight)
    const imageData = context.getImageData(0, 0, INPUT_SIZE, INPUT_SIZE).data
    bitmap.close()

    const tensorData = new Float32Array(1 * 3 * INPUT_SIZE * INPUT_SIZE)
    const channelSize = INPUT_SIZE * INPUT_SIZE

    for (let index = 0; index < channelSize; index += 1) {
        const pixelIndex = index * 4
        tensorData[index] = imageData[pixelIndex] / 255
        tensorData[channelSize + index] = imageData[pixelIndex + 1] / 255
        tensorData[channelSize * 2 + index] = imageData[pixelIndex + 2] / 255
    }

    return {
        tensor: new ort.Tensor('float32', tensorData, [
            1,
            3,
            INPUT_SIZE,
            INPUT_SIZE
        ]),
        imageId: imageIdFromFile(file),
        width: originalWidth,
        height: originalHeight,
        scale,
        padX,
        padY
    }
}

const clamp = (value: number, min: number, max: number): number =>
    Math.min(Math.max(value, min), max)

const bboxArea = (bbox: FoodAiSegmentationBbox): number =>
    Math.max(0, bbox[2] - bbox[0]) * Math.max(0, bbox[3] - bbox[1])

const intersectionOverUnion = (
    left: FoodAiSegmentationBbox,
    right: FoodAiSegmentationBbox
): number => {
    const x1 = Math.max(left[0], right[0])
    const y1 = Math.max(left[1], right[1])
    const x2 = Math.min(left[2], right[2])
    const y2 = Math.min(left[3], right[3])
    const intersection = bboxArea([x1, y1, x2, y2])
    const union = bboxArea(left) + bboxArea(right) - intersection

    return union > 0 ? intersection / union : 0
}

const nonMaxSuppression = (candidates: Candidate[]): Candidate[] => {
    const selected: Candidate[] = []
    const sorted = [...candidates].sort((a, b) => b.confidence - a.confidence)

    for (const candidate of sorted) {
        const overlaps = selected.some(
            item =>
                item.classId === candidate.classId &&
                intersectionOverUnion(item.bbox, candidate.bbox) >=
                    NMS_IOU_THRESHOLD
        )

        if (!overlaps) selected.push(candidate)
    }

    return selected
}

const toOriginalBbox = (
    cx: number,
    cy: number,
    width: number,
    height: number,
    image: ImageTensor
): FoodAiSegmentationBbox => {
    const x1 = (cx - width / 2 - image.padX) / image.scale
    const y1 = (cy - height / 2 - image.padY) / image.scale
    const x2 = (cx + width / 2 - image.padX) / image.scale
    const y2 = (cy + height / 2 - image.padY) / image.scale

    return [
        clamp(x1, 0, image.width),
        clamp(y1, 0, image.height),
        clamp(x2, 0, image.width),
        clamp(y2, 0, image.height)
    ]
}

const parseSegmentationOutput = (
    output0: Ort.Tensor,
    image: ImageTensor
): FoodAiRawPrediction | null => {
    const data = output0.data
    const [, channelCount, predictionCount] = output0.dims
    const classCount = channelCount - OUTPUT_BOX_CHANNELS - OUTPUT_MASK_CHANNELS

    if (
        !(data instanceof Float32Array) ||
        channelCount <= OUTPUT_BOX_CHANNELS ||
        predictionCount <= 0 ||
        classCount <= 0
    ) {
        throw new Error(
            `food-ai segmentation output shape is unsupported: ${output0.dims.join('x')}.`
        )
    }

    const candidates: Candidate[] = []
    const debug = {
        maxConfidence: Number.NEGATIVE_INFINITY,
        maxConfidenceClassId: -1,
        maxConfidencePredictionIndex: -1,
        passedConfidence: 0,
        rejectedByArea: 0
    }

    for (let index = 0; index < predictionCount; index += 1) {
        let classId = -1
        let confidence = Number.NEGATIVE_INFINITY

        for (let classIndex = 0; classIndex < classCount; classIndex += 1) {
            const score =
                data[
                    (OUTPUT_BOX_CHANNELS + classIndex) * predictionCount + index
                ]
            if (score > confidence) {
                confidence = score
                classId = classIndex
            }
        }

        if (confidence > debug.maxConfidence) {
            debug.maxConfidence = confidence
            debug.maxConfidenceClassId = classId
            debug.maxConfidencePredictionIndex = index
        }

        if (confidence < MIN_CONFIDENCE || classId < 0) continue
        debug.passedConfidence += 1

        const bbox = toOriginalBbox(
            data[index],
            data[predictionCount + index],
            data[predictionCount * 2 + index],
            data[predictionCount * 3 + index],
            image
        )
        const area = bboxArea(bbox)
        if (area <= 0) {
            debug.rejectedByArea += 1
            continue
        }

        candidates.push({
            instanceId: 0,
            bbox,
            classId,
            confidence,
            area
        })
    }

    const instances = nonMaxSuppression(candidates).map(
        ({ area: _area, ...instance }, index) => ({
            ...instance,
            instanceId: index + 1
        })
    )

    console.log(import.meta.env.DEV)
    if (import.meta.env.DEV) {
        console.debug('food-ai segmentation postprocess', {
            outputShape: output0.dims,
            classCount,
            minConfidence: MIN_CONFIDENCE,
            ...debug,
            candidateCount: candidates.length,
            instanceCount: instances.length,
            firstCandidate: candidates[0],
            firstInstance: instances[0]
        })
    }

    if (instances.length === 0) return null

    return {
        imageId: image.imageId,
        bboxCount: instances.length,
        maskCount: instances.length,
        instances,
        topInstance: instances[0]
    }
}

const runSegmentation = async (
    file: File
): Promise<FoodAiRawPrediction | null> => {
    const ort = await loadOrt()
    const [{ session, inputName }, image] = await Promise.all([
        getFoodAiSession(),
        createImageTensor(file, ort)
    ])
    const outputs = await session.run({ [inputName]: image.tensor })
    const output0 = outputs[OUTPUT0_NAME]

    if (!output0 || !outputs[OUTPUT1_NAME]) {
        throw new Error(
            'food-ai segmentation model did not return YOLO outputs.'
        )
    }

    return parseSegmentationOutput(output0, image)
}

/**
 * food-ai segmentation ONNX 분석 entry point.
 *
 * `Babmukdang-FoodAI/outputs/mobile_package/segmentation` 산출물을 Vite public
 * asset으로 서빙하고, YOLO11n-seg의 인스턴스 결과 중 대표 confidence를
 * FoodAnalysisResult(code/label/confidence/tsUtc)로 변환한다. class_id와 bbox
 * 요약은 서버 요청에 포함하지 않고 raw에만 남긴다.
 */
export const analyzeFoodImage = async (
    file: File
): Promise<FoodAiAnalyzeResult> => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
        return {
            ok: false,
            reason: 'runtime-unavailable',
            message: 'food-ai ONNX runtime is not available outside browser.'
        }
    }

    const prediction = await runSegmentation(file)

    if (!prediction) {
        return {
            ok: false,
            reason: 'no-prediction',
            message: 'food-ai did not return a segmentation prediction.'
        }
    }

    if (prediction.topInstance.confidence < MIN_CONFIDENCE) {
        return {
            ok: false,
            reason: 'low-confidence',
            message: 'food-ai segmentation confidence is below the threshold.'
        }
    }

    const mapped = await findFoodAiLabel(prediction.topInstance.classId)

    if (!mapped) {
        return {
            ok: false,
            reason: 'unknown-class-id',
            message: `food-ai class_id ${prediction.topInstance.classId} is not mapped to FoodCode/Label.`
        }
    }

    return {
        ok: true,
        raw: prediction,
        foodAnalysis: {
            code: mapped.code,
            label: mapped.label,
            confidence: prediction.topInstance.confidence,
            tsUtc: new Date().toISOString() as never
        }
    }
}
