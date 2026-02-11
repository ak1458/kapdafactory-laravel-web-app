'use client';

import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: true,
});


api.interceptors.request.use((config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

function normalizePath(value) {
    return String(value || '')
        .trim()
        .replace(/^['"]+|['"]+$/g, '')
        .replace(/\\/g, '/')
        .replace(/^\.\/+/, '')
        .replace(/\/{2,}/g, '/')
        .replace(/^\/+/, '');
}

function addCandidate(target, value) {
    if (!value) return;
    if (!target.includes(value)) {
        target.push(value);
    }
}

function addPathVariants(target, inputPath) {
    const normalized = normalizePath(inputPath);
    if (!normalized) return;

    if (/^https?:\/\//i.test(normalized)) {
        addCandidate(target, normalized);
        return;
    }

    if (normalized.startsWith('api/storage/')) {
        addCandidate(target, `/${normalized}`);
        return;
    }

    const withoutPublic = normalized.replace(/^public\//i, '');
    const storageRelative = withoutPublic.replace(/^storage\//i, '');

    addCandidate(target, `/api/storage/${storageRelative}`);

    if (withoutPublic.startsWith('storage/')) {
        addCandidate(target, `/${withoutPublic}`);
        return;
    }

    if (withoutPublic.startsWith('uploads/')) {
        addCandidate(target, `/storage/${withoutPublic}`);
        addCandidate(target, `/${withoutPublic}`);
        return;
    }

    addCandidate(target, `/storage/${withoutPublic}`);
    addCandidate(target, `/${withoutPublic}`);
}

export const getStorageCandidates = (image) => {
    const candidates = [];

    if (typeof image === 'string') {
        addPathVariants(candidates, image);
        return candidates;
    }

    if (image && typeof image === 'object') {
        addPathVariants(candidates, image.url);
        addPathVariants(candidates, image.filename);
    }

    return candidates;
};

// Helper to get proper storage URL for images
export const getStorageUrl = (image) => getStorageCandidates(image)[0] || null;

export default api;
