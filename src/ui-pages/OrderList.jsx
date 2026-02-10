'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useNavigate } from '@/src/lib/router';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import FilterChips from '../components/FilterChips';
import OrderCard from '../components/OrderCard';
import CustomDatePicker from '../components/CustomDatePicker';
import ExportModal from '../components/ExportModal';
import { AlertCircle, Inbox, Calendar, LogOut, Search, X, Download } from 'lucide-react';

const SEARCH_DEBOUNCE_MS = 350;
const PAGE_SIZE = 30;

export default function OrderList() {
    const navigate = useNavigate();
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('all');
    const [dateFilter, setDateFilter] = useState('');
    const [sortOrder, setSortOrder] = useState('desc');
    const [showExportModal, setShowExportModal] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput.trim());
        }, SEARCH_DEBOUNCE_MS);

        return () => clearTimeout(timer);
    }, [searchInput]);

    const logout = async () => {
        try {
            await api.post('/logout');
        } catch {
            // Ignore logout API failures and clear local state anyway.
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login');
        }
    };

    const { data, isLoading, isFetching, error, refetch } = useQuery({
        queryKey: ['orders', search, status, dateFilter, sortOrder],
        queryFn: async () => {
            const params = {
                search,
                status,
                sort_by: 'created_at',
                sort_order: sortOrder,
                per_page: PAGE_SIZE,
            };

            if (dateFilter) {
                params.date_from = dateFilter;
                params.date_to = dateFilter;
                params.date = dateFilter;
            }

            const res = await api.get('/orders', { params });
            return res.data;
        },
        placeholderData: (previousData) => previousData,
        staleTime: 0,
        refetchOnWindowFocus: true,
    });

    const orders = data?.data || [];
    const responseData = data || {};
    const showInitialLoading = isLoading && !data;

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
                            <p className="text-xl font-bold">Rs {responseData?.total_collection || 0}</p>
                        </div>
                        <div className="bg-white/10 rounded-xl p-2 backdrop-blur-sm">
                            <p className="text-xs text-red-100 uppercase tracking-wider font-medium">Pending</p>
                            <p className="text-xl font-bold">Rs {responseData?.total_pending || 0}</p>
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
            <header className="flex-none glass-header-green text-white p-4 z-50">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Image
                            src="/logo.png"
                            alt="KapdaFactory"
                            width={112}
                            height={32}
                            unoptimized
                            className="h-8 w-auto object-contain"
                        />
                        <div>
                            <h1 className="text-lg font-bold">Search Orders</h1>
                            <p className="text-xs opacity-80">Find and manage all orders</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowExportModal(true)}
                            className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                            title="Export Data"
                        >
                            <Download size={18} />
                        </button>
                        <button
                            onClick={logout}
                            className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                            title="Logout"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 flex flex-col p-4 pb-20 overflow-y-auto scrollbar-hide">
                <div className="glass rounded-2xl p-3 flex flex-col gap-3 mb-4 sticky top-0 z-40">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search orders..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 rounded-lg border-0 text-gray-900 text-sm font-medium placeholder-gray-400 focus:ring-2 focus:ring-teal-500/20 transition-all"
                        />
                    </div>

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

                    <div className="flex items-stretch gap-2 pt-2 border-t border-gray-50">
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

                        <button
                            onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
                            className="flex-none bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl px-4 py-3 border border-gray-200 shadow-sm hover:shadow-md transition-all group"
                        >
                            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Sort Order</div>
                            <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
                                <Calendar size={14} className="text-teal-600" />
                                {sortOrder === 'desc' ? 'Latest' : 'Oldest'}
                            </div>
                        </button>
                    </div>
                </div>

                {renderDailySummary()}

                {showInitialLoading ? (
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
                            onClick={() => refetch()}
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
                    <div className="space-y-0.5">
                        {orders.map((order) => (
                            <OrderCard key={order.id} order={order} />
                        ))}
                        {isFetching && (
                            <div className="py-3 text-center text-xs font-medium text-gray-500">Refreshing...</div>
                        )}
                    </div>
                )}
            </main>

            <ExportModal isOpen={showExportModal} onClose={() => setShowExportModal(false)} exportType="orders" />
        </div>
    );
}
