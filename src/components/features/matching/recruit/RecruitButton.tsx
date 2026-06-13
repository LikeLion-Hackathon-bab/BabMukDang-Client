import {
    useCloseRecruit,
    useGetRecruits,
    usePostRecruit,
    PostRequest
} from '@/apis'
import { MutalButtonSmall } from '@/components'
import { useNavigate } from 'react-router-dom'

export function AddRecruitButton({
    recruitAddData
}: {
    recruitAddData: PostRequest
}) {
    const { mutate: postRecruit } = usePostRecruit({
        onSuccess: () => {
            console.log('Add recruit button clicked')
            refetchRecruits()
        },
        onError: (error: Error) => {
            console.log(error)
        }
    })
    const { refetch: refetchRecruits } = useGetRecruits()
    const handleAddRecruit = () => {
        postRecruit(recruitAddData)
    }
    return (
        <MutalButtonSmall
            text="공고 등록하기"
            onClick={handleAddRecruit}></MutalButtonSmall>
    )
}
export function CloseRecruitButton({
    recruitId
}: {
    recruitId: number | undefined
}) {
    const navigate = useNavigate()
    const { mutate: closeRecruit } = useCloseRecruit({
        onSuccess: () => {
            console.log('Close recruit button clicked')
        },
        onError: (error: Error) => {
            console.log(error)
        }
    })
    const handleCloseRecruit = () => {
        if (recruitId) {
            closeRecruit(recruitId)
            navigate('/recruit/waiting')
        }
    }

    return (
        <MutalButtonSmall
            text="공고 마감하기"
            onClick={handleCloseRecruit}></MutalButtonSmall>
    )
}
