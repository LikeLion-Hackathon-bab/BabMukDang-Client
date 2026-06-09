import { useNavigate, Link } from 'react-router-dom'
import { BackIcon, AlarmIcon } from '@/assets/icons'

import { COLORS } from '@/constants/colors'
import { useHeaderStore } from '@/store'

interface HeaderProps {
    title?: string
    config?: any // 기존 props 호환성을 위해 유지
}

export function Header({ title, config }: HeaderProps) {
    const navigate = useNavigate()
    const headerConfig = useHeaderStore().config

    // config prop이 제공되면 우선 사용, 아니면 Zustand 스토어의 config 사용
    const finalConfig = config || headerConfig

    if (!finalConfig.visible) {
        return null
    }

    return (
        <div className="flex flex-row justify-between bg-white px-20 pt-15 pb-10">
            <div className="flex flex-row items-center gap-2">
                {finalConfig.left || (
                    <BackIcon
                        onClick={() => navigate(-1)}
                        strokecolor={COLORS.black}
                        className={`${
                            finalConfig.showLeftButton
                                ? 'opacity-100'
                                : 'opacity-0'
                        }`}
                    />
                )}
            </div>
            <div className="flex items-center">
                {finalConfig.center ||
                    (finalConfig.showCenterElement && (
                        <span className="text-title2-semibold">
                            {finalConfig.title || ''}
                        </span>
                    ))}
            </div>
            <div className="flex items-center">
                {finalConfig.right || (
                    <Link
                        to="/noti"
                        className={`${
                            finalConfig.showRightButton
                                ? 'opacity-100'
                                : 'opacity-0'
                        }`}>
                        <AlarmIcon />
                    </Link>
                )}
            </div>
        </div>
    )
}
