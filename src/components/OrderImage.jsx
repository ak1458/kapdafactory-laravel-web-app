'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { getStorageCandidates } from '../lib/api';

export default function OrderImage({
    image,
    alt = 'Order image',
    className = '',
    onClick,
    loading = 'lazy',
    fallback = null,
}) {
    const sources = useMemo(() => getStorageCandidates(image), [image]);
    const [index, setIndex] = useState(0);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        setIndex(0);
        setFailed(false);
    }, [sources]);

    if (!sources.length || failed) {
        return fallback;
    }

    const src = sources[index];

    // Use next/image for Vercel Blob or local paths for optimization
    // Only if we haven't failed and it's a valid string
    if (src && (src.startsWith('http') || src.startsWith('/'))) {
        return (
            <div className={`relative ${className} overflow-hidden`}>
                <Image
                    src={src}
                    alt={alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    onClick={onClick}
                    onError={() => {
                        if (index + 1 < sources.length) {
                            setIndex((prev) => prev + 1);
                        } else {
                            setFailed(true);
                        }
                    }}
                />
            </div>
        );
    }

    // Fallback to standard img if not compatible with next/image or something else
    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            src={src}
            alt={alt}
            className={className}
            loading={loading}
            decoding="async"
            onClick={onClick}
            onError={() => {
                if (index + 1 < sources.length) {
                    setIndex((prev) => prev + 1);
                    return;
                }
                setFailed(true);
            }}
        />
    );
}
