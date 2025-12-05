import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import CustomDatePicker from '../components/CustomDatePicker';
import { ChevronLeft, Camera, Upload, User, Calendar, Hash, IndianRupee, FileText, CheckCircle, X } from 'lucide-react';

export default function CreateOrder() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        token: '',
        bill_number: '',
        customer_name: '',
        delivery_date: '',
        remarks: '',
        total_amount: '',
    });
    const [images, setImages] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setImages([...images, ...files]);
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviewUrls([...previewUrls, ...newPreviews]);
    };

    const removeImage = (index) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        setImages(newImages);

        const newPreviews = [...previewUrls];
        URL.revokeObjectURL(newPreviews[index]);
        newPreviews.splice(index, 1);
        setPreviewUrls(newPreviews);
    };

    const handleSubmit = async () => {
        if (!formData.token) return alert('Token/Bill Number is required');
        setLoading(true);

        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        images.forEach(image => data.append('images[]', image));

        if (formData.total_amount) {
            data.set('total_amount', Number(formData.total_amount));
        }

        try {
            const res = await api.post('/orders', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            navigate(`/orders/${res.data.id}`);
        } catch {
            alert('Failed to create order');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col bg-[#ECE5DD] font-sans h-full">
            {/* Header */}
            <header className="flex-none bg-gradient-to-r from-[#25D366] to-[#128C7E] px-4 py-3 flex items-center gap-3 shadow-md z-50">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 -ml-2 text-white hover:bg-white/10 rounded-full transition-colors"
                >
                    <ChevronLeft size={24} />
                </button>
                <h1 className="text-lg font-bold text-white">New Order</h1>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col p-4 pb-24 overflow-hidden">

                {/* Form Container - Takes available space */}
                <div className="flex-1 flex flex-col gap-3 min-h-0 mb-3">
                    {/* Row 1: Token & Amount */}
                    <div className="flex-1 flex gap-3 min-h-0">
                        <div className="flex-1 bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex flex-col justify-center">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                                <Hash size={12} /> Token / Bill
                            </label>
                            <input
                                type="text"
                                placeholder="A-101"
                                value={formData.token}
                                onChange={(e) => setFormData({ ...formData, token: e.target.value })}
                                className="w-full text-lg font-bold text-gray-900 placeholder-gray-300 focus:outline-none bg-transparent"
                            />
                        </div>
                        <div className="flex-1 bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex flex-col justify-center">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                                <IndianRupee size={12} /> Amount
                            </label>
                            <div className="flex items-center gap-1">
                                <span className="text-gray-400 font-bold text-lg">₹</span>
                                <input
                                    type="number"
                                    value={formData.total_amount || ''}
                                    onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                                    className="w-full text-lg font-bold text-gray-900 placeholder-gray-300 focus:outline-none bg-transparent"
                                    placeholder="0"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Row 2: Customer & Date */}
                    <div className="flex-1 flex gap-3 min-h-0">
                        <div className="flex-[1.5] bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex flex-col justify-center">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                                <User size={12} /> Customer
                            </label>
                            <input
                                type="text"
                                placeholder="Name (Optional)"
                                value={formData.customer_name}
                                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                                className="w-full font-medium text-gray-900 placeholder-gray-300 focus:outline-none bg-transparent"
                            />
                        </div>
                        <div className="flex-1 bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex flex-col justify-center">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                                <Calendar size={12} /> Delivery
                            </label>
                            <CustomDatePicker
                                selected={formData.delivery_date}
                                onChange={(date) => setFormData({ ...formData, delivery_date: date })}
                                minDate="1999-01-01"
                                maxDate="2030-12-31"
                                placeholder="dd-mm-yyyy"
                            />
                        </div>
                    </div>

                    {/* Row 3: Photos (Redesigned) */}
                    <div className="flex-1 bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col min-h-0">
                        <div className="flex justify-between items-center mb-3 flex-none">
                            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                <Camera size={12} /> Reference Images
                            </h3>
                            <span className="text-[10px] font-bold text-gray-400">
                                {images.length} added
                            </span>
                        </div>

                        <div className="flex-1 flex items-center gap-3 overflow-x-auto scrollbar-hide">
                            {/* Add Photo Button */}
                            <label className="flex-none w-24 h-24 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-teal-400 rounded-xl cursor-pointer hover:bg-teal-50 transition-colors bg-gray-50/50 group">
                                <div className="p-2 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform">
                                    <Camera size={20} className="text-teal-600" />
                                </div>
                                <span className="text-[10px] font-bold text-teal-600 uppercase">Add Photo</span>
                                <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                            </label>

                            {/* Previews */}
                            {previewUrls.map((url, idx) => (
                                <div key={idx} className="flex-none w-24 h-24 relative rounded-xl overflow-hidden border border-gray-100 group shadow-sm">
                                    <img src={url} alt="Preview" className="w-full h-full object-cover" />
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            removeImage(idx);
                                        }}
                                        className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 z-10 hover:bg-red-500 transition-colors"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Row 4: Remarks */}
                    <div className="flex-1 bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex flex-col min-h-0">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1 flex-none">
                            <FileText size={12} /> Remarks
                        </label>
                        <textarea
                            placeholder="Add notes..."
                            value={formData.remarks}
                            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                            className="w-full flex-1 font-medium text-gray-900 placeholder-gray-300 focus:outline-none bg-transparent resize-none text-sm leading-relaxed"
                        />
                    </div>
                </div>

                {/* Save Button (Fixed at bottom) */}
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-none w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-3.5 rounded-xl font-bold text-lg shadow-lg shadow-green-500/30 flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? 'Saving...' : (
                        <>
                            <CheckCircle size={20} /> Save Record
                        </>
                    )}
                </button>
            </main>
        </div>
    );
}
