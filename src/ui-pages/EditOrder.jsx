'use client';

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from '@/src/lib/router';
import { ArrowLeft, Calendar, User, FileText, Save, AlertCircle, Hash, IndianRupee, CheckCircle } from 'lucide-react';
import api from '../lib/api';
import OrderImage from '../components/OrderImage';
import CustomDatePicker from '../components/CustomDatePicker';

export default function EditOrder() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState('');
    const [orderToken, setOrderToken] = useState(''); const [showSuccess, setShowSuccess] = useState(false);

    const [formData, setFormData] = useState({
        bill_number: '',
        customer_name: '',
        entry_date: '',
        delivery_date: '',
        remarks: '',
        total_amount: '',
        images: []
    });

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const res = await api.get(`/orders/${id}`);
                const order = res.data;
                setOrderToken(order.token || '');
                const billNum = order.bill_number || '';
                setFormData({
                    bill_number: billNum.startsWith('BILL-') ? (order.token || '') : billNum,
                    customer_name: order.customer_name || '',
                    entry_date: order.entry_date ? order.entry_date.split('T')[0] : '',
                    delivery_date: order.delivery_date ? order.delivery_date.split('T')[0] : '',
                    remarks: order.remarks || '',
                    total_amount: order.total_amount || '',
                    images: order.images || []
                });
            } catch {
                setError('Failed to load order details');
            } finally {
                setFetching(false);
            }
        };
        fetchOrder();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.delivery_date) return setError('Expected Delivery Date is required');
        setLoading(true);
        setError('');

        try {
            await api.put(`/orders/${id}`, {
                bill_number: formData.bill_number,
                customer_name: formData.customer_name,
                entry_date: formData.entry_date,
                delivery_date: formData.delivery_date,
                remarks: formData.remarks,
                total_amount: formData.total_amount
            });
            setShowSuccess(true);
            setTimeout(() => {
                navigate(`/orders/${id}`);
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update order');
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="min-h-screen bg-[#ECE5DD] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#075E54]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#ECE5DD] pb-20 font-sans">
            {/* Header */}
            <header className="glass-header-green text-white p-4 sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 -ml-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold">Edit Order {orderToken ? `#${orderToken}` : ''}</h1>
                        <p className="text-xs opacity-80">Update order details</p>
                    </div>
                </div>
            </header>

            <main className="p-4 max-w-lg mx-auto space-y-4">
                {/* Success Toast */}
                {showSuccess && (
                    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="bg-[#25D366] text-white px-6 py-3 rounded-xl shadow-lg shadow-green-500/30 flex items-center gap-2 font-bold text-sm">
                            <CheckCircle size={18} />
                            Order updated successfully!
                        </div>
                    </div>
                )}

                {error && (
                    <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3 text-red-600 animate-in fade-in slide-in-from-top-2">
                        <AlertCircle size={20} className="shrink-0 mt-0.5" />
                        <p className="text-sm font-bold">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Order / Bill Number - Read Only */}
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-3">
                        <div className="flex items-center gap-2 text-[#075E54] mb-1">
                            <Hash size={18} />
                            <h2 className="font-bold text-xs uppercase tracking-wider">Order / Bill No.</h2>
                        </div>
                        <input
                            type="text"
                            value={orderToken}
                            readOnly
                            disabled
                            className="w-full p-3 bg-gray-100 border-gray-200 rounded-xl font-bold text-gray-500 cursor-not-allowed"
                        />
                        <p className="text-[10px] text-gray-400 ml-1">Cannot be changed. Delete and recreate if incorrect.</p>
                    </div>

                    {/* Customer Details */}
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-3">
                        <div className="flex items-center gap-2 text-[#075E54] mb-1">
                            <User size={18} />
                            <h2 className="font-bold text-xs uppercase tracking-wider">Customer Info</h2>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">
                                    Customer Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.customer_name}
                                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                                    className="w-full p-3 bg-gray-50 border-gray-100 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-bold text-gray-900 placeholder-gray-400"
                                    placeholder="Enter customer name"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">
                                    Entry Date
                                </label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        value={formData.entry_date}
                                        onChange={(e) => setFormData({ ...formData, entry_date: e.target.value })}
                                        className="w-full p-3 pl-10 bg-gray-50 border-gray-100 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-bold text-gray-900"
                                    />
                                    <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-400 pointer-events-none" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">
                                    Delivery Date <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        value={formData.delivery_date}
                                        onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full p-3 pl-10 bg-gray-50 border-gray-100 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-bold text-gray-900"
                                    />
                                    <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Billing Amount */}
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-3">
                        <div className="flex items-center gap-2 text-[#075E54] mb-1">
                            <IndianRupee size={18} />
                            <h2 className="font-bold text-xs uppercase tracking-wider">Billing Amount</h2>
                        </div>
                        <div>
                            <input
                                type="number"
                                value={formData.total_amount}
                                onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                                className="w-full p-3 bg-gray-50 border-gray-100 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-bold text-gray-900 placeholder-gray-400"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    {/* Remarks */}
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-3">
                        <div className="flex items-center gap-2 text-[#075E54] mb-1">
                            <FileText size={18} />
                            <h2 className="font-bold text-xs uppercase tracking-wider">Notes</h2>
                        </div>
                        <textarea
                            value={formData.remarks}
                            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                            rows={3}
                            className="w-full p-3 bg-gray-50 border-gray-100 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-medium text-gray-900 placeholder-gray-400 resize-none"
                            placeholder="Add any special instructions..."
                        />
                    </div>

                    {/* Images (Read Only) */}
                    {formData.images.length > 0 && (
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-3">
                            <div className="flex items-center gap-2 text-[#075E54] mb-1">
                                <FileText size={18} />
                                <h2 className="font-bold text-xs uppercase tracking-wider">Images (Read Only)</h2>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {formData.images.map((img, idx) => (
                                    <OrderImage
                                        key={idx}
                                        image={img}
                                        className="w-full h-24 object-cover rounded-xl bg-gray-100"
                                        alt="Order attachment"
                                        fallback={
                                            <div className="w-full h-24 rounded-xl bg-gray-100 text-gray-400 flex items-center justify-center text-xs font-medium">
                                                No Image
                                            </div>
                                        }
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 px-6 bg-[#25D366] text-white text-lg font-bold rounded-xl shadow-lg shadow-green-500/30 flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                        {!loading && <Save size={20} />}
                    </button>
                </form>
            </main>
        </div>
    );
}


