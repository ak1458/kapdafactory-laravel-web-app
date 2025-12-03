import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { ChevronLeft, Trash2, CheckCircle, Truck, Clock, User, Receipt, Calendar, FileText } from 'lucide-react';
import clsx from 'clsx';

export default function OrderDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [note, setNote] = useState('');

    const { data: order, isLoading } = useQuery({
        queryKey: ['order', id],
        queryFn: async () => {
            const res = await api.get(`/orders/${id}`);
            return res.data;
        }
    });

    const statusMutation = useMutation({
        mutationFn: async (newStatus) => {
            await api.put(`/orders/${id}/status`, { status: newStatus, note });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['order', id]);
            setNote('');
        }
    });

    const deleteImageMutation = useMutation({
        mutationFn: async (imageId) => {
            await api.delete(`/orders/${id}/images/${imageId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['order', id]);
        }
    });

    if (isLoading) return <div className="p-4 text-center">Loading...</div>;
    if (!order) return <div className="p-4 text-center">Order not found</div>;

    return (
        <div className="pb-24 bg-gray-50 min-h-screen font-sans">
            {/* Header */}
            <header className="bg-white px-6 py-4 flex justify-between items-center shadow-sm sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <img src="/logo.png" alt="KapdaFactory" className="h-10 w-auto object-contain" />
                </div>
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 -mr-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <ChevronLeft size={24} />
                </button>
            </header>

            <main className="px-6 py-6 space-y-6">
                {/* Title & Status */}
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Order #{order?.token}
                        </h1>
                        <p className="text-sm text-gray-500 font-medium mt-1">
                            {order?.created_at ? new Date(order.created_at).toLocaleDateString() : 'No Date'}
                        </p>
                    </div>
                    <span className={clsx(
                        "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border",
                        order?.status === 'pending' && "bg-amber-50 text-amber-600 border-amber-100",
                        order?.status === 'ready' && "bg-blue-50 text-blue-600 border-blue-100",
                        order?.status === 'delivered' && "bg-green-50 text-green-600 border-green-100"
                    )}>
                        {order?.status}
                    </span>
                </div>

                {/* Customer Info Card */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-600">
                            <User size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Customer</p>
                            <p className="font-semibold text-gray-900">{order?.customer_name || 'Walk-in Customer'}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-600">
                            <Calendar size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Delivery Date</p>
                            <p className="font-semibold text-gray-900">{order?.delivery_date || 'Not Set'}</p>
                        </div>
                    </div>
                </div>



                {/* Images Section */}
                {order?.images?.length > 0 && (
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 mb-3 ml-1">Photos</h3>
                        <div className="grid grid-cols-3 gap-3">
                            {order.images.map((img) => (
                                <div key={img.id} className="relative aspect-square bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 group">
                                    <img
                                        src={`/storage/${img.filename}`}
                                        alt="Order"
                                        className="w-full h-full object-cover"
                                    />
                                    <button
                                        onClick={() => {
                                            if (confirm('Delete image?')) deleteImageMutation.mutate(img.id);
                                        }}
                                        className="absolute top-2 right-2 bg-white/90 text-red-500 p-1.5 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Remarks */}
                {order?.remarks && (
                    <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
                        <h3 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                            <FileText size={14} /> Remarks
                        </h3>
                        <p className="text-sm text-amber-900 leading-relaxed">{order.remarks}</p>
                    </div>
                )}

                {/* Status Actions */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-900 mb-4">Update Status</h3>
                    <input
                        type="text"
                        placeholder="Add a note (optional)..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-teal-500/20 mb-4 transition-all"
                    />
                    <div className="grid grid-cols-3 gap-2">
                        <button
                            onClick={() => statusMutation.mutate('pending')}
                            className={clsx(
                                "py-3 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition-all active:scale-95",
                                order?.status === 'pending'
                                    ? 'bg-amber-100 text-amber-700 ring-2 ring-amber-500/20 shadow-sm'
                                    : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                            )}
                        >
                            <Clock size={18} /> Pending
                        </button>
                        <button
                            onClick={() => statusMutation.mutate('ready')}
                            className={clsx(
                                "py-3 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition-all active:scale-95",
                                order?.status === 'ready'
                                    ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-500/20 shadow-sm'
                                    : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                            )}
                        >
                            <CheckCircle size={18} /> Ready
                        </button>
                        <button
                            onClick={() => statusMutation.mutate('delivered')}
                            className={clsx(
                                "py-3 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition-all active:scale-95",
                                order?.status === 'delivered'
                                    ? 'bg-green-100 text-green-700 ring-2 ring-green-500/20 shadow-sm'
                                    : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                            )}
                        >
                            <Truck size={18} /> Delivered
                        </button>
                    </div>
                </div>

                {/* History Log */}
                <div className="pt-4">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 ml-1">History</h3>
                    <div className="space-y-6 relative pl-4 border-l-2 border-gray-100 ml-2">
                        {order?.logs?.map((log) => (
                            <div key={log.id} className="relative">
                                <div className="absolute -left-[21px] top-0 w-3 h-3 rounded-full bg-gray-200 border-2 border-white shadow-sm"></div>
                                <div className="flex justify-between items-start">
                                    <span className="text-sm font-bold text-gray-700 capitalize">
                                        {log.action.replace('status_changed:', '').replace('_', ' ')}
                                    </span>
                                    <span className="text-[10px] font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
                                        {new Date(log.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="text-xs text-gray-500 mt-0.5">Updated by {log.user?.name || 'Admin'}</div>
                                {log.note && (
                                    <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded-lg italic border border-gray-100">
                                        "{log.note}"
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
