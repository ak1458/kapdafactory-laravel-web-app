'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useNavigate } from '@/src/lib/router';
import api from '../lib/api';
import CustomDatePicker from '../components/CustomDatePicker';
import { ChevronLeft, Camera, User, Calendar, Hash, IndianRupee, FileText, CheckCircle, X } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import toast from 'react-hot-toast';

const MAX_IMAGES_PER_ORDER = 8;
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

export default function CreateOrder() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Get today's date (default for entry_date)
    const getTodayDate = () => {
        const today = new Date();
        return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    };

    const [formData, setFormData] = useState({
        token: '',
        bill_number: '',
        customer_name: '',
        entry_date: getTodayDate(),  // When the entry is made (defaults to today)
        delivery_date: '',  // When order should be delivered
        remarks: '',
        total_amount: '',
    });
    const [images, setImages] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const fileInputRef = useRef(null);
    const latestPreviewUrlsRef = useRef([]);

    const releasePreviewUrls = (urls) => {
        for (const url of urls) {
            URL.revokeObjectURL(url);
        }
    };

    useEffect(() => {
        latestPreviewUrlsRef.current = previewUrls;
    }, [previewUrls]);

    useEffect(() => {
        return () => {
            releasePreviewUrls(latestPreviewUrlsRef.current);
        };
    }, []);

    const handleImageChange = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        if (images.length >= MAX_IMAGES_PER_ORDER) {
            toast.error(`Maximum ${MAX_IMAGES_PER_ORDER} images are allowed per order.`);
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        // Compression Options
        const options = {
            maxSizeMB: 0.9,
            maxWidthOrHeight: 1600,
            useWebWorker: true,
            fileType: 'image/jpeg' // Force JPEG for better compression
        };

        const validFiles = [];
        const validPreviews = [];
        const availableSlots = MAX_IMAGES_PER_ORDER - images.length;
        const filesToProcess = files.slice(0, availableSlots);

        // Process files sequentially to maintain order and prevent browser lag
        for (const file of filesToProcess) {
            // 10MB Limit Check (pre-compression)
            if (file.size > MAX_IMAGE_SIZE_BYTES) {
                toast.error(`File ${file.name} is too large (>10MB). Skipping.`);
                continue;
            }

            if (!file.type.startsWith('image/')) {
                toast.error(`File ${file.name} is not an image. Skipping.`);
                continue;
            }

            try {
                // Compress Image
                const compressedFile = await imageCompression(file, options);

                validFiles.push(compressedFile);
                validPreviews.push(URL.createObjectURL(compressedFile));

            } catch {
                toast.error(`Failed to compress ${file.name}. Uploading original.`);
                validFiles.push(file);
                validPreviews.push(URL.createObjectURL(file));
            }
        }

        if (validFiles.length === 0) return;

        setImages(prev => [...prev, ...validFiles]);
        setPreviewUrls(prev => [...prev, ...validPreviews]);

        if (files.length > filesToProcess.length) {
            toast.error(`Only ${MAX_IMAGES_PER_ORDER} images can be attached per order.`);
        }

        // Reset input value to allow selecting same file again
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removeImage = (index) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        setImages(newImages);

        const newPreviews = [...previewUrls];
        const removedPreview = newPreviews[index];
        if (removedPreview) {
            URL.revokeObjectURL(removedPreview);
        }
        newPreviews.splice(index, 1);
        setPreviewUrls(newPreviews);
    };

    const handleSubmit = async () => {
        if (!formData.token) return toast.error('Token/Bill Number is required');
        setLoading(true);

        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));

        images.forEach((image) => {
            if (image instanceof File) {
                data.append('images[]', image);
            }
        });

        if (formData.total_amount) {
            data.set('total_amount', Number(formData.total_amount));
        }

        try {
            await api.post('/orders', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Release preview URLs before navigating away
            releasePreviewUrls(previewUrls);
            toast.success('Order created successfully!');
            navigate('/dashboard');
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to create order.';
            toast.error(`Error: ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col bg-[#ECE5DD] font-sans h-full">
            {/* Header */}
            <header className="flex-none glass-header-green text-white p-4 z-50">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 -ml-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold">New Order</h1>
                        <p className="text-xs opacity-80">Create a new order entry</p>
                    </div>
                </div>
            </header>

            {/* Main Content - scrollable */}
            <main className="p-3 overflow-y-auto">

                {/* Form Container - flexible spacing */}
                <div className="flex flex-col gap-2 sm:gap-3 mb-4">
                    {/* Row 1: Token & Amount - responsive height */}
                    <div className="flex gap-2 sm:gap-3 min-h-[60px] sm:min-h-[70px]">
                        <div className="flex-1 glass-card rounded-xl p-2 sm:p-3 flex flex-col justify-center">
                            <label className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5 sm:mb-1 flex items-center gap-1">
                                <Hash size={10} className="sm:w-3 sm:h-3" /> Token / Bill
                            </label>
                            <input
                                type="text"
                                placeholder="A-101"
                                value={formData.token}
                                onChange={(e) => setFormData({ ...formData, token: e.target.value })}
                                className="w-full text-base sm:text-lg font-bold text-gray-900 placeholder-gray-300 focus:outline-none bg-transparent"
                            />
                        </div>
                        <div className="flex-1 glass-card rounded-xl p-2 sm:p-3 flex flex-col justify-center">
                            <label className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5 sm:mb-1 flex items-center gap-1">
                                <IndianRupee size={10} className="sm:w-3 sm:h-3" /> Amount
                            </label>
                            <div className="flex items-center gap-1">
                                <span className="text-gray-400 font-bold text-base sm:text-lg">₹</span>
                                <input
                                    type="number"
                                    value={formData.total_amount || ''}
                                    onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                                    className="w-full text-base sm:text-lg font-bold text-gray-900 placeholder-gray-300 focus:outline-none bg-transparent"
                                    placeholder="0"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Row 2: Entry Date & Delivery Date */}
                    <div className="flex gap-2 sm:gap-3 min-h-[60px] sm:min-h-[70px]">
                        <div className="flex-1 bg-white rounded-xl p-2 sm:p-3 shadow-sm border border-gray-100 flex flex-col justify-center">
                            <label className="text-[9px] sm:text-[10px] font-bold text-teal-600 uppercase tracking-wider mb-0.5 sm:mb-1 flex items-center gap-1">
                                <Calendar size={10} className="sm:w-3 sm:h-3" /> Entry Date
                            </label>
                            <CustomDatePicker
                                selected={formData.entry_date}
                                onChange={(date) => setFormData({ ...formData, entry_date: date })}
                                placeholder="Today"
                            />
                        </div>
                        <div className="flex-1 bg-white rounded-xl p-2 sm:p-3 shadow-sm border border-gray-100 flex flex-col justify-center">
                            <label className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5 sm:mb-1 flex items-center gap-1">
                                <Calendar size={10} className="sm:w-3 sm:h-3" /> Delivery
                            </label>
                            <CustomDatePicker
                                selected={formData.delivery_date}
                                onChange={(date) => setFormData({ ...formData, delivery_date: date })}
                                minDate={new Date()}
                                placeholder="dd-mm-yyyy"
                            />
                        </div>
                    </div>

                    {/* Row 3: Customer Name - Full Width */}
                    <div className="flex gap-2 sm:gap-3 min-h-[60px] sm:min-h-[70px]">
                        <div className="flex-1 bg-white/80 backdrop-blur-sm rounded-xl p-2 sm:p-3 shadow-sm border border-white/50 flex flex-col justify-center">
                            <label className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5 sm:mb-1 flex items-center gap-1">
                                <User size={10} className="sm:w-3 sm:h-3" /> Customer Name (Optional)
                            </label>
                            <input
                                type="text"
                                placeholder="Enter customer name"
                                value={formData.customer_name}
                                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                                className="w-full font-medium text-sm sm:text-base text-gray-900 placeholder-gray-300 focus:outline-none bg-transparent"
                            />
                        </div>
                    </div>

                    {/* Row 3: Photos - responsive */}
                    <div className="rounded-xl sm:rounded-2xl p-2 sm:p-3 shadow-lg flex flex-col min-h-[80px] sm:min-h-[100px]" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.8)' }}>
                        <div className="flex justify-between items-center mb-1 sm:mb-2 flex-none">
                            <h3 className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                <Camera size={10} className="sm:w-3 sm:h-3" /> Photos
                            </h3>
                            <span className="text-[9px] sm:text-[10px] font-bold text-gray-400">
                                {images.length} added
                            </span>
                        </div>

                        <div className="flex-1 flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-hide">
                            {/* Add Photo Button - responsive size */}
                            <label
                                className="flex-none flex flex-col items-center justify-center gap-0.5 border-2 border-dashed border-teal-400 rounded-lg sm:rounded-xl cursor-pointer hover:bg-teal-50 transition-all bg-gradient-to-br from-white to-teal-50/50 group shadow-md w-12 h-12 sm:w-16 sm:h-16"
                                onClick={(e) => {
                                    e.preventDefault();
                                    fileInputRef.current?.click();
                                }}
                            >
                                <div className="p-1 sm:p-1.5 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform">
                                    <Camera size={14} className="text-teal-600 sm:w-4 sm:h-4" />
                                </div>
                                <span className="text-[7px] sm:text-[8px] font-bold text-teal-600 uppercase">Add</span>
                            </label>
                            <input
                                type="file"
                                ref={fileInputRef}
                                multiple
                                accept="image/*"
                                capture="environment"
                                onChange={handleImageChange}
                                className="hidden"
                            />

                            {/* Previews - responsive size */}
                            {previewUrls.map((url, idx) => (
                                <div key={idx} className="flex-none relative rounded-lg sm:rounded-xl overflow-hidden border-2 border-white shadow-lg group w-12 h-12 sm:w-16 sm:h-16">
                                    <Image
                                        src={url}
                                        alt="Preview"
                                        fill
                                        unoptimized
                                        sizes="64px"
                                        className="object-cover"
                                    />
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            removeImage(idx);
                                        }}
                                        className="absolute top-0.5 right-0.5 bg-black/50 text-white rounded-full p-0.5 z-10 hover:bg-red-500 transition-colors"
                                    >
                                        <X size={10} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Row 4: Remarks - responsive */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-2 shadow-sm border border-white/50 flex flex-col min-h-[44px] sm:min-h-[56px]">
                        <label className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5 flex items-center gap-1 flex-none">
                            <FileText size={10} className="sm:w-3 sm:h-3" /> Notes
                        </label>
                        <input
                            type="text"
                            placeholder="Add notes (optional)..."
                            value={formData.remarks}
                            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                            className="w-full flex-1 font-medium text-gray-900 placeholder-gray-300 focus:outline-none bg-transparent text-sm"
                        />
                    </div>
                </div>

                {/* Save Button */}
                <div className="mt-4 pb-8">

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-2.5 sm:py-3 rounded-xl font-bold text-sm sm:text-base shadow-lg shadow-green-500/30 flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed btn-press"
                    >
                        {loading ? 'Saving...' : (
                            <>
                                <CheckCircle size={18} className="sm:w-5 sm:h-5" /> Save Record
                            </>
                        )}
                    </button>
                </div>
            </main>

        </div>
    );
}



