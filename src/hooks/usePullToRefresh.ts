import { useState, useEffect, useRef, useCallback } from 'react'

const PULL_THRESHOLD = 80
const DECAY_FACTOR = 0.85
const OVER_SHOOT_FACTOR = 0.2

const MENU_ITEMS = [
    '피자',
    '치킨',
    '햄버거',
    '초밥',
    '파스타',
    '타코',
    '쌀국수',
    '마라탕',
    '떡볶이',
    '김치찜'
]

export const usePullToRefresh = () => {
    const [pullPosition, setPullPosition] = useState(0)
    const [menu, setMenu] = useState('크림파스타')

    const isPullingRef = useRef(false)
    const touchYRef = useRef(0)
    const animationFrameRef = useRef<number | undefined>(undefined)
    const menuRef = useRef(menu)
    const pullPositionRef = useRef(pullPosition)

    useEffect(() => {
        menuRef.current = menu
    }, [menu])

    useEffect(() => {
        pullPositionRef.current = pullPosition
    }, [pullPosition])

    const animateRecoil = useCallback(() => {
        if (pullPositionRef.current < 1) {
            setPullPosition(0)
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current)
            }
            return
        }
        setPullPosition(prev => prev * DECAY_FACTOR)
        animationFrameRef.current = requestAnimationFrame(animateRecoil)
    }, [])

    useEffect(() => {
        const scrollElement = document.documentElement

        const handleTouchStart = (e: TouchEvent) => {
            if (scrollElement.scrollTop === 0) {
                if (animationFrameRef.current) {
                    cancelAnimationFrame(animationFrameRef.current)
                }
                touchYRef.current = e.touches[0].clientY
                isPullingRef.current = true
            }
        }

        const handleTouchMove = (e: TouchEvent) => {
            if (!isPullingRef.current) return

            const touchDown = e.touches[0].clientY
            const pullDistance = touchDown - touchYRef.current

            if (pullDistance > 0) {
                e.preventDefault()
                setPullPosition(pullDistance)
            }
        }

        const handleTouchEnd = () => {
            if (!isPullingRef.current) return

            isPullingRef.current = false

            if (pullPositionRef.current > PULL_THRESHOLD) {
                let newMenu = menuRef.current
                while (newMenu === menuRef.current) {
                    const randomIndex = Math.floor(
                        Math.random() * MENU_ITEMS.length
                    )
                    newMenu = MENU_ITEMS[randomIndex]
                }
                setMenu(newMenu)

                setPullPosition(
                    PULL_THRESHOLD + PULL_THRESHOLD * OVER_SHOOT_FACTOR
                )

                if (window.navigator.vibrate) {
                    window.navigator.vibrate(50)
                }
            }

            animationFrameRef.current = requestAnimationFrame(animateRecoil)
        }

        document.addEventListener('touchstart', handleTouchStart, {
            passive: true
        })
        document.addEventListener('touchmove', handleTouchMove, {
            passive: false
        })
        document.addEventListener('touchend', handleTouchEnd)
        document.addEventListener('touchcancel', handleTouchEnd)

        return () => {
            document.removeEventListener('touchstart', handleTouchStart)
            document.removeEventListener('touchmove', handleTouchMove)
            document.removeEventListener('touchend', handleTouchEnd)
            document.removeEventListener('touchcancel', handleTouchEnd)
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current)
            }
        }
    }, [animateRecoil])

    return { pullPosition, menu }
}
