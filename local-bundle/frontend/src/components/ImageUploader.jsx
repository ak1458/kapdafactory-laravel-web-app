import { useState, useRef } from 'react';
import { Camera, X, Image as ImageIcon, Loader2 } from 'lucide-react';

export default function ImageUploader({ images, onImagesChange }) {
    const fileInputRef = useRef(null);
    const [processing, setProcessing] = useState(false);

    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setProcessing(true);
        const processedFiles = [];

        for (const file of files) {
            try {
                const compressed = await compressImage(file);
                processedFiles.push(compressed);
            } catch (err) {
                console.error('Compression failed', err);
            }
        }

        onImagesChange([...images, ...processedFiles]);
        setProcessing(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const compressImage = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    const MAX_WIDTH = 1280;
                    const MAX_HEIGHT = 1280;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        if (!blob) {
                            reject(new Error('Canvas is empty'));
                            return;
                        }
                        const newFile = new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now(),
                        });
                        resolve(newFile);
                    }, 'image/jpeg', 0.7);
                };
                img.onerror = (error) => reject(error);
            };
            reader.onerror = (error) => reject(error);
        });
    };

    const removeImage = (index) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        onImagesChange(newImages);
    };

    return (
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <ImageIcon size={16} className="text-teal-500" />
                    Reference Images
                </label>
                <span className="text-xs text-gray-400">{images.length} added</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
                {images.map((file, index) => (
                    <div key={index} className="relative aspect-square bg-gray-50 rounded-xl overflow-hidden border border-gray-200 group">
                        <img
                            src={URL.createObjectURL(file)}
                            alt="Preview"
                            className="w-full h-full object-cover"
                        />
                        <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-white/90 text-red-500 rounded-full p-1.5 shadow-sm opacity-100 hover:bg-red-50 transition-all"
                        >
                            <X size={14} />
                        </button>
                    </div>
                ))}

                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={processing}
                    className="aspect-square bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:bg-gray-100 hover:border-teal-400 hover:text-teal-500 transition-all active:scale-95"
                >
                    {processing ? (
                        <Loader2 size={24} className="animate-spin text-teal-500" />
                    ) : (
                        <>
                            <Camera size={24} className="mb-1" />
                            <span className="text-[10px] font-medium uppercase tracking-wide">Add Photo</span>
                        </>
                    )}
                </button>
            </div>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                multiple
                capture="environment"
                className="hidden"
            />
        </div>
    );
}
