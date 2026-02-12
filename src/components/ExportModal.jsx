'use client';

import { useState } from 'react';
import { X, Download, Calendar, FileText, CheckSquare, Square, Sparkles } from 'lucide-react';
import CustomDatePicker from './CustomDatePicker';

const getToday = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const getDateDaysAgo = (days) => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const getMonthStart = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
};

export default function ExportModal({ isOpen, onClose, exportType = 'orders' }) {
    const [dateRange, setDateRange] = useState('today');
    const [customFrom, setCustomFrom] = useState('');
    const [customTo, setCustomTo] = useState('');
    const [fields, setFields] = useState({
        token: true,
        token_date: true,
        entry_date: true,
        customer: true,
        delivery_date: true,
        amount: true,
        status: true,
        payment_method: true,
        remarks: false,
    });

    if (!isOpen) return null;

    const toggleField = (field) => {
        setFields((prev) => ({ ...prev, [field]: !prev[field] }));
    };

    const getDateParams = () => {
        switch (dateRange) {
            case 'today':
                return { from: getToday(), to: getToday() };
            case 'week':
                return { from: getDateDaysAgo(7), to: getToday() };
            case 'month':
                return { from: getMonthStart(), to: getToday() };
            case 'custom':
                return { from: customFrom, to: customTo };
            default:
                return { from: '', to: '' };
        }
    };

    const handleExport = () => {
        const { from, to } = getDateParams();
        const params = new URLSearchParams();

        if (from) params.append('date_from', from);
        if (to) params.append('date_to', to);

        if (exportType === 'orders') {
            const selectedFields = Object.entries(fields)
                .filter(([, selected]) => selected)
                .map(([field]) => field);
            params.append('fields', selectedFields.join(','));
        }

        const endpoint = exportType === 'collections' ? '/api/export/collections' : '/api/export/orders';
        window.open(`${endpoint}?${params}`, '_blank');
        onClose();
    };

    const dateOptions = [
        { id: 'today', label: 'Today', icon: 'T' },
        { id: 'week', label: 'Last 7 Days', icon: '7D' },
        { id: 'month', label: 'This Month', icon: 'M' },
        { id: 'custom', label: 'Custom', icon: 'C' },
    ];

    const fieldOptions = [
        { id: 'token', label: 'Token No.' },
        { id: 'token_date', label: 'Token Date' },
        { id: 'entry_date', label: 'Entry Date' },
        { id: 'customer', label: 'Customer Name' },
        { id: 'delivery_date', label: 'Delivery Date' },
        { id: 'amount', label: 'Amount' },
        { id: 'status', label: 'Status' },
        { id: 'payment_method', label: 'Payment Method' },
        { id: 'remarks', label: 'Remarks' },
    ];

    const selectedCount = Object.values(fields).filter(Boolean).length;

    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
            onClick={onClose}
        >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-md" />

            <div
                className="relative bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md shadow-2xl overflow-hidden max-h-[80vh] sm:max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-300 mb-20 sm:mb-0"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="relative overflow-hidden flex-shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#075E54] via-[#128C7E] to-[#25D366]" />
                    <div
                        className="absolute inset-0 opacity-20"
                        style={{
                            backgroundImage:
                                'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.2) 1px, transparent 1px)',
                            backgroundSize: '20px 20px',
                        }}
                    />

                    <div className="relative p-5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                    <Download size={20} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">Export Data</h3>
                                    <p className="text-xs text-white/70">Download as CSV file</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                            >
                                <X size={18} className="text-white" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-5 space-y-5 overflow-y-auto flex-1 bg-gray-50/50">
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-3">
                            <Calendar size={14} className="text-teal-600" />
                            Date Range
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {dateOptions.map((opt) => (
                                <button
                                    key={opt.id}
                                    onClick={() => setDateRange(opt.id)}
                                    className={`py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${dateRange === opt.id
                                        ? 'bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white shadow-lg shadow-green-500/25'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 active:scale-[0.98]'
                                        }`}
                                >
                                    <span>{opt.icon}</span>
                                    {opt.label}
                                </button>
                            ))}
                        </div>

                        {dateRange === 'custom' && (
                            <div className="grid grid-cols-2 gap-3 mt-4 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-2 block">From Date</label>
                                    <div className="bg-white rounded-lg border border-gray-200 p-2">
                                        <CustomDatePicker
                                            selected={customFrom}
                                            onChange={setCustomFrom}
                                            placeholder="Start date"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-2 block">To Date</label>
                                    <div className="bg-white rounded-lg border border-gray-200 p-2">
                                        <CustomDatePicker
                                            selected={customTo}
                                            onChange={setCustomTo}
                                            placeholder="End date"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {exportType === 'orders' && (
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-3">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                    <FileText size={14} className="text-teal-600" />
                                    Include Fields
                                </label>
                                <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded-full">
                                    {selectedCount} selected
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {fieldOptions.map((opt) => (
                                    <button
                                        key={opt.id}
                                        onClick={() => toggleField(opt.id)}
                                        className={`py-2.5 px-3 rounded-xl text-sm font-medium transition-all flex items-center gap-2 active:scale-[0.98] ${fields[opt.id]
                                            ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-2 border-green-300 shadow-sm'
                                            : 'bg-gray-50 text-gray-500 border-2 border-gray-100 hover:border-gray-200'
                                            }`}
                                    >
                                        {fields[opt.id] ? (
                                            <CheckSquare size={16} className="text-green-600 flex-shrink-0" />
                                        ) : (
                                            <Square size={16} className="text-gray-400 flex-shrink-0" />
                                        )}
                                        <span className="truncate text-xs font-semibold">{opt.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-5 border-t border-gray-100 flex-shrink-0 bg-white">
                    <button
                        onClick={handleExport}
                        className="w-full py-4 rounded-2xl font-bold bg-gradient-to-r from-[#075E54] via-[#128C7E] to-[#25D366] text-white shadow-xl shadow-green-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-base"
                    >
                        <Download size={20} />
                        Export to CSV
                        <Sparkles size={16} className="opacity-70" />
                    </button>
                </div>
            </div>
        </div>
    );
}
