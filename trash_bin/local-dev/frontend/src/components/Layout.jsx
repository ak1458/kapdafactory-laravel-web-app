import { useAuth } from '../context/AuthContext';
import { LogOut, Plus, Menu } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function Layout({ children }) {
    const { logout, user } = useAuth();
    const location = useLocation();

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Sticky Header */}
            <header className="sticky top-0 z-50 bg-white shadow-sm px-4 py-3 flex justify-between items-center">
                <h1 className="text-lg font-bold text-gray-900">KapdaFactory</h1>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{user?.name}</span>
                    <button onClick={logout} className="p-2 text-gray-600 hover:text-red-600">
                        <LogOut size={20} />
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="p-4 max-w-md mx-auto">
                {children}
            </main>

            {/* Floating Action Button (only on list page) */}
            {location.pathname === '/' && (
                <Link
                    to="/orders/create"
                    className="fixed bottom-6 right-6 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-colors"
                >
                    <Plus size={24} />
                </Link>
            )}
        </div>
    );
}
