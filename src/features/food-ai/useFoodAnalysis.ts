import { useEffect, useState } from 'react'

import { analyzeFoodImage, type FoodAiAnalyzeResult } from './analyzeFoodImage'
import { useArticleStore } from '@/store'

type FoodAnalysisStatus = 'idle' | 'analyzing' | 'ready' | 'skipped' | 'failed'

export type UseFoodAnalysisState = {
    status: FoodAnalysisStatus
    result: FoodAiAnalyzeResult | null
    error: Error | null
}

export const useFoodAnalysis = (imageFile: File | null): UseFoodAnalysisState => {
    const setFoodAnalysis = useArticleStore(state => state.setFoodAnalysis)
    const [state, setState] = useState<UseFoodAnalysisState>({
        status: 'idle',
        result: null,
        error: null
    })

    useEffect(() => {
        let cancelled = false

        if (!imageFile) {
            setFoodAnalysis(null)
            setState({ status: 'idle', result: null, error: null })
            return
        }

        setFoodAnalysis(null)
        setState({ status: 'analyzing', result: null, error: null })

        analyzeFoodImage(imageFile)
            .then(result => {
                if (cancelled) return

                if (result.ok) {
                    setFoodAnalysis(result.foodAnalysis)
                    setState({ status: 'ready', result, error: null })
                    return
                }

                setFoodAnalysis(null)
                setState({ status: 'skipped', result, error: null })
            })
            .catch(error => {
                if (cancelled) return

                const normalizedError =
                    error instanceof Error ? error : new Error(String(error))
                setFoodAnalysis(null)
                setState({
                    status: 'failed',
                    result: null,
                    error: normalizedError
                })
            })

        return () => {
            cancelled = true
        }
    }, [imageFile, setFoodAnalysis])

    return state
}
