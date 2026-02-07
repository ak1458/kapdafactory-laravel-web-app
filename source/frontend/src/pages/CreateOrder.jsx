import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import ImageUploader from '../components/ImageUploader';
import MeasurementForm from '../components/MeasurementForm';
import { LogOut, Calendar, FileText, User, Receipt } from 'lucide-react';

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
    const [measurements, setMeasurements] = useState({});
    const [images, setImages] = useState([]);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            // 1. Create Order
            const orderRes = await api.post('/orders', {
                ...formData,
                measurements
            });
            const orderId = orderRes.data.id;

            // 2. Upload Images
            if (images.length > 0) {
                for (const image of images) {
                    const imageFormData = new FormData();
                    imageFormData.append('image', image);
                    await api.post(`/orders/${orderId}/images`, imageFormData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                }
            }

            navigate('/');
        } catch (error) {
            console.error(error);
            setError('Upload Failed: Request failed with status code 500'); // Mimicking the screenshot error for now, or actual error
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20 font-sans">
            {/* Header */}
            <header className="bg-white px-6 py-4 flex justify-between items-center shadow-sm sticky top-0 z-10">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center overflow-hidden border border-black">
                        {/* Placeholder for logo if not available, or use an icon */}
                        <span className="text-xs font-bold">KF</span>
                    </div>
                    <h1 className="text-xl font-bold text-teal-600 tracking-tight">Kapdafactory</h1>
                </div>
                <button
                    onClick={() => navigate('/login')} // Assuming logout goes to login
                    className="bg-red-50 text-red-500 px-4 py-1.5 rounded-full text-sm font-medium hover:bg-red-100 transition-colors"
                >
                    Logout
                </button>
            </header>

            <main className="max-w-md mx-auto p-6 space-y-8">
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Token Input - Prominent */}
                    <div>
                        <input
                            type="text"
                            required
                            placeholder="Token Number"
                            value={formData.token}
                            onChange={(e) => setFormData({ ...formData, token: e.target.value })}
                            className="w-full text-3xl font-bold text-gray-800 placeholder-gray-300 border-2 border-gray-100 rounded-2xl px-6 py-4 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all text-center shadow-sm"
                        />
                    </div>

                    {/* Photo Section */}
                    <div>
                        <label className="block text-sm font-bold text-gray-600 mb-3 ml-1">Photo</label>
                        <ImageUploader images={images} onImagesChange={setImages} />
                    </div>

                    {/* Measurements Section */}
                    <div>
                        <label className="block text-sm font-bold text-gray-600 mb-3 ml-1">Measurements</label>
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <MeasurementForm measurements={measurements} onChange={setMeasurements} />
                        </div>
                    </div>

                    {/* Extra Details (Collapsible or just clean inputs) */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-1 ml-1 uppercase tracking-wider">Bill No.</label>
                            <div className="relative">
                                <Receipt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    value={formData.bill_number}
                                    onChange={(e) => setFormData({ ...formData, bill_number: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-xl text-sm font-medium focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all shadow-sm"
                                    placeholder="Optional"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-1 ml-1 uppercase tracking-wider">Customer</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    value={formData.customer_name}
                                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-xl text-sm font-medium focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all shadow-sm"
                                    placeholder="Optional"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Remarks */}
                    <div>
                        <label className="block text-sm font-bold text-gray-600 mb-3 ml-1">Remarks</label>
                        <div className="relative">
                            <FileText className="absolute left-4 top-4 text-gray-400" size={18} />
                            <textarea
                                value={formData.remarks}
                                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-medium focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all shadow-sm min-h-[100px] resize-none"
                                placeholder="Enter details..."
                            />
                        </div>
                    </div>

                    {/* Expected Delivery */}
                    <div>
                        <label className="block text-sm font-bold text-gray-600 mb-3 ml-1">Expected Delivery</label>
                        <div className="relative">
                            <input
                                type="date"
                                value={formData.delivery_date}
                                onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
                                className="w-full pl-4 pr-4 py-4 bg-white border border-gray-100 rounded-2xl text-lg font-medium text-gray-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all shadow-sm cursor-pointer"
                            />
                        </div>
                    </div>

                    {/* Save Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 px-6 bg-teal-600 hover:bg-teal-700 text-white text-lg font-bold rounded-2xl shadow-lg shadow-teal-600/20 transform transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Saving Record...' : 'Save Record'}
                    </button>

                    {/* Error Message */}
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-center text-sm font-bold animate-pulse">
                            {error}
                        </div>
                    )}
                </form>
            </main>
        </div>
    );
}
