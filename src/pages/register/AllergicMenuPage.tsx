import { CardChoice, NextButton } from '@/components'
import { useNavigate } from '@/navigation'
import { useMemo, useState } from 'react'
import {
    findOnboardingMenuOptions,
    ONBOARDING_MENU_OPTIONS
} from '@/constants/onboardingMenuOptions'
import {
    ProfileImageUploadError,
    useCompleteOnboarding,
    useUploadProfilePhoto
} from '@/apis'
import { useOnboardingStore } from '@/store'
import { onboardingFlowController } from '@/features/onboarding'

type SubmitErrorKind = 'IMAGE_PRESIGN' | 'IMAGE_S3_UPLOAD' | 'ONBOARDING'

type SubmitErrorState = {
    kind: SubmitErrorKind
    message: string
} | null

const toSubmitError = (error: unknown): SubmitErrorState => {
    if (error instanceof ProfileImageUploadError) {
        return {
            kind: error.stage === 'PRESIGN' ? 'IMAGE_PRESIGN' : 'IMAGE_S3_UPLOAD',
            message: error.userMessage
        }
    }

    return {
        kind: 'ONBOARDING',
        message:
            error instanceof Error
                ? error.message
                : '온보딩 저장에 실패했습니다.'
    }
}

export function AllergicMenuPage() {
    const navigate = useNavigate()
    const {
        username,
        profileImageUrl,
        profileImageFile,
        bio,
        liked,
        disliked,
        allergy,
        setAllergyFoods,
        setProfileDraft,
        setProfileImageFile,
        resetOnboardingDraft
    } = useOnboardingStore()
    const initialSelectedKeys = useMemo(
        () => new Set(allergy.map(item => String(item.code))),
        [allergy]
    )
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(
        initialSelectedKeys
    )
    const [submitError, setSubmitError] = useState<SubmitErrorState>(null)

    const { mutateAsync: uploadProfilePhoto, isPending: isImageUploading } =
        useUploadProfilePhoto()

    const { mutateAsync: completeOnboarding, isPending: isOnboardingPending } =
        useCompleteOnboarding({
            onSuccess: () => {
                resetOnboardingDraft()
                navigate(onboardingFlowController.getStepPath('FINISH'), {
                    replace: true
                })
            },
            onError: error => {
                setSubmitError(toSubmitError(error))
            }
        })

    const toggle = (key: string) => {
        setSelectedKeys(prev => {
            const next = new Set(prev)
            if (next.has(key)) next.delete(key)
            else next.add(key)
            return next
        })
    }

    const submit = async ({ skipProfileImage = false } = {}) => {
        const nextAllergies = findOnboardingMenuOptions(selectedKeys)
        setAllergyFoods(nextAllergies)

        const trimmedName = username.trim()
        if (!trimmedName) {
            navigate(onboardingFlowController.getStepPath('PROFILE'))
            return
        }

        setSubmitError(null)

        try {
            const uploadedProfileImageUrl =
                profileImageFile && !skipProfileImage
                    ? await uploadProfilePhoto(profileImageFile)
                    : skipProfileImage
                      ? null
                      : profileImageUrl

            setProfileDraft({ profileImageUrl: uploadedProfileImageUrl ?? null })
            if (profileImageFile && uploadedProfileImageUrl) {
                setProfileImageFile(null)
            }

            await completeOnboarding({
                username: trimmedName,
                profileImageUrl: uploadedProfileImageUrl ?? null,
                bio,
                liked,
                disliked,
                allergy: nextAllergies
            })
        } catch (error) {
            setSubmitError(toSubmitError(error))
        }
    }

    const continueWithoutImage = () => {
        setProfileImageFile(null)
        setProfileDraft({ profileImageUrl: null })
        void submit({ skipProfileImage: true })
    }

    const isPending = isImageUploading || isOnboardingPending
    const isImageUploadError =
        submitError?.kind === 'IMAGE_PRESIGN' ||
        submitError?.kind === 'IMAGE_S3_UPLOAD'

    return (
        <div className="flex h-full w-full flex-col justify-between">
            <div className="flex flex-col gap-12 pt-24">
                <h1 className="text-title2-semibold text-gray-8">
                    알레르기나 못먹는 음식이 있다면 <br />
                    골라주세요.
                </h1>
                <p className="text-caption-medium text-gray-5">
                    개수 상관 없이 눌러주세요. <br />더 추가하고 싶은 메뉴가
                    있다면 텍스트로 입력해주세요.
                </p>
            </div>

            <div className="grid grid-cols-3 justify-items-center gap-12">
                {ONBOARDING_MENU_OPTIONS.map(option => (
                    <CardChoice
                        key={option.key}
                        label={option.label}
                        selected={selectedKeys.has(option.key)}
                        onToggle={() => toggle(option.key)}
                    />
                ))}
            </div>
            {submitError && (
                <div className="pb-96">
                    <p className="text-caption-medium text-red-500">
                        {submitError.message}
                    </p>
                    {isImageUploadError && (
                        <div className="mt-8 flex gap-8">
                            <button
                                type="button"
                                className="text-caption-semibold text-gray-7 underline"
                                onClick={() => void submit()}
                                disabled={isPending}>
                                다시 업로드하기
                            </button>
                            <button
                                type="button"
                                className="text-caption-semibold text-gray-5 underline"
                                onClick={continueWithoutImage}
                                disabled={isPending}>
                                이미지 없이 완료하기
                            </button>
                        </div>
                    )}
                </div>
            )}
            <NextButton
                className={isPending ? 'pointer-events-none opacity-50' : ''}
                onClick={() => void submit()}
            />
        </div>
    )
}
