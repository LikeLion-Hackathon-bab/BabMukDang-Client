import { useNavigate, Link } from '@/navigation'
import { BackIcon, AlarmIcon } from '@/assets/icons'

import { COLORS } from '@/constants/colors'
import type { HeaderConfig } from '@/store/layoutChromeStore'

interface HeaderProps {
    title?: string
    config?: HeaderConfig
}

export function Header({ title, config }: HeaderProps) {
    const navigate = useNavigate()
    const finalConfig: HeaderConfig = config ?? {
        visible: true,
        showLeftButton: true,
        showRightButton: false,
        showCenterElement: true,
        title: title ?? ''
    }

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
                            {finalConfig.title || title || ''}
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
