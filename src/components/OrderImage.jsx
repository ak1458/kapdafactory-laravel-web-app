'use client';

import { useEffect, useMemo, useState } from 'react';
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

    return (
        // We use a native img here to support runtime fallback chains across migrated path formats.
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
