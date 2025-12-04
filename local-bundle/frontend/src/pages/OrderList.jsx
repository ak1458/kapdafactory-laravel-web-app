import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import SearchBar from '../components/SearchBar';
import FilterChips from '../components/FilterChips';
import OrderCard from '../components/OrderCard';
import { AlertCircle, Inbox, Calendar } from 'lucide-react';

export default function OrderList() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('all');
    const [dateFilter, setDateFilter] = useState('');
    const [sortOrder, setSortOrder] = useState('desc');

    const { data, isLoading, error } = useQuery({
        queryKey: ['orders', search, status, dateFilter, sortOrder],
        queryFn: async () => {
            const params = {
                search,
                status,
                sort_by: 'delivery_date',
                sort_order: sortOrder
            };
            if (dateFilter) {
                params.date_from = dateFilter;
                params.date_to = dateFilter;
            }
            const res = await api.get('/orders', { params });
            return res.data;
        },
        keepPreviousData: true,
    });

    return (
        <div className="min-h-screen bg-gray-50 pb-20 font-sans">
            {/* Header */}
            <header className="bg-[#075E54] px-4 py-3 flex justify-between items-center shadow-md sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <img src="/logo.png" alt="KapdaFactory" className="h-12 w-auto object-contain" />
                </div>
                <button
                    onClick={() => navigate('/login')}
                    className="bg-white/20 text-white px-4 py-1.5 rounded-full text-sm font-bold hover:bg-white/30 transition-colors border border-white/10"
                >
                    Logout
                </button>
            </header>

            <div className="sticky top-[70px] z-40 bg-whatsapp-bg pt-2 pb-2 px-4 transition-all space-y-3">
                <SearchBar onSearch={setSearch} />
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <input
                            type="date"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 shadow-sm"
                        />
                        <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                    {dateFilter && (
                        <button
                            onClick={() => setDateFilter('')}
                            className="px-4 py-2 bg-gray-200 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-300 transition-colors"
                        >
                            Clear
                        </button>
                    )}
                    <button
                        onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                        className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                        <Calendar size={14} />
                        {sortOrder === 'desc' ? 'Latest Delivery' : 'Earliest Delivery'}
                    </button>
                </div>
                <FilterChips status={status} onChange={setStatus} />
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
                <div className="space-y-6 pb-20 px-6">
                    {Object.entries(
                        data?.data?.reduce((groups, order) => {
                            const date = order.delivery_date ? order.delivery_date.split('T')[0] : 'No Date';
                            if (!groups[date]) groups[date] = [];
                            groups[date].push(order);
                            return groups;
                        }, {}) || {}
                    ).sort(([dateA], [dateB]) => {
                        if (dateA === 'No Date') return 1;
                        if (dateB === 'No Date') return -1;
                        const dateObjA = new Date(dateA);
                        const dateObjB = new Date(dateB);
                        return sortOrder === 'desc' ? dateObjB - dateObjA : dateObjA - dateObjB;
                    }).map(([date, orders]) => {
                        const stats = orders.reduce((acc, order) => {
                            acc[order.status] = (acc[order.status] || 0) + 1;
                            return acc;
                        }, {});

                        return (
                            <div key={date}>
                                <div className="flex items-center justify-center mb-3 sticky top-[140px] z-30 pointer-events-none">
                                    <div className="bg-white/80 backdrop-blur-sm px-3 py-1 rounded-lg shadow-sm border border-gray-100 flex items-center gap-2">
                                        <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider flex items-center gap-2">
                                            <Calendar size={12} />
                                            {date === 'No Date' ? 'No Date' : new Date(date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                        </h3>
                                        <div className="flex gap-1 text-[10px] font-bold border-l border-gray-300 pl-2">
                                            {stats.pending && <span className="text-amber-600">{stats.pending}P</span>}
                                            {stats.ready && <span className="text-blue-600">{stats.ready}R</span>}
                                            {stats.delivered && <span className="text-green-600">{stats.delivered}D</span>}
                                            {stats.transferred && <span className="text-purple-600">{stats.transferred}T</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    {orders.map(order => (
                                        <OrderCard key={order.id} order={order} />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
