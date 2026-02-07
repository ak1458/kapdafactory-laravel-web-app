import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, User, FileText, Save, AlertCircle, Hash } from 'lucide-react';
import api from '../lib/api';
import ImageUploader from '../components/ImageUploader';

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
                remarks: formData.remarks
            });
            navigate(`/orders/${id}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update order');
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20 font-sans">
            {/* Header */}
            <header className="bg-white px-6 py-4 flex items-center gap-4 shadow-sm sticky top-0 z-50">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ArrowLeft size={20} className="text-gray-600" />
                </button>
                <h1 className="text-lg font-bold text-gray-900">Edit Order</h1>
            </header>

            <main className="p-6 max-w-lg mx-auto space-y-6">
                {error && (
                    <div className="p-4 rounded-2xl bg-red-50 border border-red-100 flex items-start gap-3 text-red-600 animate-fadeIn">
                        <AlertCircle size={20} className="shrink-0 mt-0.5" />
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Bill Number */}
                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 space-y-4">
                        <div className="flex items-center gap-2 text-teal-600 mb-2">
                            <Hash size={18} />
                            <h2 className="font-bold text-sm uppercase tracking-wider">Bill Details</h2>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">
                                Bill Number <span className="text-gray-300 font-normal">(Optional)</span>
                            </label>
                            <input
                                type="text"
                                value={formData.bill_number}
                                onChange={(e) => setFormData({ ...formData, bill_number: e.target.value })}
                                className="w-full p-4 bg-gray-50 border-gray-100 rounded-2xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-medium text-gray-900 placeholder-gray-400"
                                placeholder="e.g. 1024"
                            />
                        </div>
                    </div>

                    {/* Customer Details */}
                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 space-y-4">
                        <div className="flex items-center gap-2 text-indigo-600 mb-2">
                            <User size={18} />
                            <h2 className="font-bold text-sm uppercase tracking-wider">Customer Info</h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">
                                    Customer Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.customer_name}
                                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                                    className="w-full p-4 bg-gray-50 border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-gray-900 placeholder-gray-400"
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
                                        className="w-full p-4 pl-12 bg-gray-50 border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-gray-900"
                                    />
                                    <Calendar size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Remarks */}
                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 space-y-4">
                        <div className="flex items-center gap-2 text-amber-600 mb-2">
                            <FileText size={18} />
                            <h2 className="font-bold text-sm uppercase tracking-wider">Notes</h2>
                        </div>
                        <textarea
                            value={formData.remarks}
                            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                            rows={3}
                            className="w-full p-4 bg-gray-50 border-gray-100 rounded-2xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium text-gray-900 placeholder-gray-400 resize-none"
                            placeholder="Add any special instructions..."
                        />
                    </div>

                    {/* Images (Read Only for now in Edit) */}
                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 space-y-4 opacity-70 pointer-events-none">
                        <div className="flex items-center gap-2 text-rose-600 mb-2">
                            <FileText size={18} />
                            <h2 className="font-bold text-sm uppercase tracking-wider">Images (Cannot be changed)</h2>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {formData.images.map((img, idx) => (
                                <img
                                    key={idx}
                                    src={`${import.meta.env.VITE_API_URL || ''}/storage/${img.filename}`}
                                    className="w-full h-24 object-cover rounded-xl"
                                />
                            ))}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 px-6 bg-slate-900 text-white text-lg font-bold rounded-2xl shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                        {!loading && <Save size={20} />}
                    </button>
                </form>
            </main>
        </div>
    );
}
