import { ModifyIcon } from '@/assets/icons'
import { GoodBadChip } from '@/components'
import {
    useGetMemberProfile,
    useGetMemberProfileDetail,
    useGetMyPreference,
    useUpdateMyProfile,
    useUpdatePreference,
    useUploadProfilePhoto
} from '@/apis'
import { domainFood } from '@/domain/factories'
import { useAuthStore, useHeaderStore } from '@/store'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

type ChipVariant = 'good' | 'bad'

const splitBySpace = (str: string) =>
    str
        .split(' ')
        .map(s => s.trim())
        .filter(s => s.length > 0)

const toFoodList = (value: string) =>
    splitBySpace(value).map(label => domainFood(label, label))

const labelsToInput = (items?: { label: string }[]) =>
    (items ?? []).map(item => item.label).join(' ')

function TagInput({
    id,
    value,
    onChange,
    variant
}: {
    id: string
    value: string
    onChange: (val: string) => void
    variant: ChipVariant
}) {
    const chips = useMemo(() => splitBySpace(value), [value])

    return (
        <div
            className="rounded-12 border-gray-2 flex min-h-80 flex-col gap-10 border bg-white p-12"
            onClick={() => {
                const input = document.getElementById(id)
                if (input) (input as HTMLInputElement).focus()
            }}>
            <div className="flex flex-wrap items-center gap-10">
                {chips.map((item, idx) => (
                    <GoodBadChip
                        key={`${item}-${idx}`}
                        text={item}
                        isGood={variant === 'good'}
                    />
                ))}
            </div>
            <input
                id={id}
                type="text"
                value={value.endsWith(' ') ? '' : value.split(' ').pop() || ''}
                onChange={e => {
                    const inputValue = e.target.value
                    if (value.endsWith(' ')) {
                        onChange(value + inputValue)
                    } else {
                        const arr = value.split(' ')
                        arr[arr.length - 1] = inputValue
                        onChange(arr.join(' '))
                    }
                }}
                onKeyDown={e => {
                    if (e.key === ' ') {
                        if (!value.endsWith(' ')) {
                            onChange(value + ' ')
                            e.preventDefault()
                        }
                    } else if (e.key === 'Backspace') {
                        if (
                            (value.endsWith(' ') || value === '') &&
                            chips.length > 0
                        ) {
                            const next = [...chips]
                            next.pop()
                            onChange(
                                next.join(' ') + (next.length > 0 ? ' ' : '')
                            )
                            e.preventDefault()
                        }
                    }
                }}
                className="text-body2-medium min-w-60 flex-1 border-none bg-transparent p-0 outline-none"
                placeholder="띄워쓰기로 구분"
            />
        </div>
    )
}

export function ProfileEditPage() {
    const navigate = useNavigate()
    const { userId } = useAuthStore()
    const currentMemberId = Number(userId)
    const canLoadMember =
        Number.isFinite(currentMemberId) && currentMemberId > 0

    const { data: profileSummary } = useGetMemberProfile(currentMemberId, {
        enabled: canLoadMember
    })
    const { data: profileDetail } = useGetMemberProfileDetail(currentMemberId, {
        enabled: canLoadMember
    })
    const { data: preference } = useGetMyPreference()
    const { mutateAsync: updateProfile, isPending: isProfileUpdating } =
        useUpdateMyProfile()
    const { mutateAsync: updatePreference, isPending: isPreferenceUpdating } =
        useUpdatePreference()
    const { mutateAsync: uploadProfilePhoto, isPending: isPhotoUploading } =
        useUploadProfilePhoto()

    const [name, setName] = useState('')
    const [bio, setBio] = useState('')
    const [favoriteFoods, setFavoriteFoods] = useState('')
    const [dislikedFoods, setDislikedFoods] = useState('')
    const [allergies, setAllergies] = useState('')
    const [profileImageUrl, setProfileImageUrl] = useState('')
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string>('')
    const { setTitle, resetHeader, setRightElement } = useHeaderStore()

    const isSaving =
        isProfileUpdating || isPreferenceUpdating || isPhotoUploading

    useEffect(() => {
        setName(profileSummary?.userName ?? profileDetail?.userName ?? '')
        setBio(profileDetail?.bio ?? profileSummary?.bio ?? '')
        setProfileImageUrl(
            profileSummary?.profileImageUrl ??
                profileDetail?.profileImageUrl ??
                ''
        )
    }, [profileDetail, profileSummary])

    useEffect(() => {
        setFavoriteFoods(labelsToInput(preference?.liked))
        setDislikedFoods(labelsToInput(preference?.disliked))
        setAllergies(labelsToInput(preference?.allergy))
    }, [preference])

    useEffect(() => {
        if (!selectedFile) {
            setPreviewUrl('')
            return
        }

        const objectUrl = URL.createObjectURL(selectedFile)
        setPreviewUrl(objectUrl)
        return () => URL.revokeObjectURL(objectUrl)
    }, [selectedFile])

    const handleSave = useCallback(async () => {
        if (!canLoadMember || isSaving || name.trim().length === 0) return

        let nextProfileImageUrl = profileImageUrl

        if (selectedFile) {
            let result = await uploadProfilePhoto(selectedFile)
            if (result) {
                nextProfileImageUrl = result
                setProfileImageUrl(nextProfileImageUrl)
            }
        }

        await updateProfile({
            username: name.trim(),
            profileImageUrl: nextProfileImageUrl || null,
            bio: bio.trim() || null
        })

        await updatePreference({
            liked: toFoodList(favoriteFoods),
            disliked: toFoodList(dislikedFoods),
            allergy: toFoodList(allergies)
        })

        navigate('/profile', { replace: true })
    }, [
        allergies,
        bio,
        canLoadMember,
        currentMemberId,
        dislikedFoods,
        favoriteFoods,
        isSaving,
        name,
        navigate,
        profileImageUrl,
        selectedFile,
        updatePreference,
        updateProfile,
        uploadProfilePhoto
    ])

    useEffect(() => {
        setTitle('내 정보 수정')
        setRightElement(
            <button
                type="button"
                disabled={isSaving || name.trim().length === 0}
                onClick={handleSave}
                className="text-body1-semibold text-gray-8 disabled:opacity-40">
                {isSaving ? '저장 중' : '저장'}
            </button>
        )
        return () => {
            resetHeader()
        }
    }, [handleSave, isSaving, name, resetHeader, setRightElement, setTitle])

    const imageSrc = previewUrl || profileImageUrl

    return (
        <div className="flex w-346 flex-col gap-30 pt-20">
            {/* 프로필 이미지 + 수정 아이콘 */}
            <div className="flex items-end justify-center">
                <label className="relative size-86 cursor-pointer">
                    <div className="bg-gray-2 size-86 overflow-hidden rounded-full shadow-[-2px_-2px_10px_rgba(153,153,153,0.1),_2px_2px_10px_rgba(153,153,153,0.1)]">
                        {imageSrc && (
                            <img
                                src={imageSrc}
                                alt="프로필 이미지"
                                className="size-86 rounded-full object-cover"
                            />
                        )}
                    </div>
                    <div
                        className="rounded-15 bg-gray-2 absolute top-66 left-66 flex size-20 items-center justify-center"
                        aria-label="프로필 사진 수정">
                        <div className="relative size-10">
                            <ModifyIcon className="size-10" />
                        </div>
                    </div>
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => {
                            setSelectedFile(e.target.files?.[0] ?? null)
                        }}
                    />
                </label>
            </div>

            {/* 입력 영역 */}
            <div className="flex flex-col gap-20">
                {/* 이름 */}
                <div className="flex items-center gap-30">
                    <div className="text-body1-semibold text-nowrap text-black">
                        이름
                    </div>
                    <div className="rounded-12 border-gray-2 flex w-full items-center gap-10 border bg-white p-12">
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="이름"
                            className="text-body2-medium flex-1 border-none bg-transparent outline-none"
                        />
                    </div>
                </div>

                {/* 소개글 */}
                <div className="flex items-center gap-16">
                    <div className="text-body1-semibold text-nowrap text-black">
                        소개글
                    </div>
                    <div className="rounded-12 border-gray-2 flex w-full items-center gap-10 border bg-white p-12">
                        <input
                            type="text"
                            value={bio}
                            onChange={e => setBio(e.target.value)}
                            placeholder="자기소개"
                            className="text-body2-medium flex-1 border-none bg-transparent outline-none"
                        />
                    </div>
                </div>

                {/* 좋아하는 음식 */}
                <div className="flex flex-col gap-12">
                    <div className="text-body1-semibold text-black">
                        좋아하는 음식
                    </div>
                    <TagInput
                        id="favoriteFoodsInput"
                        value={favoriteFoods}
                        onChange={setFavoriteFoods}
                        variant="good"
                    />
                </div>

                {/* 못먹는 음식 */}
                <div className="flex flex-col gap-12">
                    <div className="text-body1-semibold text-black">
                        못먹는 음식
                    </div>
                    <TagInput
                        id="dislikedFoodsInput"
                        value={dislikedFoods}
                        onChange={setDislikedFoods}
                        variant="bad"
                    />
                </div>

                {/* 알러지 */}
                <div className="flex flex-col gap-12">
                    <div className="text-body1-semibold text-black">알러지</div>
                    <TagInput
                        id="allergiesInput"
                        value={allergies}
                        onChange={setAllergies}
                        variant="bad"
                    />
                </div>
            </div>
        </div>
    )
}
