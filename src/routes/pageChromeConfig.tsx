import type { NavigationLocation as Location } from '@/navigation'
import { LogoTextIcon } from '@/assets/icons'
import { COLORS } from '@/constants/colors'
import type { LayoutChromeConfig } from '@/store/layoutChromeStore'

type RouteChromeConfigFactory = (location: Location) => LayoutChromeConfig

interface RouteChromeConfigEntry {
    path: string
    end?: boolean
    chrome: LayoutChromeConfig | RouteChromeConfigFactory
}

const homeHeaderLogo = <LogoTextIcon fillcolor={COLORS.primary500} />

export const routeChromeConfigEntries: RouteChromeConfigEntry[] = [
    {
        path: '/home',
        chrome: {
            header: {
                left: homeHeaderLogo,
                showCenterElement: false,
                showRightButton: true
            }
        }
    },
    {
        path: '/profile',
        chrome: {
            header: {
                visible: false
            }
        }
    },
    {
        path: '/friend',
        chrome: {
            header: {
                title: '친구',
                showLeftButton: false,
                showRightButton: true
            }
        }
    },
    {
        path: '/meeting',
        chrome: {
            header: {
                title: '내 밥약',
                showLeftButton: false,
                showRightButton: true
            }
        }
    },
    {
        path: '/meal-plans',
        chrome: {
            header: {
                title: '내 밥약',
                showLeftButton: false,
                showRightButton: true
            }
        }
    },
    {
        path: '/meal-plans/start',
        chrome: {
            header: {
                title: '밥약 시작'
            }
        }
    },
    {
        path: '/meal-plans/:mealPlanId/decision',
        chrome: {
            bottomNav: { visible: false },
            header: {
                title: '밥약 결정'
            }
        }
    },
    {
        path: '/meal-plans/:mealPlanId/decision/:decisionStep',
        end: false,
        chrome: {
            bottomNav: { visible: false },
            header: {
                title: '밥약 결정'
            }
        }
    },
    {
        path: '/meal-plans/:mealPlanId/record',
        chrome: {
            header: {
                title: '밥 기록하기'
            }
        }
    },
    {
        path: '/meal-plans/:mealPlanId',
        chrome: {
            header: {
                title: '밥약방'
            }
        }
    },
    {
        path: '/meal-groups',
        chrome: {
            header: {
                title: 'MealGroup'
            }
        }
    },
    {
        path: '/meal-groups/:mealGroupId',
        chrome: {
            header: {
                title: 'MealGroup'
            }
        }
    },
    {
        path: '/search-restaurant',
        chrome: {
            bottomNav: {
                visible: false
            }
        }
    },
    {
        path: '/noti',
        chrome: {
            header: {
                title: '알림'
            }
        }
    },
    {
        path: '/upload',
        chrome: location => {
            const mealPlanId = new URLSearchParams(location.search).get(
                'mealPlanId'
            )

            return {
                header: {
                    title: mealPlanId ? '밥약 기록 업로드' : '사진 업로드'
                },
                bottomNav: {
                    visible: false
                }
            }
        }
    },
    {
        path: '/post/:postId',
        chrome: {
            header: {
                title: '게시물'
            },
            bottomNav: {
                visible: false
            }
        }
    },
    {
        path: '/coupon',
        chrome: {
            header: {
                title: '쿠폰 보관함'
            }
        }
    },
    {
        path: '/profile-edit',
        chrome: {
            header: {
                title: '내 정보 수정'
            }
        }
    },
    {
        path: '/bob-check-history',
        chrome: {
            header: {
                title: '지난 밥 인증 내역'
            }
        }
    },
    {
        path: '/challenge',
        chrome: {
            header: {
                title: '챌린지'
            }
        }
    }
]

export const resolveRouteChromeConfig = (
    entry: RouteChromeConfigEntry,
    location: Location
): LayoutChromeConfig =>
    typeof entry.chrome === 'function' ? entry.chrome(location) : entry.chrome
