'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/context/AuthContext';

export default function ProtectedRoute({ children }) {
    const { token, loading } = useAuth();
    const router = useRouter();
    const [storedToken, setStoredToken] = useState(null);

    useEffect(() => {
        try {
            setStoredToken(localStorage.getItem('token'));
        } catch {
            setStoredToken(null);
        }
    }, [token]);

    const effectiveToken = token || storedToken;

    useEffect(() => {
        if (!loading && !effectiveToken) {
            router.replace('/login');
        }
    }, [loading, effectiveToken, router]);

    if (loading || !effectiveToken) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#ECE5DD]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            </div>
        );
    }

    return children;
}
