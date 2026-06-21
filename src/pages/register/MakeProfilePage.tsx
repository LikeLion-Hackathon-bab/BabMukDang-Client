import { useEffect, useRef, useState } from 'react'
import { AlbumIcon } from '@/assets/icons'
import { NextButton } from '@/components'
import { useNavigate } from '@/navigation'
import { useOnboardingStore } from '@/store'
import { onboardingFlowController } from '@/features/onboarding'

export function MakeProfilePage() {
    const navigate = useNavigate()
    const {
        username,
        profileImageUrl,
        profileImageFile,
        setProfileDraft,
        setProfileImageFile
    } = useOnboardingStore()
    const [name, setName] = useState(username)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [validationMessage, setValidationMessage] = useState<string | null>(
        null
    )
    const fileInputRef = useRef<HTMLInputElement | null>(null)

    useEffect(() => {
        if (!profileImageFile) {
            setPreviewUrl(profileImageUrl)
            return
        }

        const objectUrl = URL.createObjectURL(profileImageFile)
        setPreviewUrl(objectUrl)

        return () => URL.revokeObjectURL(objectUrl)
    }, [profileImageFile, profileImageUrl])

    const onSelectImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null
        setProfileImageFile(file)
    }

    const goNext = () => {
        const trimmedName = name.trim()
        if (!trimmedName) {
            setValidationMessage('이름을 입력해주세요.')
            return
        }

        setProfileDraft({
            username: trimmedName,
            bio: null
        })
        navigate(onboardingFlowController.nextPathFrom('PROFILE'))
    }

    return (
        <div className="flex h-full w-full flex-col justify-between">
            <div className="pt-24">
                <span className="text-title2-semibold text-black">
                    프로필을 만들어주세요!
                </span>
            </div>

            <div className="flex w-full flex-col items-center justify-center gap-54">
                <div className="relative">
                    <div
                        className="shadow-drop-1 bg-gray-3 size-176 overflow-hidden rounded-full bg-cover bg-center"
                        style={{
                            backgroundImage: previewUrl
                                ? `url(${previewUrl})`
                                : undefined
                        }}
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        aria-label="앨범에서 사진 선택"
                        className="bg-gray-2 absolute right-0 bottom-0 flex size-41 items-center justify-center rounded-full">
                        <AlbumIcon />
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={onSelectImage}
                        className="hidden"
                    />
                </div>
                <div className="mx-auto flex w-219 flex-col gap-6">
                    <div className="flex justify-between">
                        <input
                            type="text"
                            value={name}
                            onChange={e => {
                                setName(e.target.value.slice(0, 6))
                                setValidationMessage(null)
                            }}
                            placeholder="이름을 입력해주세요."
                            className="text-body2-medium text-gray-6 w-full bg-transparent focus:outline-none"
                        />
                        <span className="text-body2-medium text-gray-4 text-nowrap">
                            ({name.length}/6자)
                        </span>
                    </div>
                    <div className="border-gray-7 h-0 w-full border-b" />
                    {validationMessage && (
                        <p className="text-caption-medium text-red-500">
                            {validationMessage}
                        </p>
                    )}
                </div>
            </div>
            <div></div>
            <NextButton onClick={goNext} />
        </div>
    )
}
