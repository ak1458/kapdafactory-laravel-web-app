import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, User, FileText, Save, AlertCircle, Hash, IndianRupee } from 'lucide-react';
import api from '../lib/api';

export default function EditOrder() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        bill_number: '',
        customer_name: '',
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
                setFormData({
                    bill_number: order.bill_number || '',
                    customer_name: order.customer_name || '',
                    delivery_date: order.delivery_date ? order.delivery_date.split('T')[0] : '',
                    remarks: order.remarks || '',
                    total_amount: order.total_amount || '',
                    images: order.images || []
                });
            } catch (err) {
                setError('Failed to load order details');
            } finally {
                setFetching(false);
            }
        };
        fetchOrder();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await api.put(`/orders/${id}`, {
                bill_number: formData.bill_number,
                customer_name: formData.customer_name,
                delivery_date: formData.delivery_date,
                remarks: formData.remarks,
                total_amount: formData.total_amount
            });
            navigate(`/orders/${id}`);
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
            <header className="bg-[#075E54] px-4 py-3 flex items-center gap-3 shadow-md sticky top-0 z-50">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 -ml-2 text-white hover:bg-white/10 rounded-full transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-lg font-bold text-white">Edit Order</h1>
            </header>

            <main className="p-4 max-w-lg mx-auto space-y-4">
                {error && (
                    <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3 text-red-600 animate-in fade-in slide-in-from-top-2">
                        <AlertCircle size={20} className="shrink-0 mt-0.5" />
                        <p className="text-sm font-bold">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Bill Number */}
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-3">
                        <div className="flex items-center gap-2 text-[#075E54] mb-1">
                            <Hash size={18} />
                            <h2 className="font-bold text-xs uppercase tracking-wider">Bill Details</h2>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">
                                Bill Number <span className="text-gray-300 font-normal">(Optional)</span>
                            </label>
                            <input
                                type="text"
                                value={formData.bill_number}
                                onChange={(e) => setFormData({ ...formData, bill_number: e.target.value })}
                                className="w-full p-3 bg-gray-50 border-gray-100 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-bold text-gray-900 placeholder-gray-400"
                                placeholder="e.g. 1024"
                            />
                        </div>
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
                                    Delivery Date
                                </label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        value={formData.delivery_date}
                                        onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
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
                                    <img
                                        key={idx}
                                        src={img.filename.startsWith('http') ? img.filename : `/storage/${img.filename}`}
                                        className="w-full h-24 object-cover rounded-xl bg-gray-100"
                                        alt="Order attachment"
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
