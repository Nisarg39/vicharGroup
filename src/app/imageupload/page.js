"use client"
import { CldUploadButton } from 'next-cloudinary';
import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function Home(){
    const [imageId, setImageId] = useState('');
    const [imageInfo, setImageInfo] = useState(null);

    return(
        <div className="mt-28 min-h-screen">
            <h1>Image Upload</h1>
            <CldUploadButton
                uploadPreset={`${process.env.NEXT_PUBLIC_CLOUDINARY_PRESET_NAME}`}
                options={{
                    // Set maximum file size to 200KB (200 * 1024 bytes)
                    maxFileSize: 200 * 1024,
                    // Specify allowed file formats
                    clientAllowedFormats: ['jpg', 'jpeg', 'png', 'gif'],
                    // Add sources for upload
                    sources: ['local', 'url', 'camera'],
                    // Add a custom validation function
                    validateFileSize: true,
                    // Show an alert when file size exceeds the limit
                    showUploadMoreButton: false,
                    sizeValidationText: 'Image size should not exceed 200kb'
                }}
                onSuccess={(result) => {
                    setImageId(result.info.public_id);
                    setImageInfo({
                        width: result.info.width,
                        height: result.info.height
                    });
                    console.log(`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${result.info.public_id}`);
                }}
            />
            {imageId && (
                <div className="mt-4">
                    <Image
                        src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${imageId}`}
                        alt="Uploaded Image"
                        width={imageInfo?.width || 400}
                        height={imageInfo?.height || 300}
                        style={{
                            maxWidth: '100%',
                            height: 'auto',
                            objectFit: 'contain'
                        }}
                    />
                </div>
            )}
        </div>
    )
}