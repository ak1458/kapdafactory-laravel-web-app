import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import SearchBar from '../components/SearchBar';
import FilterChips from '../components/FilterChips';
import OrderCard from '../components/OrderCard';
import { AlertCircle, Inbox } from 'lucide-react';

export default function OrderList() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('all');

    const { data, isLoading, error } = useQuery({
        queryKey: ['orders', search, status],
        queryFn: async () => {
            const params = { search, status };
            const res = await api.get('/orders', { params });
            return res.data;
        },
        keepPreviousData: true,
    });

    return (
        <div className="min-h-screen bg-gray-50 pb-20 font-sans">
            {/* Header */}
            <header className="bg-white px-6 py-4 flex justify-between items-center shadow-sm sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <img src="/logo.png" alt="KapdaFactory" className="h-12 w-auto object-contain" />
                </div>
                <button
                    onClick={() => navigate('/login')}
                    className="bg-red-50 text-red-500 px-4 py-1.5 rounded-full text-sm font-medium hover:bg-red-100 transition-colors"
                >
                    Logout
                </button>
            </header>

            <div className="sticky top-[80px] z-40 bg-gray-50 pt-4 pb-2 px-6 transition-all">
                <SearchBar onSearch={setSearch} />
                <div className="mt-3">
                    <FilterChips status={status} onChange={setStatus} />
                </div>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4 animate-pulse">
                    <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                    <div className="h-4 w-32 bg-slate-200 rounded"></div>
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                        <AlertCircle size={32} className="text-red-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">Failed to load orders</h3>
                    <p className="text-slate-500 mt-1 text-sm">Please check your connection and try again.</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-6 px-6 py-2 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            ) : data?.data?.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                        <Inbox size={40} className="text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">No orders found</h3>
                    <p className="text-slate-500 mt-1 text-sm">Try adjusting your search or filters.</p>
                </div>
            ) : (
                <div className="space-y-1 pb-20 px-6">
                    {data?.data?.map((order) => (
                        <OrderCard key={order.id} order={order} />
                    ))}
                </div>
            )}
        </div>
    );
}
