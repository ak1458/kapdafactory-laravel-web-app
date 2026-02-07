import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import FilterChips from '../components/FilterChips';
import OrderCard from '../components/OrderCard';
import CustomDatePicker from '../components/CustomDatePicker';
import { AlertCircle, Inbox, Calendar, LogOut, Search, X } from 'lucide-react';

export default function OrderList() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('all');
    const [dateFilter, setDateFilter] = useState('');
    const [sortOrder, setSortOrder] = useState('desc');

    const logout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

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
                params.date = dateFilter; // For dashboard stats
            }
            const res = await api.get('/orders', { params });
            return res.data;
        },
        keepPreviousData: true,
    });

    const orders = data?.data || [];
    const responseData = data || {};

    // Safe Date Formatter
    const formatDateSafe = (dateString) => {
        try {
            if (!dateString) return 'Select Date';
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Invalid Date';
            return date.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });
        } catch {
            return 'Invalid Date';
        }
    };

    // Daily Summary Dashboard
    const renderDailySummary = () => {
        if (!dateFilter || !orders.length) return null;

        return (
            <div className="mx-4 mt-4 mb-2">
                <div className="bg-gradient-to-br from-[#075E54] to-[#128C7E] rounded-2xl p-4 text-white shadow-lg">
                    <div className="flex justify-between items-center mb-3 border-b border-white/20 pb-2">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            <Calendar size={18} />
                            {formatDateSafe(dateFilter)}
                        </h3>
                        <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm">
                            Daily Summary
                        </span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="bg-white/10 rounded-xl p-2 backdrop-blur-sm">
                            <p className="text-xs text-green-100 uppercase tracking-wider font-medium">Collection</p>
                            <p className="text-xl font-bold">₹{responseData?.total_collection || 0}</p>
                        </div>
                        <div className="bg-white/10 rounded-xl p-2 backdrop-blur-sm">
                            <p className="text-xs text-red-100 uppercase tracking-wider font-medium">Pending</p>
                            <p className="text-xl font-bold">₹{responseData?.total_pending || 0}</p>
                        </div>
                        <div className="bg-white/10 rounded-xl p-2 backdrop-blur-sm">
                            <p className="text-xs text-blue-100 uppercase tracking-wider font-medium">Total Orders</p>
                            <p className="text-xl font-bold">{responseData?.total_orders || 0}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                        <div className="bg-white/5 rounded-lg p-1.5">
                            <p className="text-[10px] text-gray-200">Dues Cleared</p>
                            <p className="font-bold text-sm">{responseData?.dues_cleared || 0}</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-1.5">
                            <p className="text-[10px] text-gray-200">Partial Paid</p>
                            <p className="font-bold text-sm">{responseData?.partial_payments || 0}</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-1.5">
                            <p className="text-[10px] text-gray-200">Fully Paid</p>
                            <p className="font-bold text-sm">{responseData?.full_payments || 0}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex-1 flex flex-col bg-[#ECE5DD] font-sans h-full">
            {/* Header */}
            <header className="flex-none bg-gradient-to-r from-[#25D366] to-[#128C7E] px-4 py-3 flex justify-between items-center shadow-md z-50">
                <div className="flex items-center gap-3">
                    <img src="/logo.png" alt="KapdaFactory" className="h-8 w-auto object-contain" />
                    <h1 className="text-lg font-bold text-white tracking-wide">KapdaFactory</h1>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={logout} className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                        <LogOut size={20} />
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col p-4 pb-24 overflow-y-auto scrollbar-hide">

                {/* Search & Filters Card */}
                <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex flex-col gap-3 mb-4 sticky top-0 z-40">
                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search orders..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 rounded-lg border-0 text-gray-900 text-sm font-medium placeholder-gray-400 focus:ring-2 focus:ring-teal-500/20 transition-all"
                        />
                    </div>

                    {/* Filters */}
                    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                        <FilterChips
                            status={status}
                            onChange={setStatus}
                            options={[
                                { value: 'all', label: 'All' },
                                { value: 'pending', label: 'Pending' },
                                { value: 'ready', label: 'Ready' },
                                { value: 'delivered', label: 'Delivered' },
                                { value: 'transferred', label: 'Transferred' },
                            ]}
                        />
                    </div>

                    {/* Date & Sort */}
                    <div className="flex items-stretch gap-2 pt-2 border-t border-gray-50">
                        {/* Date Picker Card */}
                        <div className="flex-1 bg-gradient-to-br from-teal-50 to-green-50 rounded-xl p-3 border border-teal-100 shadow-sm">
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex-1">
                                    <label className="text-[10px] font-bold text-teal-700 uppercase tracking-wider mb-1 block">
                                        Filter by Date
                                    </label>
                                    <CustomDatePicker
                                        selected={dateFilter}
                                        onChange={(date) => setDateFilter(date)}
                                        placeholder="Select Date"
                                        className="text-sm font-bold text-gray-800"
                                    />
                                </div>
                                {dateFilter && (
                                    <button
                                        onClick={() => setDateFilter('')}
                                        className="flex-none p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                        title="Clear Date"
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Sort Button Card */}
                        <button
                            onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                            className="flex-none bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl px-4 py-3 border border-gray-200 shadow-sm hover:shadow-md transition-all group"
                        >
                            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                                Sort Order
                            </div>
                            <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
                                <Calendar size={14} className="text-teal-600" />
                                {sortOrder === 'desc' ? 'Latest' : 'Oldest'}
                            </div>
                        </button>
                    </div>
                </div>

                {/* Daily Summary */}
                {renderDailySummary()}

                {/* Order List */}
                {
                    isLoading ? (
                        <div className="flex flex-col items-center justify-center py-10 space-y-4 animate-pulse">
                            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                            <div className="h-3 w-24 bg-gray-200 rounded"></div>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-3">
                                <AlertCircle size={24} className="text-red-500" />
                            </div>
                            <p className="text-gray-500 text-xs">Failed to load orders</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="mt-3 px-4 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-bold"
                            >
                                Retry
                            </button>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center opacity-50">
                            <Inbox size={32} className="text-gray-400 mb-2" />
                            <p className="text-gray-400 text-xs font-medium">No orders found</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {Object.entries(
                                orders.reduce((groups, order) => {
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
                                        <div className="flex items-center justify-center mb-3">
                                            <div className="bg-white/60 backdrop-blur-sm px-3 py-1 rounded-full border border-white/50 flex items-center gap-2 shadow-sm">
                                                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                                                    <Calendar size={10} />
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
                                        <div className="space-y-3">
                                            {orders.map(order => (
                                                <OrderCard key={order.id} order={order} />
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )
                }
            </main >
        </div >
    );
}
