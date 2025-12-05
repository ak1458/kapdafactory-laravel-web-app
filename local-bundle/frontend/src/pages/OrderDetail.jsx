import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import CustomDatePicker from '../components/CustomDatePicker';
import { ChevronLeft, Edit, Trash2, User, Calendar, CheckCircle, X, Clock, Scissors, Truck, ArrowRightLeft } from 'lucide-react';
import clsx from 'clsx';

export default function OrderDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [showDeliveryModal, setShowDeliveryModal] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [actualDeliveryDate, setActualDeliveryDate] = useState('');

    const fetchOrder = async () => {
        try {
            const res = await api.get(`/orders/${id}`);
            setOrder(res.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to load order');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const updateStatus = async (newStatus) => {
        try {
            await api.put(`/orders/${id}/status`, {
                status: newStatus,
                payment_amount: newStatus === 'delivered' ? paymentAmount : 0,
                actual_delivery_date: newStatus === 'delivered' ? actualDeliveryDate : null
            });
            setShowDeliveryModal(false);
            setPaymentAmount('');
            setActualDeliveryDate('');
            fetchOrder();
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const deleteImage = async (imageId) => {
        if (!confirm('Delete this image?')) return;
        try {
            await api.delete(`/orders/${id}/images/${imageId}`);
            fetchOrder();
        } catch (err) {
            alert('Failed to delete image');
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen text-[#075E54] font-bold">Loading...</div>;
    if (error) return <div className="text-center text-red-500 mt-10 font-bold">{error}</div>;

    return (
        <div className="min-h-screen bg-[#ECE5DD] pb-10 font-sans">
            {/* Header */}
            <header className="bg-gradient-to-r from-[#25D366] to-[#128C7E] px-4 py-3 flex justify-between items-center shadow-md sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 -ml-2 text-white hover:bg-white/10 rounded-full transition-colors"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <h1 className="text-lg font-bold text-white">Order Details</h1>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => navigate(`/orders/${id}/edit`)}
                        className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
                    >
                        <Edit size={20} />
                    </button>
                    <button
                        onClick={() => {
                            if (confirm('Delete order?')) {
                                api.delete(`/orders/${id}`).then(() => navigate('/dashboard'));
                            }
                        }}
                        className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
                    >
                        <Trash2 size={20} />
                    </button>
                </div>
            </header>

            <main className="px-4 py-4 space-y-4">
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
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 space-y-3">
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
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Remaining Balance</span>
                        <div className="text-right">
                            <span className="text-xl font-bold text-red-500 block">₹{order?.balance || 0}</span>
                        </div>
                    </div>
                </div>

                {/* Payment History Table */}
                {order?.payments?.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-gray-50 px-4 py-2 border-b border-gray-100">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Payment History</h3>
                        </div>
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-400 uppercase bg-gray-50/50">
                                <tr>
                                    <th className="px-4 py-2 font-medium">Date</th>
                                    <th className="px-4 py-2 font-medium">Amount</th>
                                    <th className="px-4 py-2 font-medium">Note</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {order.payments.map((payment) => (
                                    <tr key={payment.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-4 py-2 text-gray-600">
                                            {new Date(payment.payment_date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                        </td>
                                        <td className="px-4 py-2 font-bold text-green-600">₹{payment.amount}</td>
                                        <td className="px-4 py-2 text-gray-500 text-xs">{payment.note || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Images Grid */}
                {order?.images?.length > 0 && (
                    <div>
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Measurements / Photos</h3>
                        <div className="grid grid-cols-3 gap-3">
                            {order.images.map((img) => (
                                <div key={img.id} className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shadow-sm group">
                                    <img
                                        src={img.filename.startsWith('http') ? img.filename : `/storage/${img.filename}`}
                                        alt="Order"
                                        className="w-full h-full object-cover cursor-pointer"
                                        onClick={() => setSelectedImage(img)}
                                        onError={(e) => e.target.style.display = 'none'}
                                    />
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteImage(img.id);
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
                <div className="bg-[#DCF8C6]/30 rounded-xl p-4 border border-[#DCF8C6]">
                    <p className="text-xs font-bold text-green-800 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Edit size={12} /> Remarks
                    </p>
                    <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                        {order?.remarks || 'No remarks provided.'}
                    </p>
                </div>

                {/* Status Actions - Glossy & Iconic */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
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
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
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
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden scale-100 animate-in zoom-in-95 duration-200">
                        <div className="bg-[#075E54] p-4 text-white text-center">
                            <h3 className="text-lg font-bold">Collect Payment</h3>
                            <p className="text-xs opacity-80">Enter amount customer is paying now</p>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="bg-red-50 p-3 rounded-xl text-center border border-red-100">
                                <p className="text-xs font-bold text-red-400 uppercase tracking-wider">Due Amount</p>
                                <p className="text-2xl font-bold text-red-600">₹{order?.balance || 0}</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Actual Delivery Date</label>
                                <CustomDatePicker
                                    selected={actualDeliveryDate}
                                    onChange={(date) => setActualDeliveryDate(date)}
                                    placeholder="When did customer pick up?"
                                    className="text-sm font-bold text-gray-900"
                                />
                                <p className="text-xs text-gray-500 ml-1">
                                    Planned: {order?.delivery_date ? new Date(order.delivery_date).toLocaleDateString() : 'N/A'}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Payment Now</label>
                                <input
                                    type="number"
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                    className="w-full text-center text-2xl font-bold text-gray-900 border-b-2 border-gray-200 focus:border-green-500 focus:outline-none py-2"
                                    placeholder="0"
                                />
                                <div className="flex justify-between text-xs font-medium px-1 pt-1">
                                    <span className="text-gray-500">New Balance: <span className={clsx("font-bold", (order?.balance - (parseFloat(paymentAmount) || 0)) > 0 ? "text-red-500" : "text-green-600")}>
                                        ₹{Math.max(0, (order?.balance || 0) - (parseFloat(paymentAmount) || 0))}
                                    </span></span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <button
                                    onClick={() => setShowDeliveryModal(false)}
                                    className="py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => updateStatus('delivered')}
                                    className="py-3 rounded-xl font-bold bg-[#25D366] text-white shadow-lg shadow-green-500/30 active:scale-[0.98] transition-all"
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
                    <img
                        src={selectedImage.filename.startsWith('http') ? selectedImage.filename : `/storage/${selectedImage.filename}`}
                        alt="Full view"
                        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl scale-100 transition-transform duration-200"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    );
}
