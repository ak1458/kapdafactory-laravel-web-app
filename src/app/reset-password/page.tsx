'use client';

import { Suspense } from 'react';
import ResetPassword from '@/src/ui-pages/ResetPassword';

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50 text-center p-10 text-gray-500">Loading form...</div>}>
            <ResetPassword />
        </Suspense>
    );
}

