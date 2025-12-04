import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import ImageUploader from '../components/ImageUploader';
import { LogOut, Calendar, FileText, User, Receipt, ChevronLeft, CheckCircle } from 'lucide-react';

export default function CreateOrder() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        token: '',
        bill_number: '',
        customer_name: '',
        delivery_date: '',
        remarks: '',
    });

    const [images, setImages] = useState([]);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        if (!formData.token.trim()) {
            setError('Please fill required field: Token / Bill Number');
            setLoading(false);
            return;
        }

        try {
            const orderRes = await api.post('/orders', { ...formData });
            const orderId = orderRes.data.id;

            if (images.length > 0) {
                for (const image of images) {
                    const imageFormData = new FormData();
                    imageFormData.append('image', image);
                    await api.post(`/orders/${orderId}/images`, imageFormData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                }
            }

            setSuccess('Record Saved Successfully!');
            setTimeout(() => navigate('/'), 1500);
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || error.message || 'Upload Failed';
            setError(`Upload Failed: ${msg}`);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#ECE5DD] pb-20 font-sans">
            {/* Header */}
            <header className="bg-[#075E54] px-4 py-3 flex justify-between items-center shadow-md sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 -ml-2 text-white hover:bg-white/10 rounded-full transition-colors"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <h1 className="text-lg font-bold text-white">New Order</h1>
                </div>
            </header>

            <main className="px-4 py-4 max-w-md mx-auto">
                <form onSubmit={handleSubmit} className="space-y-3">
                    {/* Token Input - Compact */}
                    <div>
                        <input
                            type="text"
                            required
                            placeholder="Enter Token / Bill Number"
                            value={formData.token}
                            onChange={(e) => setFormData({ ...formData, token: e.target.value })}
                            className="w-full text-xl font-bold text-gray-800 placeholder-gray-400 border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-[#25D366] focus:ring-2 focus:ring-[#25D366]/20 transition-all text-center shadow-sm"
                        />
                    </div>

                    {/* Photo Section */}
                    <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Photo</label>
                        <ImageUploader images={images} onImagesChange={setImages} />
                    </div>

                    {/* Customer & Date - Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                            <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Customer</label>
                            <input
                                type="text"
                                value={formData.customer_name}
                                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                                className="w-full text-sm font-medium text-gray-800 focus:outline-none placeholder-gray-300"
                                placeholder="Optional"
                            />
                        </div>
                        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                            <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Delivery</label>
                            <input
                                type="date"
                                value={formData.delivery_date}
                                onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
                                className="w-full text-sm font-medium text-gray-800 focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Remarks */}
                    <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                        <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Remarks</label>
                        <textarea
                            value={formData.remarks}
                            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                            className="w-full text-sm font-medium text-gray-800 focus:outline-none min-h-[60px] resize-none placeholder-gray-300"
                            placeholder="Enter details..."
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#25D366] text-white py-3.5 rounded-xl font-bold text-lg shadow-lg shadow-green-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                    >
                        {loading ? (
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <CheckCircle size={20} /> Save Record
                            </>
                        )}
                    </button>

                    {/* Messages */}
                    {success && (
                        <div className="p-3 bg-green-50 border border-green-100 rounded-lg text-green-600 text-center text-sm font-bold animate-bounce">
                            {success}
                        </div>
                    )}
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-center text-sm font-bold animate-pulse">
                            {error}
                        </div>
                    )}
                </form>
            </main>
        </div>
    );
}
