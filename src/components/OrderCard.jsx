'use client';

import { Link } from '@/src/lib/router';
import { Calendar, Package, ChevronRight, Clock } from 'lucide-react';
import clsx from 'clsx';
import OrderImage from './OrderImage';

export default function OrderCard({ order }) {
    const statusConfig = {
        pending: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100', dot: 'bg-amber-500' },
        ready: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-100', dot: 'bg-indigo-500' },
        delivered: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100', dot: 'bg-emerald-500' },
        transferred: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-100', dot: 'bg-purple-500' },
    };

    const status = statusConfig[order?.status] || statusConfig.pending;
    const billNumber = typeof order?.bill_number === 'string' ? order.bill_number : '';
    const billLabel = billNumber ? (billNumber.startsWith('BILL-') ? billNumber : `BILL-${billNumber}`) : null;

    if (!order?.id) {
        console.warn('OrderCard: missing order id', order);
        return null; // Or render a placeholder?
    }

    return (
        <Link
            to={`/orders/${order.id}`}
            className="group block glass-card rounded-2xl p-4 mb-3 transition-all duration-300 active:scale-[0.98] hover:shadow-[0_8px_32px_rgba(0,0,0,0.1)]"
        >
            <div className="flex justify-between items-start mb-3">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 text-lg">#{order?.token}</span>
                        {billLabel && (
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px] font-medium tracking-wide uppercase">
                                {billLabel}
                            </span>
                        )}
                    </div>
                </div>
                <div className={clsx('pl-2 pr-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border', status.bg, status.text, status.border)}>
                    <div className={clsx('w-1.5 h-1.5 rounded-full', status.dot)}></div>
                    <span className="capitalize">{order.status}</span>
                </div>
            </div>

            <div className="flex gap-4 items-center">
                {/* Thumbnail */}
                <div className="w-16 h-16 bg-slate-50 rounded-xl flex-shrink-0 overflow-hidden border border-slate-100 shadow-inner relative group-hover:ring-2 ring-indigo-50 transition-all">
                    {order.images && order.images.length > 0 ? (
                        <OrderImage
                            image={order.images[0]}
                            alt="Order thumbnail"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            fallback={
                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                    <Package size={24} strokeWidth={1.5} />
                                </div>
                            }
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <Package size={24} strokeWidth={1.5} />
                        </div>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-slate-900 truncate">
                        {order.customer_name || 'Walk-in Customer'}
                    </h3>

                    <div className="flex items-center gap-4 mt-1.5">
                        {order.entry_date && (
                            <div className="flex items-center text-xs text-teal-600 font-medium">
                                <Clock size={13} className="mr-1.5 text-teal-500" />
                                {new Date(order.entry_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </div>
                        )}
                        <div className="flex items-center text-xs text-slate-500 font-medium">
                            <Calendar size={13} className="mr-1.5 text-slate-400" />
                            {order.delivery_date ? new Date(order.delivery_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No Date'}
                        </div>
                        {order.remarks && (
                            <div className="flex items-center text-xs text-slate-400 truncate max-w-[100px]">
                                <span className="w-1 h-1 rounded-full bg-slate-300 mr-2"></span>
                                {order.remarks}
                            </div>
                        )}
                    </div>
                </div>

                <ChevronRight size={18} className="text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
            </div>
        </Link>
    );
}


