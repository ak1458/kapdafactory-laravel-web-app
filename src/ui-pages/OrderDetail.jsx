'use client';

import { useState, useEffect, useMemo, useTransition } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import api from '../lib/api';
import OrderImage from '../components/OrderImage';
import { ChevronLeft, Edit, Trash2, User, Calendar, X, Clock, Scissors, Truck, ArrowRightLeft, Banknote, Globe } from 'lucide-react';
import clsx from 'clsx';

const DeliveryDatePicker = dynamic(() => import('../components/CustomDatePicker'), {
    ssr: false,
    loading: () => (
        <div className="w-full py-2 text-sm text-gray-400 font-medium">
            Loading calendar...
        </div>
    ),
});

const STATUS_TIMELINE_CONFIG = {
    pending: {
        icon: Clock,
        label: 'Pending',
        dotClass: 'bg-amber-100',
        iconClass: 'text-amber-600',
        labelClass: 'text-amber-600',
    },
    ready: {
        icon: Scissors,
        label: 'Ready',
        dotClass: 'bg-blue-100',
        iconClass: 'text-blue-600',
        labelClass: 'text-blue-600',
    },
    delivered: {
        icon: Truck,
        label: 'Delivered',
        dotClass: 'bg-green-100',
        iconClass: 'text-green-600',
        labelClass: 'text-green-600',
    },
    transferred: {
        icon: ArrowRightLeft,
        label: 'Transferred',
        dotClass: 'bg-purple-100',
        iconClass: 'text-purple-600',
        labelClass: 'text-purple-600',
    },
};

const DEFAULT_TIMELINE_CONFIG = {
    icon: Clock,
    label: 'Status',
    dotClass: 'bg-gray-100',
    iconClass: 'text-gray-600',
    labelClass: 'text-gray-600',
};

const PREVIEW_IMAGE_LIMIT = 6;
const PREVIEW_PAYMENT_LIMIT = 12;
const PREVIEW_LOG_LIMIT = 16;

export default function OrderDetail({ initialOrder }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const [order, setOrder] = useState(initialOrder);

    // Sync state with props when server re-renders (e.g. after router.refresh())
    useEffect(() => {
        setOrder(initialOrder);
    }, [initialOrder]);

    const [deleting, setDeleting] = useState(false);
    const [statusUpdating, setStatusUpdating] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [showDeliveryModal, setShowDeliveryModal] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [actualDeliveryDate, setActualDeliveryDate] = useState('');

    const [showAllPayments, setShowAllPayments] = useState(false);
    const [showAllLogs, setShowAllLogs] = useState(false);
    const [showAllImages, setShowAllImages] = useState(false);

    const todayDate = useMemo(() => {
        const today = new Date();
        return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    }, []);

    const refreshOrder = () => {
        startTransition(() => {
            router.refresh();
        });
    };

    const updateStatus = async (newStatus) => {
        if (statusUpdating) return;
        try {
            setStatusUpdating(true);
            const deliveryDate = newStatus === 'delivered'
                ? (actualDeliveryDate || new Date().toISOString().split('T')[0])
                : null;

            await api.put(`/orders/${order.id}/status`, {
                status: newStatus,
                payment_amount: newStatus === 'delivered' ? paymentAmount : 0,
                payment_method: paymentMethod,
                actual_delivery_date: deliveryDate
            });
            setShowDeliveryModal(false);
            setPaymentAmount('');
            setPaymentMethod('cash');
            setActualDeliveryDate('');
            refreshOrder();
        } catch {
            alert('Failed to update status');
        } finally {
            setStatusUpdating(false);
        }
    };

    const deleteImage = async (imageId) => {
        if (!confirm('Delete this image?')) return;
        try {
            await api.delete(`/orders/${order.id}/images/${imageId}`);
            refreshOrder(); // Re-fetch to update image list
        } catch {
            alert('Failed to delete image');
        }
    };

    const payments = useMemo(() => Array.isArray(order?.payments) ? order.payments : [], [order?.payments]);
    const visiblePayments = useMemo(() => showAllPayments ? payments : payments.slice(0, PREVIEW_PAYMENT_LIMIT), [payments, showAllPayments]);

    const statusLogs = useMemo(() => {
        if (!Array.isArray(order?.logs)) return [];
        return order.logs
            .filter((log) => log.action.startsWith('status_changed:'))
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }, [order?.logs]);

    const visibleStatusLogs = useMemo(() => showAllLogs ? statusLogs : statusLogs.slice(0, PREVIEW_LOG_LIMIT), [showAllLogs, statusLogs]);

    const images = useMemo(() => Array.isArray(order?.images) ? order.images : [], [order?.images]);
    const visibleImages = useMemo(() => showAllImages ? images : images.slice(0, PREVIEW_IMAGE_LIMIT), [images, showAllImages]);

    if (!order) return <div className="flex justify-center items-center h-screen text-[#075E54] font-bold">Order not found</div>;

    return (
        <div className="min-h-screen bg-[#ECE5DD] font-sans">
            {/* Header */}
            <header className="glass-header-green text-white p-4 sticky top-0 z-50">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.back()}
                            className="p-2 -ml-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-lg font-bold">Order Details</h1>
                            <p className="text-xs opacity-80">View order information</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {isPending && (
                            <div className="flex items-center justify-center bg-white/20 rounded-lg w-[34px] h-[34px]">
                                <div className="w-[18px] h-[18px] border-2 border-white/50 border-t-white rounded-full animate-spin" />
                            </div>
                        )}
                        <button
                            onClick={() => router.push(`/orders/${order.id}/edit`)}
                            className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                        >
                            <Edit size={18} />
                        </button>
                        <button
                            disabled={deleting}
                            onClick={async () => {
                                if (!confirm('Are you sure you want to delete this order? This cannot be undone.')) return;
                                setDeleting(true);
                                try {
                                    await api.delete(`/orders/${order.id}`);
                                    router.push('/dashboard');
                                } catch (err) {
                                    console.error('Delete error:', err);
                                    alert(err.response?.data?.message || 'Failed to delete order. Please try again.');
                                    setDeleting(false);
                                }
                            }}
                            className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors disabled:opacity-50"
                        >
                            {deleting ? (
                                <div className="w-[18px] h-[18px] border-2 border-white/50 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Trash2 size={18} />
                            )}
                        </button>
                    </div>
                </div>
            </header>

            <main className="px-4 py-4 pb-20 space-y-4">
                {/* Title & Status */}
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Order #{order.token}
                        </h1>
                        <p className="text-sm text-gray-500 font-medium mt-1">
                            {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'No Date'}
                        </p>
                    </div>
                    <span className={clsx(
                        "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border",
                        order.status === 'pending' && "bg-amber-50 text-amber-600 border-amber-100",
                        order.status === 'ready' && "bg-blue-50 text-blue-600 border-blue-100",
                        order.status === 'delivered' && "bg-green-50 text-green-600 border-green-100",
                        order.status === 'transferred' && "bg-purple-50 text-purple-600 border-purple-100"
                    )}>
                        {order.status}
                    </span>
                </div>

                {/* Customer Info Card */}
                <div className="glass-card rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-[#128C7E]">
                            <User size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Customer</p>
                            <p className="font-semibold text-gray-900">{order.customer_name || 'Walk-in Customer'}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-600">
                            <Calendar size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Delivery Date</p>
                            <p className="font-semibold text-gray-900">
                                {order.delivery_date ? new Date(order.delivery_date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : 'Not Set'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Payment Info */}
                <div className="glass-card rounded-xl p-4">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Remaining Balance</span>
                        <div className="text-right">
                            <span className="text-xl font-bold text-red-500 block">₹{order.balance || 0}</span>
                        </div>
                    </div>
                </div>

                {/* Payment History Table */}
                {(payments.length > 0) && (
                    <div className="glass-card rounded-xl overflow-hidden">
                        <div className="bg-gray-50 px-4 py-2 border-b border-gray-100">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Payment History</h3>
                        </div>
                        {visiblePayments.length > 0 ? (
                            <>
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-400 uppercase bg-gray-50/50">
                                        <tr>
                                            <th className="px-4 py-2 font-medium">Date</th>
                                            <th className="px-4 py-2 font-medium">Amount</th>
                                            <th className="px-4 py-2 font-medium">Method</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {visiblePayments.map((payment) => (
                                            <tr key={payment.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-4 py-2 text-gray-600">
                                                    {new Date(payment.payment_date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                                </td>
                                                <td className="px-4 py-2 font-bold text-green-600">₹{payment.amount}</td>
                                                <td className="px-4 py-2">
                                                    <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full ${(payment.payment_method === 'online' || payment.payment_method === 'upi') ? 'bg-blue-100 text-blue-600' :
                                                        'bg-green-100 text-green-600'
                                                        }`}>
                                                        {payment.payment_method === 'upi' ? 'online' : (payment.payment_method || 'cash')}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {!showAllPayments && payments.length > visiblePayments.length && (
                                    <button
                                        onClick={() => setShowAllPayments(true)}
                                        className="w-full border-t border-gray-100 py-2 text-xs font-bold text-[#075E54]"
                                    >
                                        Show all payments
                                    </button>
                                )}
                            </>
                        ) : (
                            <p className="px-4 py-3 text-xs font-medium text-gray-500">
                                No payment records yet.
                            </p>
                        )}
                    </div>
                )}

                {/* Images Grid */}
                {images.length > 0 && (
                    <div>
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Measurements / Photos</h3>
                        <div className="grid grid-cols-3 gap-3">
                            {visibleImages.map((img) => (
                                <div key={img.id} className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shadow-sm group">
                                    <OrderImage
                                        image={img}
                                        alt="Order photo"
                                        className="w-full h-full object-cover cursor-pointer"
                                        onClick={() => setSelectedImage(img)}
                                        fallback={
                                            <div className="w-full h-full flex items-center justify-center text-xs font-semibold text-gray-400">
                                                No Image
                                            </div>
                                        }
                                    />
                                    {typeof img.id === 'number' && !img.is_legacy && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteImage(img.id);
                                            }}
                                            className="absolute top-2 right-2 bg-white/90 text-red-500 p-1.5 rounded-full shadow-sm opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        {!showAllImages && images.length > visibleImages.length && (
                            <button
                                onClick={() => setShowAllImages(true)}
                                className="mt-2 w-full py-2 rounded-xl bg-white text-xs font-bold text-[#075E54] border border-gray-200"
                            >
                                Show all photos
                            </button>
                        )}
                    </div>
                )}

                {/* Remarks */}
                <div className="bg-[#DCF8C6]/30 rounded-xl p-4 border border-[#DCF8C6]">
                    <p className="text-xs font-bold text-green-800 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Edit size={12} /> Remarks
                    </p>
                    <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                        {order.remarks || 'No remarks provided.'}
                    </p>
                </div>

                {/* Status Actions - Glossy & Iconic */}
                <div className="glass-card rounded-2xl p-5">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Update Status</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => updateStatus('pending')}
                            disabled={statusUpdating}
                            className={clsx(
                                "relative overflow-hidden p-4 rounded-xl border transition-all duration-300 flex flex-col items-center justify-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed",
                                order.status === 'pending'
                                    ? "bg-gradient-to-br from-amber-400 to-orange-500 border-transparent text-white shadow-lg shadow-orange-500/30 scale-[1.02]"
                                    : "bg-white border-gray-100 text-gray-500 hover:border-amber-200 hover:bg-amber-50/50 hover:shadow-md"
                            )}
                        >
                            <div className={clsx("p-2 rounded-full transition-colors", order.status === 'pending' ? "bg-white/20" : "bg-amber-100 text-amber-600")}>
                                <Clock size={20} />
                            </div>
                            <span className="font-bold text-sm">Pending</span>
                        </button>

                        <button
                            onClick={() => updateStatus('ready')}
                            disabled={statusUpdating}
                            className={clsx(
                                "relative overflow-hidden p-4 rounded-xl border transition-all duration-300 flex flex-col items-center justify-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed",
                                order.status === 'ready'
                                    ? "bg-gradient-to-br from-blue-400 to-blue-600 border-transparent text-white shadow-lg shadow-blue-500/30 scale-[1.02]"
                                    : "bg-white border-gray-100 text-gray-500 hover:border-blue-200 hover:bg-blue-50/50 hover:shadow-md"
                            )}
                        >
                            <div className={clsx("p-2 rounded-full transition-colors", order.status === 'ready' ? "bg-white/20" : "bg-blue-100 text-blue-600")}>
                                <Scissors size={20} />
                            </div>
                            <span className="font-bold text-sm">Ready</span>
                        </button>

                        <button
                            onClick={() => setShowDeliveryModal(true)}
                            disabled={statusUpdating}
                            className={clsx(
                                "relative overflow-hidden p-4 rounded-xl border transition-all duration-300 flex flex-col items-center justify-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed",
                                order.status === 'delivered'
                                    ? "bg-gradient-to-br from-[#25D366] to-[#128C7E] border-transparent text-white shadow-lg shadow-green-500/30 scale-[1.02]"
                                    : "bg-white border-gray-100 text-gray-500 hover:border-green-200 hover:bg-green-50/50 hover:shadow-md"
                            )}
                        >
                            <div className={clsx("p-2 rounded-full transition-colors", order.status === 'delivered' ? "bg-white/20" : "bg-green-100 text-green-600")}>
                                <Truck size={20} />
                            </div>
                            <span className="font-bold text-sm">Delivered</span>
                        </button>

                        <button
                            onClick={() => updateStatus('transferred')}
                            disabled={statusUpdating}
                            className={clsx(
                                "relative overflow-hidden p-4 rounded-xl border transition-all duration-300 flex flex-col items-center justify-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed",
                                order.status === 'transferred'
                                    ? "bg-gradient-to-br from-purple-400 to-purple-600 border-transparent text-white shadow-lg shadow-purple-500/30 scale-[1.02]"
                                    : "bg-white border-gray-100 text-gray-500 hover:border-purple-200 hover:bg-purple-50/50 hover:shadow-md"
                            )}
                        >
                            <div className={clsx("p-2 rounded-full transition-colors", order.status === 'transferred' ? "bg-white/20" : "bg-purple-100 text-purple-600")}>
                                <ArrowRightLeft size={20} />
                            </div>
                            <span className="font-bold text-sm">Transferred</span>
                        </button>
                    </div>
                </div>

                {/* Status Timeline */}
                {(statusLogs.length > 0) && (
                    <div className="glass-card rounded-2xl p-5">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Clock size={14} />
                            Status Timeline
                        </h3>
                        {visibleStatusLogs.length > 0 ? (
                            <div className="space-y-3">
                                {visibleStatusLogs.map((log, index) => {
                                    const status = log.action.replace('status_changed:', '');
                                    const config = STATUS_TIMELINE_CONFIG[status] || {
                                        ...DEFAULT_TIMELINE_CONFIG,
                                        label: status || 'Status',
                                    };
                                    const Icon = config.icon;

                                    return (
                                        <div key={log.id} className="flex items-start gap-3 relative">
                                            {index < visibleStatusLogs.length - 1 && (
                                                <div className="absolute left-[15px] top-8 bottom-0 w-0.5 bg-gray-200" />
                                            )}
                                            <div className={clsx('flex-none w-8 h-8 rounded-full flex items-center justify-center relative z-10', config.dotClass)}>
                                                <Icon size={16} className={config.iconClass} />
                                            </div>
                                            <div className="flex-1 pt-0.5">
                                                <div className="flex items-center justify-between">
                                                    <span className={clsx('font-bold text-sm', config.labelClass)}>
                                                        {config.label}
                                                    </span>
                                                    <span className="text-xs text-gray-400">
                                                        {new Date(log.created_at).toLocaleString('en-IN', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </span>
                                                </div>
                                                {log.note && (
                                                    <p className="text-xs text-gray-500 mt-1">{log.note}</p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-xs text-gray-500">
                                No status updates yet.
                            </p>
                        )}
                        {!showAllLogs && statusLogs.length > visibleStatusLogs.length && (
                            <button
                                onClick={() => setShowAllLogs(true)}
                                className="mt-3 w-full py-2 rounded-xl bg-white text-xs font-bold text-[#075E54] border border-gray-200"
                            >
                                Show full timeline
                            </button>
                        )}
                    </div>
                )}
            </main>

            {/* Delivery Payment Modal */}
            {showDeliveryModal && (
                <div
                    className="fixed inset-0 z-[70] bg-black/60 p-4 pb-[calc(84px+env(safe-area-inset-bottom))] flex items-end sm:items-center sm:justify-center"
                    onClick={() => setShowDeliveryModal(false)}
                >
                    <div
                        className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden max-h-full flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-[#075E54] px-4 py-3 text-white flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-bold">Collect Payment</h3>
                                <p className="text-[10px] opacity-80">Confirm delivery and payment</p>
                            </div>
                            <button
                                onClick={() => setShowDeliveryModal(false)}
                                className="p-1 rounded-lg bg-white/15 hover:bg-white/25 transition-colors"
                                aria-label="Close delivery popup"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div className="p-4 space-y-3 overflow-y-auto">
                            <div className="bg-red-50 px-3 py-2 rounded-xl text-center border border-red-100">
                                <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Due Amount</p>
                                <p className="text-xl font-bold text-red-600">₹{order.balance || 0}</p>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Delivery Date</label>
                                <DeliveryDatePicker
                                    selected={actualDeliveryDate || todayDate}
                                    onChange={(date) => setActualDeliveryDate(date)}
                                    maxDate={todayDate}
                                    placeholder="When did customer pick up?"
                                    className="text-sm font-bold text-gray-900"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Payment Method</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod('cash')}
                                        className={clsx(
                                            'p-2.5 rounded-lg border-2 transition-all flex flex-col items-center gap-1',
                                            paymentMethod === 'cash'
                                                ? 'border-green-500 bg-green-50 text-green-600'
                                                : 'border-gray-200 text-gray-500'
                                        )}
                                    >
                                        <Banknote size={18} />
                                        <span className="text-xs font-bold">Cash</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod('online')}
                                        className={clsx(
                                            'p-2.5 rounded-lg border-2 transition-all flex flex-col items-center gap-1',
                                            paymentMethod === 'online'
                                                ? 'border-blue-500 bg-blue-50 text-blue-600'
                                                : 'border-gray-200 text-gray-500'
                                        )}
                                    >
                                        <Globe size={18} />
                                        <span className="text-xs font-bold">Online</span>
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Payment Now</label>
                                <input
                                    type="number"
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                    className="w-full text-center text-xl font-bold text-gray-900 border-b-2 border-gray-200 focus:border-green-500 focus:outline-none py-1.5"
                                    placeholder="0"
                                />
                                <div className="flex justify-center text-[10px] font-medium">
                                    <span className="text-gray-500">
                                        Balance:{' '}
                                        <span
                                            className={clsx(
                                                'font-bold',
                                                (order.balance - (parseFloat(paymentAmount) || 0)) > 0 ? 'text-red-500' : 'text-green-600'
                                            )}
                                        >
                                            ₹{Math.max(0, (order.balance || 0) - (parseFloat(paymentAmount) || 0))}
                                        </span>
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="p-3 border-t border-gray-100 bg-white">
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => setShowDeliveryModal(false)}
                                    className="py-2.5 rounded-xl font-bold text-gray-500 bg-gray-100 text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => updateStatus('delivered')}
                                    disabled={statusUpdating}
                                    className="py-2.5 rounded-xl font-bold bg-[#25D366] text-white text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {statusUpdating ? 'Saving...' : 'Confirm'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Image Zoom Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => setSelectedImage(null)}
                >
                    <button
                        onClick={() => setSelectedImage(null)}
                        className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-all"
                    >
                        <X size={24} />
                    </button>
                    <OrderImage
                        image={selectedImage}
                        alt="Full view"
                        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                        loading="eager"
                    />
                </div>
            )}
        </div>
    );
}
