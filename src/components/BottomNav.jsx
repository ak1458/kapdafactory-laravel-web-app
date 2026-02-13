'use client';

import { useLocation } from '@/src/lib/router';
import Link from 'next/link';
import { PlusCircle, Search, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function BottomNav() {
    const location = useLocation();
    const { logout } = useAuth();

    const isActive = (path) => location.pathname === path;

    return (
        <div className="fixed bottom-0 left-0 right-0 glass-nav px-6 py-3 flex justify-around items-center z-50 safe-area-bottom">
            <Link
                href="/orders/new"
                prefetch={false}
                className={`flex flex-col items-center gap-1 transition-all active:scale-95 touch-manipulation ${isActive('/orders/new')
                    ? 'text-teal-600'
                    : 'text-gray-400 hover:text-gray-600'
                    }`}
            >
                <PlusCircle size={24} strokeWidth={isActive('/orders/new') ? 2.5 : 2} />
                <span className="text-[10px] font-bold uppercase tracking-wide">New Order</span>
            </Link>

            <Link
                href="/dashboard"
                prefetch={false}
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className={`flex flex-col items-center gap-1 transition-all active:scale-95 touch-manipulation ${isActive('/dashboard')
                    ? 'text-teal-600'
                    : 'text-gray-400 hover:text-gray-600'
                    }`}
            >
                <Search size={24} strokeWidth={isActive('/dashboard') ? 2.5 : 2} />
                <span className="text-[10px] font-bold uppercase tracking-wide">Search</span>
            </Link>

            <Link
                href="/collections"
                prefetch={false}
                className={`flex flex-col items-center gap-1 transition-all active:scale-95 touch-manipulation ${isActive('/collections')
                    ? 'text-teal-600'
                    : 'text-gray-400 hover:text-gray-600'
                    }`}
            >
                <TrendingUp size={24} strokeWidth={isActive('/collections') ? 2.5 : 2} />
                <span className="text-[10px] font-bold uppercase tracking-wide">Collections</span>
            </Link>

            <button
                onClick={() => {
                    if (confirm('Are you sure you want to logout?')) {
                        logout();
                    }
                }}
                className="flex flex-col items-center gap-1 transition-all active:scale-95 touch-manipulation text-red-400 hover:text-red-600"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                <span className="text-[10px] font-bold uppercase tracking-wide">Logout</span>
            </button>
        </div>
    );
}
