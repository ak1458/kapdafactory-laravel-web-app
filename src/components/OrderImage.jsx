'use client';

import { useEffect, useMemo, useState } from 'react';
import { getStorageCandidates } from '../lib/api';

function DefaultFallback({ className }) {
    return (
        <div className={`bg-slate-50 flex items-center justify-center text-slate-300 ${className}`}>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M16.5 9.4 7.5 4.21" />
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
        </div>
    );
}

export default function OrderImage({
    image,
    alt = 'Order image',
    className = '',
    onClick,
    loading = 'lazy',
    decoding = 'async',
    fetchPriority = 'auto',
    fallback = null,
}) {
    const sources = useMemo(() => getStorageCandidates(image), [image]);
    const [sourceIndex, setSourceIndex] = useState(0);
    const [exhausted, setExhausted] = useState(false);

    useEffect(() => {
        setSourceIndex(0);
        setExhausted(false);
    }, [sources]);

    const src = sources[sourceIndex];
    if (!src || exhausted) {
        return fallback ?? <DefaultFallback className={className} />;
    }

    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            src={src}
            alt={alt}
            className={className}
            loading={loading}
            decoding={decoding}
            fetchPriority={fetchPriority}
            draggable={false}
            onClick={onClick}
            onError={() => {
                if (sourceIndex + 1 < sources.length) {
                    setSourceIndex((current) => current + 1);
                    return;
                }
                setExhausted(true);
            }}
        />
    );
}
