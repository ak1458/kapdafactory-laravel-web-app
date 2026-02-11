'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from '@/src/lib/router';
import api from '../lib/api';
import CustomDatePicker from '../components/CustomDatePicker';
import OrderImage from '../components/OrderImage';
import { ChevronLeft, Edit, Trash2, User, Calendar, X, Clock, Scissors, Truck, ArrowRightLeft, Banknote, Globe, Camera, Plus } from 'lucide-react';
import clsx from 'clsx';
import imageCompression from 'browser-image-compression';

export default function OrderDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [showDeliveryModal, setShowDeliveryModal] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [actualDeliveryDate, setActualDeliveryDate] = useState('');
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    // Get today's date in YYYY-MM-DD format
    const getTodayDate = () => {
        const today = new Date();
        return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    };

    const fetchOrder = useCallback(async () => {
        if (!id || id === 'undefined' || id === 'null') {
            setError('Invalid Order ID');
            setLoading(false);
            return;
        }

        try {
            const res = await api.get(`/orders/${id}`);
            setOrder(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Order fetch error:', err);
            setError('Failed to load order');
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (!id || id === 'undefined') {
            // Optional: Auto-redirect if ID is clearly bad
            // navigate('/dashboard');
        }
        fetchOrder();
    }, [fetchOrder, id]);

    const updateStatus = async (newStatus) => {
        try {
            // Use today's date as default if not selected
            const deliveryDate = newStatus === 'delivered'
                ? (actualDeliveryDate || new Date().toISOString().split('T')[0])
                : null;

            await api.put(`/orders/${id}/status`, {
                status: newStatus,
                payment_amount: newStatus === 'delivered' ? paymentAmount : 0,
                payment_method: paymentMethod,
                actual_delivery_date: deliveryDate
            });
            setShowDeliveryModal(false);
            setPaymentAmount('');
            setPaymentMethod('cash');
            setActualDeliveryDate('');
            fetchOrder();
        } catch {
            alert('Failed to update status');
        }
    };

    const deleteImage = async (imageId) => {
        if (!confirm('Delete this image?')) return;
        try {
            await api.delete(`/orders/${id}/images/${imageId}`);
            fetchOrder();
        } catch {
            alert('Failed to delete image');
        }
    };

    const uploadImage = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file.');
            return;
        }
        setUploading(true);
        try {
            const compressed = await imageCompression(file, {
                maxSizeMB: 0.9,
                maxWidthOrHeight: 1600,
                useWebWorker: true,
                fileType: 'image/jpeg',
            });
            const formData = new FormData();
            formData.append('image', compressed);
            await api.post(`/orders/${id}/images`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            fetchOrder();
        } catch {
            alert('Failed to upload image.');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen text-[#075E54] font-bold">Loading...</div>;
    if (error) {
        return (
            <div className="min-h-screen bg-[#ECE5DD] px-4 py-12 flex flex-col items-center justify-center gap-3">
                <p className="text-center text-red-500 font-bold">{error}</p>
                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchOrder}
                        className="px-4 py-2 rounded-xl bg-[#075E54] text-white text-sm font-semibold"
                    >
                        Retry
                    </button>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="px-4 py-2 rounded-xl bg-white text-gray-700 text-sm font-semibold"
                    >
                        Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#ECE5DD] font-sans">
            {/* Header */}
            <header className="glass-header-green text-white p-4 sticky top-0 z-50">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate(-1)}
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
                        <button
                            onClick={() => navigate(`/orders/${id}/edit`)}
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
                                    await api.delete(`/orders/${id}`);
                                    navigate('/dashboard');
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
                        order?.status === 'delivered' && "bg-green-50 text-green-600 border-green-100",
                        order?.status === 'transferred' && "bg-purple-50 text-purple-600 border-purple-100"
                    )}>
                        {order?.status}
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
                            <p className="font-semibold text-gray-900">{order?.customer_name || 'Walk-in Customer'}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-600">
                            <Calendar size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Delivery Date</p>
                            <p className="font-semibold text-gray-900">
                                {order?.delivery_date ? new Date(order.delivery_date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : 'Not Set'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Payment Info */}
                <div className="glass-card rounded-xl p-4">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Remaining Balance</span>
                        <div className="text-right">
                            <span className="text-xl font-bold text-red-500 block">₹{order?.balance || 0}</span>
                        </div>
                    </div>
                </div>

                {/* Payment History Table */}
                {order?.payments?.length > 0 && (
                    <div className="glass-card rounded-xl overflow-hidden">
                        <div className="bg-gray-50 px-4 py-2 border-b border-gray-100">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Payment History</h3>
                        </div>
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-400 uppercase bg-gray-50/50">
                                <tr>
                                    <th className="px-4 py-2 font-medium">Date</th>
                                    <th className="px-4 py-2 font-medium">Amount</th>
                                    <th className="px-4 py-2 font-medium">Method</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {order.payments.map((payment) => (
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
                    </div>
                )}

                {/* Images / Bill Photos Section — Always visible */}
                <div>
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Bill Photos</h3>
                        <label className={clsx(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all",
                            uploading ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-teal-50 text-teal-700 hover:bg-teal-100 active:scale-95"
                        )}>
                            {uploading ? (
                                <div className="w-3.5 h-3.5 border-2 border-teal-300 border-t-teal-600 rounded-full animate-spin" />
                            ) : (
                                <Camera size={14} />
                            )}
                            {uploading ? 'Uploading...' : 'Add Photo'}
                            <input
                                type="file"
                                ref={fileInputRef}
                                accept="image/*"
                                capture="environment"
                                onChange={uploadImage}
                                disabled={uploading}
                                className="hidden"
                            />
                        </label>
                    </div>
                    {order?.images?.length > 0 ? (
                        <div className="grid grid-cols-3 gap-3">
                            {order.images.map((img) => (
                                <div key={img.id} className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shadow-sm group">
                                    <OrderImage
                                        image={img}
                                        alt="Order photo"
                                        className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
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
                    ) : (
                        <div className="glass-card rounded-xl p-6 text-center">
                            <Camera size={32} className="mx-auto text-gray-300 mb-2" />
                            <p className="text-sm text-gray-400 font-medium">No photos yet</p>
                            <p className="text-xs text-gray-300 mt-1">Tap "Add Photo" to capture the bill</p>
                        </div>
                    )}
                </div>

                {/* Remarks */}
                <div className="bg-[#DCF8C6]/30 rounded-xl p-4 border border-[#DCF8C6]">
                    <p className="text-xs font-bold text-green-800 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Edit size={12} /> Remarks
                    </p>
                    <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                        {order?.remarks || 'No remarks provided.'}
                    </p>
                </div>

                {/* Status Actions - Glossy & Iconic */}
                <div className="glass-card rounded-2xl p-5">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Update Status</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => updateStatus('pending')}
                            className={clsx(
                                "relative overflow-hidden p-4 rounded-xl border transition-all duration-300 flex flex-col items-center justify-center gap-2 group",
                                order?.status === 'pending'
                                    ? "bg-gradient-to-br from-amber-400 to-orange-500 border-transparent text-white shadow-lg shadow-orange-500/30 scale-[1.02]"
                                    : "bg-white border-gray-100 text-gray-500 hover:border-amber-200 hover:bg-amber-50/50 hover:shadow-md"
                            )}
                        >
                            <div className={clsx("p-2 rounded-full transition-colors", order?.status === 'pending' ? "bg-white/20" : "bg-amber-100 text-amber-600")}>
                                <Clock size={20} />
                            </div>
                            <span className="font-bold text-sm">Pending</span>
                        </button>

                        <button
                            onClick={() => updateStatus('ready')}
                            className={clsx(
                                "relative overflow-hidden p-4 rounded-xl border transition-all duration-300 flex flex-col items-center justify-center gap-2 group",
                                order?.status === 'ready'
                                    ? "bg-gradient-to-br from-blue-400 to-blue-600 border-transparent text-white shadow-lg shadow-blue-500/30 scale-[1.02]"
                                    : "bg-white border-gray-100 text-gray-500 hover:border-blue-200 hover:bg-blue-50/50 hover:shadow-md"
                            )}
                        >
                            <div className={clsx("p-2 rounded-full transition-colors", order?.status === 'ready' ? "bg-white/20" : "bg-blue-100 text-blue-600")}>
                                <Scissors size={20} />
                            </div>
                            <span className="font-bold text-sm">Ready</span>
                        </button>

                        <button
                            onClick={() => setShowDeliveryModal(true)}
                            className={clsx(
                                "relative overflow-hidden p-4 rounded-xl border transition-all duration-300 flex flex-col items-center justify-center gap-2 group",
                                order?.status === 'delivered'
                                    ? "bg-gradient-to-br from-[#25D366] to-[#128C7E] border-transparent text-white shadow-lg shadow-green-500/30 scale-[1.02]"
                                    : "bg-white border-gray-100 text-gray-500 hover:border-green-200 hover:bg-green-50/50 hover:shadow-md"
                            )}
                        >
                            <div className={clsx("p-2 rounded-full transition-colors", order?.status === 'delivered' ? "bg-white/20" : "bg-green-100 text-green-600")}>
                                <Truck size={20} />
                            </div>
                            <span className="font-bold text-sm">Delivered</span>
                        </button>

                        <button
                            onClick={() => updateStatus('transferred')}
                            className={clsx(
                                "relative overflow-hidden p-4 rounded-xl border transition-all duration-300 flex flex-col items-center justify-center gap-2 group",
                                order?.status === 'transferred'
                                    ? "bg-gradient-to-br from-purple-400 to-purple-600 border-transparent text-white shadow-lg shadow-purple-500/30 scale-[1.02]"
                                    : "bg-white border-gray-100 text-gray-500 hover:border-purple-200 hover:bg-purple-50/50 hover:shadow-md"
                            )}
                        >
                            <div className={clsx("p-2 rounded-full transition-colors", order?.status === 'transferred' ? "bg-white/20" : "bg-purple-100 text-purple-600")}>
                                <ArrowRightLeft size={20} />
                            </div>
                            <span className="font-bold text-sm">Transferred</span>
                        </button>
                    </div>
                </div>

                {/* Status Timeline */}
                {order?.logs && order.logs.length > 0 && (
                    <div className="glass-card rounded-2xl p-5">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Clock size={14} />
                            Status Timeline
                        </h3>
                        <div className="space-y-3">
                            {order.logs
                                .filter(log => log.action.startsWith('status_changed:'))
                                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                                .map((log, index) => {
                                    const status = log.action.replace('status_changed:', '');
                                    const statusConfig = {
                                        pending: { color: 'amber', icon: Clock, label: 'Pending' },
                                        ready: { color: 'blue', icon: Scissors, label: 'Ready' },
                                        delivered: { color: 'green', icon: Truck, label: 'Delivered' },
                                        transferred: { color: 'purple', icon: ArrowRightLeft, label: 'Transferred' }
                                    };
                                    const config = statusConfig[status] || { color: 'gray', icon: Clock, label: status };
                                    const Icon = config.icon;

                                    return (
                                        <div key={log.id} className="flex items-start gap-3 relative">
                                            {index < order.logs.filter(l => l.action.startsWith('status_changed:')).length - 1 && (
                                                <div className="absolute left-[15px] top-8 bottom-0 w-0.5 bg-gray-200" />
                                            )}
                                            <div className={`flex-none w-8 h-8 rounded-full bg-${config.color}-100 flex items-center justify-center relative z-10`}>
                                                <Icon size={16} className={`text-${config.color}-600`} />
                                            </div>
                                            <div className="flex-1 pt-0.5">
                                                <div className="flex items-center justify-between">
                                                    <span className={`font-bold text-sm text-${config.color}-600`}>
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
                                <p className="text-xl font-bold text-red-600">₹{order?.balance || 0}</p>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Delivery Date</label>
                                <CustomDatePicker
                                    selected={actualDeliveryDate || getTodayDate()}
                                    onChange={(date) => setActualDeliveryDate(date)}
                                    maxDate={getTodayDate()}
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
                                                (order?.balance - (parseFloat(paymentAmount) || 0)) > 0 ? 'text-red-500' : 'text-green-600'
                                            )}
                                        >
                                            ₹{Math.max(0, (order?.balance || 0) - (parseFloat(paymentAmount) || 0))}
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
                                    className="py-2.5 rounded-xl font-bold bg-[#25D366] text-white text-sm"
                                >
                                    Confirm
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
                        fallback={
                            <div
                                className="w-56 h-56 rounded-xl bg-white/10 border border-white/20 text-white/80 flex items-center justify-center text-sm font-semibold"
                                onClick={(e) => e.stopPropagation()}
                            >
                                Image unavailable
                            </div>
                        }
                    />
                </div>
            )}
        </div>
    );
}




