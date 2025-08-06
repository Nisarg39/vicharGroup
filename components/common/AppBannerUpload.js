"use client"
import { useState, useRef } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

export default function AppBannerUpload({ onImageUploaded, aspectRatio = null }) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [progress, setProgress] = useState(0);
    const [selectedFile, setSelectedFile] = useState(null);
    const [imgSrc, setImgSrc] = useState('');
    const [crop, setCrop] = useState();
    const [completedCrop, setCompletedCrop] = useState(null);
    const imgRef = useRef(null);
    const [showCropper, setShowCropper] = useState(false);

    function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
        if (!aspect) {
            // For free-form crop, start with a centered square that's 80% of the smaller dimension
            const minDimension = Math.min(mediaWidth, mediaHeight);
            const size = minDimension * 0.8;
            
            return {
                unit: 'px',
                x: (mediaWidth - size) / 2,
                y: (mediaHeight - size) / 2,
                width: size,
                height: size
            };
        }
        
        return centerCrop(
            makeAspectCrop(
                {
                    unit: '%',
                    width: 90,
                },
                aspect,
                mediaWidth,
                mediaHeight
            ),
            mediaWidth,
            mediaHeight
        );
    }

    const onImageLoad = (e) => {
        const { width, height } = e.currentTarget;
        setCrop(centerAspectCrop(width, height, aspectRatio));
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Check file type
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file');
            return;
        }

        // Check file size (limit to 1MB)
        if (file.size > 1000 * 1024) {
            setError('Image size should be less than 1MB');
            return;
        }

        setSelectedFile(file);
        setError('');

        const reader = new FileReader();
        reader.addEventListener('load', () => {
            setImgSrc(reader.result?.toString() || '');
            setShowCropper(true);
        });
        reader.readAsDataURL(file);
    };

    const handleCropComplete = (crop) => {
        setCompletedCrop(crop);
    };

    const getCroppedImg = async (image, crop, fileName) => {
        const canvas = document.createElement('canvas');
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        canvas.width = crop.width;
        canvas.height = crop.height;
        const ctx = canvas.getContext('2d');

        ctx.drawImage(
            image,
            crop.x * scaleX,
            crop.y * scaleY,
            crop.width * scaleX,
            crop.height * scaleY,
            0,
            0,
            crop.width,
            crop.height
        );

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                if (!blob) {
                    console.error('Canvas is empty');
                    return;
                }
                blob.name = fileName;
                resolve(blob);
            }, 'image/jpeg', 0.95);
        });
    };

    const uploadCroppedImage = async () => {
        if (!completedCrop || !imgRef.current) {
            setError('Please crop the image first');
            return;
        }

        setUploading(true);
        setProgress(0);

        try {
            const croppedImageBlob = await getCroppedImg(
                imgRef.current,
                completedCrop,
                selectedFile.name
            );

            // Create FormData
            const formData = new FormData();
            formData.append('file', croppedImageBlob);
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
            setShowCropper(false);
            setImgSrc('');
        } catch (err) {
            console.error('Upload error:', err);
            setError('Failed to upload image. Please try again.');
            setUploading(false);
        }
    };

    const cancelCrop = () => {
        setShowCropper(false);
        setImgSrc('');
        setSelectedFile(null);
    };

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Upload Image</label>
                {error && <p className="text-xs text-red-500">{error}</p>}
            </div>
            
            {!showCropper ? (
                <div className="mt-1 flex items-center">
                    <label className="flex flex-col items-center px-4 py-2 bg-white text-blue-500 rounded-lg border border-blue-500 cursor-pointer hover:bg-blue-500 hover:text-white transition-colors">
                        <span className="text-sm">Select Image</span>
                        <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileSelect}
                            disabled={uploading}
                        />
                    </label>
                </div>
            ) : (
                <div className="mt-4">
                    <div className="max-w-full overflow-auto">
                        <ReactCrop
                            crop={crop}
                            onChange={(c) => setCrop(c)}
                            onComplete={handleCropComplete}
                            aspect={aspectRatio}
                            className="max-w-full"
                        >
                            <img
                                ref={imgRef}
                                alt="Crop me"
                                src={imgSrc}
                                onLoad={onImageLoad}
                                className="max-w-full"
                            />
                        </ReactCrop>
                    </div>
                    <div className="mt-4 flex space-x-2">
                        <button
                            type="button"
                            onClick={uploadCroppedImage}
                            disabled={uploading}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
                        >
                            {uploading ? 'Uploading...' : 'Upload Cropped Image'}
                        </button>
                        <button
                            type="button"
                            onClick={cancelCrop}
                            disabled={uploading}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:bg-gray-100"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
            
            {uploading && (
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                    <div 
                        className="bg-blue-500 h-2.5 rounded-full transition-all duration-300" 
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            )}
        </div>
    );
}