import { useNavigate, useLocation } from 'react-router-dom';
import { PlusCircle, Search } from 'lucide-react';

export default function BottomNav() {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 flex justify-around items-center z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <button
                onClick={() => navigate('/')}
                className={`flex flex-col items-center gap-1 transition-colors ${isActive('/') || isActive('/orders/create')
                        ? 'text-teal-600'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
            >
                <PlusCircle size={24} strokeWidth={isActive('/') ? 2.5 : 2} />
                <span className="text-[10px] font-bold uppercase tracking-wide">New Order</span>
            </button>

            <button
                onClick={() => navigate('/dashboard')}
                className={`flex flex-col items-center gap-1 transition-colors ${isActive('/dashboard')
                        ? 'text-teal-600'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
            >
                <Search size={24} strokeWidth={isActive('/dashboard') ? 2.5 : 2} />
                <span className="text-[10px] font-bold uppercase tracking-wide">Search</span>
            </button>
        </div>
    );
}
