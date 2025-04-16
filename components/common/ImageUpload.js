"use client"
import { useState } from 'react';

export default function ImageUpload({ onImageUploaded }) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [progress, setProgress] = useState(0);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Check file type
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file');
            return;
        }

        // Check file size (limit to 200KB)
        if (file.size > 200 * 1024) {
            setError('Image size should be less than 200KB');
            return;
        }

        setUploading(true);
        setError('');
        setProgress(0);

        try {
            // Create FormData
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', `${process.env.NEXT_PUBLIC_CLOUDINARY_PRESET_NAME}`);

            // Upload to Cloudinary
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
                {
                    method: 'POST',
                    body: formData,
                }
            );

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const data = await response.json();
            
            // Return the URL to the parent component
            onImageUploaded(data.secure_url);
            
            setUploading(false);
            setProgress(100);
        } catch (err) {
            console.error('Upload error:', err);
            setError('Failed to upload image. Please try again.');
            setUploading(false);
        }
    };

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Upload Image</label>
                {error && <p className="text-xs text-red-500">{error}</p>}
            </div>
            
            <div className="mt-1 flex items-center">
                <label className="flex flex-col items-center px-4 py-2 bg-white text-blue-500 rounded-lg border border-blue-500 cursor-pointer hover:bg-blue-500 hover:text-white transition-colors">
                    <span className="text-sm">{uploading ? 'Uploading...' : 'Select Image'}</span>
                    <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={uploading}
                    />
                </label>
            </div>
            
            {uploading && (
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                    <div 
                        className="bg-blue-500 h-2.5 rounded-full transition-all duration-300" 
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            )}
        </div>
    )
}