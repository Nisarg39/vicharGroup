import { useState, useEffect } from 'react'
import AppBannerUpload from "../../../common/AppBannerUpload"
import { addBanner, showBanners } from '../../../../server_actions/actions/adminActions'
import ExistingBanners from './ExistingBanners'

export default function BannerControl() {
    const [bannerImageUrl, setBannerImageUrl] = useState('')
    const [serialNumber, setSerialNumber] = useState('')
    const [error, setError] = useState('')
    const [existingBanners, setExistingBanners] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchBanners()
    }, [])

    const fetchBanners = async () => {
        try {
            setLoading(true)
            const response = await showBanners()
            if (response.success) {
                setExistingBanners(response.banners || [])
            } else {
                console.error('Error fetching banners:', response.message)
            }
        } catch (error) {
            console.error('Error fetching banners:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleImageUploaded = (imageUrl) => {
        setBannerImageUrl(imageUrl)
        setError('')
    }

    const handleSerialNumberChange = (e) => {
        setSerialNumber(e.target.value)
        setError('')
    }

    const handleAddBanner = async() => {
        if (!serialNumber.trim()) {
            setError('Serial number is required')
            return
        }

        if (!bannerImageUrl) {
            setError('Please upload an image')
            return
        }

        const details = {
            serialNumber,
            imageUrl: bannerImageUrl
        }


        if(!localStorage.getItem('isAdmin')) {
            setError('You must be logged in to add a banner')
            return
        }

        const response = await addBanner(details)
        if(response.success) {
            setSerialNumber('')
            setBannerImageUrl('')
            setError('')
            alert(response.message)
            await fetchBanners()
        } else {
            setError(response.message)
            console.error('Error adding banner:', response.message)
        }
    }

    return (
        <div className="p-4 max-w-6xl mx-auto">
            <h2 className="text-xl md:text-2xl font-semibold mb-6">Banner Control</h2>
            
            <ExistingBanners 
                banners={existingBanners} 
                loading={loading} 
                onBannerUpdate={fetchBanners} 
            />

            <div className="border-t pt-8">
                <h3 className="text-lg md:text-xl font-medium mb-6">Add New Banner</h3>
                
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Banner Image (16:9 ratio)
                    </label>
                    <AppBannerUpload 
                        onImageUploaded={handleImageUploaded} 
                        aspectRatio={16 / 9}
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Serial Number
                    </label>
                    <input
                        type="text"
                        value={serialNumber}
                        onChange={handleSerialNumberChange}
                        placeholder="Enter serial number"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                        {error}
                    </div>
                )}

                <button
                    onClick={handleAddBanner}
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                    Add Banner
                </button>

                {bannerImageUrl && (
                    <div className="mt-8 p-4 border rounded-lg bg-gray-50">
                        <h4 className="text-md font-medium mb-3">Preview:</h4>
                        <div className="aspect-w-16 aspect-h-9 overflow-hidden rounded-md border">
                            <img 
                                src={bannerImageUrl} 
                                alt="Banner preview" 
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}