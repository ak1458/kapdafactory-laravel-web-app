import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { Calendar, TrendingUp, Package, IndianRupee, ChevronDown, ChevronUp, Banknote, Globe, Download } from 'lucide-react';
import CustomDatePicker from '../components/CustomDatePicker';
import ExportModal from '../components/ExportModal';

export default function DailyCollections() {
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [expandedDate, setExpandedDate] = useState(null);
    const [showExportModal, setShowExportModal] = useState(false);

    const { data: collections, isLoading, error } = useQuery({
        queryKey: ['daily-collections', dateFrom, dateTo],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (dateFrom) params.append('date_from', dateFrom);
            if (dateTo) params.append('date_to', dateTo);
            const res = await api.get(`/daily-collections?${params}`);
            return res.data;
        },
        retry: 1,
        staleTime: 30000
    });

    // Handle new API format with collections and totals
    const collectionsArray = Array.isArray(collections?.collections) ? collections.collections : (Array.isArray(collections) ? collections : []);
    const paymentTotals = collections?.totals || { cash: 0, upi: 0, online: 0 };

    const totalCollections = collectionsArray.reduce((sum, day) => sum + (day.total_collected || 0), 0);
    const totalOrders = collectionsArray.reduce((sum, day) => sum + (day.orders_count || 0), 0);

    return (
        <div className=min-h-screen bg-[#F5F1E8] pb-20>
            {/* Header */}
            <header className=glass-header-green text-white p-4 sticky top-0 z-10>
                <div className=flex justify-between items-center>
                    <div>
                        <h1 className=text-xl font-bold flex items-center gap-2>
                            <TrendingUp size={24} />
                            Daily Collections
                        </h1>
                        <p className=text-xs opacity-80 mt-1>Track payments by actual delivery date</p>
                    </div>
                    <button
                        onClick={() => setShowExportModal(true)}
                        className=p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors flex items-center gap-2
                        title=Export Data
                    >
                        <Download size={18} />
                        <span className=text-xs font-bold hidden sm:inline>Export</span>
                    </button>
                </div>
            </header>

            {/* Filters */}
            <div className=p-4 space-y-3>
                <div className=glass rounded-2xl p-4>
                    <h3 className=text-xs font-bold text-gray-400 uppercase tracking-wider mb-3>Date Range</h3>
                    <div className=grid grid-cols-2 gap-3>
                        <div>
                            <label className=text-xs font-bold text-gray-500 mb-1 block>From</label>
                            <CustomDatePicker
                                selected={dateFrom}
                                onChange={(date) => setDateFrom(date)}
                                placeholder=Start Date
                            />
                        </div>
                        <div>
                            <label className=text-xs font-bold text-gray-500 mb-1 block>To</label>
                            <CustomDatePicker
                                selected={dateTo}
                                onChange={(date) => setDateTo(date)}
                                placeholder=End Date
                            />
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className=grid grid-cols-2 gap-3>
                    <div className=bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white shadow-lg>
                        <div className=flex items-center gap-2 mb-1>
                            <IndianRupee size={16} />
                            <p className=text-xs font-bold opacity-90>Total Collected</p>
                        </div>
                        <p className=text-2xl font-bold>â‚¹{totalCollections}</p>
                    </div>
                    <div className=bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg>
                        <div className=flex items-center gap-2 mb-1>
                            <Package size={16} />
                            <p className=text-xs font-bold opacity-90>Orders Delivered</p>
                        </div>
                        <p className=text-2xl font-bold>{totalOrders}</p>
                    </div>
                </div>

                {/* Payment Method Breakdown - Cash and Online only */}
                <div className=grid grid-cols-2 gap-3>
                    <div className=glass-card rounded-xl p-4>
                        <div className=flex items-center gap-2 mb-1>
                            <Banknote size={16} className=text-green-600 />
                            <p className=text-xs font-bold text-gray-500 uppercase>Cash</p>
                        </div>
                        <p className=text-xl font-bold text-green-600>â‚¹{paymentTotals.cash || 0}</p>
                    </div>
                    <div className=glass-card rounded-xl p-4>
                        <div className=flex items-center gap-2 mb-1>
                            <Globe size={16} className=text-blue-600 />
                            <p className=text-xs font-bold text-gray-500 uppercase>Online</p>
                        </div>
                        <p className=text-xl font-bold text-blue-600>â‚¹{paymentTotals.online || 0}</p>
                    </div>
                </div>
            </div>

            {/* Collections List */}
            <div className=px-4 space-y-3>
                {isLoading ? (
                    <div className=text-center py-8 text-gray-500>Loading...</div>
                ) : error ? (
                    <div className=text-center py-8 text-red-500>
                        <p className=font-bold>Error loading collections</p>
                        <p className=text-sm mt-2>{error.message}</p>
                    </div>
                ) : collectionsArray.length === 0 ? (
                    <div className=text-center py-8 text-gray-500>
                        <Calendar size={48} className=mx-auto mb-2 opacity-50 />
                        <p>No collections found</p>
                    </div>
                ) : (
                    collectionsArray.map((day) => (
                        <div key={day.date} className=glass-card rounded-xl overflow-hidden>
                            {/* Date Header */}
                            <button
                                onClick={() => setExpandedDate(expandedDate === day.date ? null : day.date)}
                                className=w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors
                            >
                                <div className=flex items-center gap-3>
                                    <div className=w-12 h-12 bg-gradient-to-br from-teal-50 to-green-50 rounded-xl flex items-center justify-center>
                                        <Calendar size={20} className=text-teal-600 />
                                    </div>
                                    <div className=text-left>
                                        <p className=font-bold text-gray-900>
                                            {new Date(day.date).toLocaleDateString('en-IN', {
                                                weekday: 'short',
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </p>
                                        <p className=text-xs text-gray-500>{day.orders_count} orders</p>
                                    </div>
                                </div>
                                <div className=flex items-center gap-3>
                                    <div className=text-right>
                                        <p className=text-lg font-bold text-green-600>â‚¹{day.total_collected}</p>
                                    </div>
                                    {expandedDate === day.date ? (
                                        <ChevronUp size={20} className=text-gray-400 />
                                    ) : (
                                        <ChevronDown size={20} className=text-gray-400 />
                                    )}
                                </div>
                            </button>

                            {/* Expanded Orders */}
                            {expandedDate === day.date && (
                                <div className=border-t border-gray-100 bg-gray-50 p-4 space-y-2>
                                    {day.orders.map((order) => (
                                        <div
                                            key={order.id}
                                            className=glass-card rounded-lg p-3 flex items-center justify-between
                                        >
                                            <div>
                                                <p className=font-bold text-sm text-gray-900>#{order.token}</p>
                                                <p className=text-xs text-gray-600>{order.customer_name}</p>
                                            </div>
                                            <div className=text-right>
                                                <p className=text-sm font-bold text-green-600>â‚¹{order.paid_amount}</p>
                                                {order.balance > 0 && (
                                                    <p className=text-xs text-red-500>â‚¹{order.balance} pending</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Export Modal */}
            <ExportModal
                isOpen={showExportModal}
                onClose={() => setShowExportModal(false)}
                exportType=collections
            />
        </div>
    );
}

