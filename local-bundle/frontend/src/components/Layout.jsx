import { useLocation } from 'react-router-dom';
import BottomNav from './BottomNav';

export default function Layout({ children }) {
    const location = useLocation();
    const isCreateOrder = location.pathname === '/' || location.pathname === '/orders/create' || location.pathname === '/dashboard';

    return (
        <div className="min-h-screen bg-gray-100 flex justify-center items-start pt-0 sm:pt-10 font-sans">
            <div className="w-full max-w-md bg-white min-h-screen sm:min-h-[calc(100vh-40px)] sm:rounded-3xl shadow-2xl relative overflow-hidden flex flex-col">
                <main className={`flex-1 overflow-y-auto scrollbar-hide flex flex-col ${isCreateOrder ? 'pb-0' : 'pb-20'}`}>
                    {children}
                </main>
                <BottomNav />
            </div>
        </div>
    );
}
