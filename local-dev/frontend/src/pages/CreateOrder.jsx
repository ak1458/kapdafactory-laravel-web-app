import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import ImageUploader from '../components/ImageUploader';
import MeasurementForm from '../components/MeasurementForm';
import { ChevronLeft } from 'lucide-react';

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
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
            alert('Failed to create order. Check token uniqueness.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pb-20">
            <div className="flex items-center mb-4">
                <button onClick={() => navigate(-1)} className="mr-2 p-1">
                    <ChevronLeft />
                </button>
                <h2 className="text-xl font-bold">New Order</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Token *</label>
                        <input
                            type="text"
                            required
                            value={formData.token}
                            onChange={(e) => setFormData({ ...formData, token: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Bill No.</label>
                        <input
                            type="text"
                            value={formData.bill_number}
                            onChange={(e) => setFormData({ ...formData, bill_number: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Customer Name</label>
                    <input
                        type="text"
                        value={formData.customer_name}
                        onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Delivery Date</label>
                    <input
                        type="date"
                        value={formData.delivery_date}
                        onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                    />
                </div>

                <MeasurementForm measurements={measurements} onChange={setMeasurements} />

                <ImageUploader images={images} onImagesChange={setImages} />

                <div>
                    <label className="block text-sm font-medium text-gray-700">Remarks</label>
                    <textarea
                        value={formData.remarks}
                        onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                        rows="2"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
                >
                    {loading ? 'Creating...' : 'Create Order'}
                </button>
            </form>
        </div>
    );
}
