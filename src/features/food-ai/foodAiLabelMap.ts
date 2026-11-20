import {
    AI_CLASS_TO_FOOD_CODE_MAP_PATH,
    type AiClassFoodCodeMapping,
    type AiClassToFoodCodeMapManifest
} from '@kimdaegyu/babmukdang-shared/domain'

import type { FoodAnalysisResultDto } from '@/apis'

export type FoodAiClassLabel = Pick<FoodAnalysisResultDto, 'code' | 'label'> & {
    classId: number
    candidateCodes: string[]
    mappingStatus: AiClassFoodCodeMapping['mappingStatus']
}

let labelMapPromise: Promise<Map<number, FoodAiClassLabel>> | null = null

const toFoodAiClassLabel = (
    mapping: AiClassFoodCodeMapping
): FoodAiClassLabel | null => {
    if (!mapping.representativeCode) return null
    if (mapping.mappingStatus === 'ignored') return null

    return {
        classId: mapping.classId,
        code: mapping.representativeCode as FoodAnalysisResultDto['code'],
        label: mapping.aiLabel as FoodAnalysisResultDto['label'],
        candidateCodes: mapping.candidateCodes,
        mappingStatus: mapping.mappingStatus
    }
}

const parseAiClassMapManifest = (
    manifest: AiClassToFoodCodeMapManifest
): Map<number, FoodAiClassLabel> => {
    const labels = new Map<number, FoodAiClassLabel>()

    for (const mapping of manifest.classes) {
        const label = toFoodAiClassLabel(mapping)
        if (!label) continue
        labels.set(mapping.classId, label)
    }

    return labels
}

const loadFoodAiLabelMap = async (): Promise<Map<number, FoodAiClassLabel>> => {
    if (!labelMapPromise) {
        labelMapPromise = fetch(AI_CLASS_TO_FOOD_CODE_MAP_PATH)
            .then(response => {
                if (!response.ok) {
                    throw new Error(
                        `food-ai class map request failed: ${response.status}`
                    )
                }
                return response.json() as Promise<AiClassToFoodCodeMapManifest>
            })
            .then(parseAiClassMapManifest)
    }

    return labelMapPromise
}

/**
 * food-ai segmentation class_id를 서비스 도메인의 FoodCode/Label로 변환한다.
 *
 * 라벨 원천은 모델 taxonomy인 `labels.yaml`이지만, 런타임에서는
 * `ai-class-to-food-code-map.json`만 사용한다. 서버에는 class_id를 보내지 않고,
 * UploadPage는 변환된 code/label/confidence만 ArticlePostRequest.foodAnalysis에
 * 포함한다.
 */
export const findFoodAiLabel = async (
    classId: number
): Promise<FoodAiClassLabel | undefined> => {
    const labels = await loadFoodAiLabelMap()
    return labels.get(classId)
}
