import React, { useRef, useState } from 'react';

/**
 * ImageUpload Component
 * Allows users to upload images for multimodal AI analysis
 */
const ImageUpload = ({ onImageSelect, disabled = false }) => {
    const fileInputRef = useRef(null);
    const [preview, setPreview] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleFileSelect = (file) => {
        if (!file || !file.type.startsWith('image/')) {
            alert('Please select a valid image file');
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setPreview(e.target.result);

            // Convert to base64 for API
            const base64 = e.target.result.split(',')[1];
            onImageSelect(base64, e.target.result);
        };
        reader.readAsDataURL(file);
    };

    const handleClick = () => {
        if (!disabled) {
            fileInputRef.current?.click();
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);

        if (disabled) return;

        const file = e.dataTransfer.files[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        if (!disabled) {
            setIsDragging(true);
        }
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const clearImage = () => {
        setPreview(null);
        onImageSelect(null, null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="relative">
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileSelect(e.target.files[0])}
                className="hidden"
                disabled={disabled}
            />

            {!preview ? (
                <button
                    type="button"
                    onClick={handleClick}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    disabled={disabled}
                    className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${isDragging
                            ? 'bg-indigo-100 border-2 border-indigo-400 border-dashed'
                            : 'bg-gray-100 hover:bg-gray-200 border border-gray-300'
                        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                    <svg
                        className="w-5 h-5 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                    </svg>
                    <span className="text-gray-700">Add Image</span>
                </button>
            ) : (
                <div className="relative inline-block">
                    <img
                        src={preview}
                        alt="Upload preview"
                        className="h-20 rounded-lg border-2 border-indigo-300 shadow-md"
                    />
                    <button
                        type="button"
                        onClick={clearImage}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-all shadow-md"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}
        </div>
    );
};

export default ImageUpload;
