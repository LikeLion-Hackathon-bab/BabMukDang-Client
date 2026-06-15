import type { FoodAnalysisResultDto } from '@/apis'

export type FoodAiClassLabel = Pick<FoodAnalysisResultDto, 'code' | 'label'> & {
    classId: number
}

const LABELS_URL = '/food-ai/segmentation/labels.yaml'
const FOOD_CODE_OFFSET = 1

let labelMapPromise: Promise<Map<number, FoodAiClassLabel>> | null = null

const toFoodCode = (classId: number): FoodAiClassLabel['code'] =>
    `KFOOD_${String(classId + FOOD_CODE_OFFSET).padStart(6, '0')}` as never

const parseLabelsYaml = (yaml: string): Map<number, FoodAiClassLabel> => {
    const labels = new Map<number, FoodAiClassLabel>()
    const lines = yaml.split(/\r?\n/)
    let currentClassId: number | null = null

    for (const line of lines) {
        const classIdMatch = line.match(/^\s*-\s*class_id:\s*(\d+)\s*$/)
        if (classIdMatch) {
            currentClassId = Number(classIdMatch[1])
            continue
        }

        const labelMatch = line.match(/^\s*canonical_ko:\s*(.+?)\s*$/)
        if (labelMatch && currentClassId !== null) {
            labels.set(currentClassId, {
                classId: currentClassId,
                code: toFoodCode(currentClassId),
                label: labelMatch[1].trim() as never
            })
            currentClassId = null
        }
    }

    return labels
}

const loadFoodAiLabelMap = async (): Promise<Map<number, FoodAiClassLabel>> => {
    if (!labelMapPromise) {
        labelMapPromise = fetch(LABELS_URL)
            .then(response => {
                if (!response.ok) {
                    throw new Error(
                        `food-ai labels request failed: ${response.status}`
                    )
                }
                return response.text()
            })
            .then(parseLabelsYaml)
    }

    return labelMapPromise
}

/**
 * food-ai segmentation class_id를 서비스 도메인의 FoodCode/Label로 변환한다.
 *
 * 라벨 원천은 `Babmukdang-FoodAI/outputs/mobile_package/segmentation/labels.yaml`
 * 을 public asset으로 복사한 파일이다. 서버에는 class_id를 보내지 않고,
 * UploadPage는 변환된 code/label/confidence만 ArticlePostRequest.foodAnalysis에
 * 포함한다.
 */
export const findFoodAiLabel = async (
    classId: number
): Promise<FoodAiClassLabel | undefined> => {
    const labels = await loadFoodAiLabelMap()
    return labels.get(classId)
}
