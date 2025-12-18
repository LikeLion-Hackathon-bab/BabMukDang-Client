import { useState } from 'react'

type Item = {
    name: string
    aspectRatio: number
    placeholder: { blurhash?: string; thumbhashDataURL: string }
    images: {
        src: string
        avifSrcset: string
        sizes?: string
    }
    priority?: boolean
}
const withCdnSrcset = (srcset: string, cdn: string) =>
    srcset
        .split(',')
        .map(chunk => {
            const [url, descriptor] = chunk.trim().split(/\s+/, 2)
            const abs = url.startsWith('http')
                ? url
                : `${cdn.replace(/\/$/, '')}${url}`
            return descriptor ? `${abs} ${descriptor}` : abs
        })
        .join(', ')

export function ThumbImg({
    item,
    size,
    className,
    onClick,
    aspectRatio,
    isExcluded
}: {
    item: Item | undefined
    size: number | 'full'
    className?: string
    onClick: () => void
    aspectRatio?: string
    isExcluded?: boolean
}) {
    const handleClick = () => {
        onClick()
    }
    if (!item)
        return (
            <div
                onClick={handleClick}
                className={`bg-gray-2 h-${size} w-${size} rounded-12 flex items-center justify-center ${
                    isExcluded ? 'opacity-20' : ''
                }`}>
                <span className="text-body2-medium text-gray-7">
                    이미지 준비 중
                </span>
            </div>
        )
    return (
        <div
            className={`rounded-12 relative h-${size} w-${size} overflow-hidden ${className} ${
                isExcluded ? 'opacity-20' : ''
            }`}
            style={{
                aspectRatio: `${aspectRatio || item.aspectRatio || '1/1'}`
            }}
            onClick={handleClick}>
            {/* LQIP */}
            <img
                src={item.placeholder.thumbhashDataURL}
                alt=""
                aria-hidden
                className="absolute inset-0 h-full w-full object-cover blur"
                style={{ filter: 'blur(12px)', transform: 'scale(1.05)' }}
            />
            {/* 실제 썸네일 */}
            <picture>
                <source
                    type="image/avif"
                    srcSet={withCdnSrcset(
                        item.images.avifSrcset,
                        import.meta.env.VITE_CDN_URL
                    )}
                    sizes={item.images.sizes}
                />
                <img
                    alt={item.name}
                    src={withCdnSrcset(
                        item.images.src,
                        import.meta.env.VITE_CDN_URL
                    )}
                    // loading={item.priority ? 'eager' : 'lazy'}
                    // @ts-ignore
                    // fetchpriority={item.priority ? 'high' : 'auto'}
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover"
                />
            </picture>
        </div>
    )
}
