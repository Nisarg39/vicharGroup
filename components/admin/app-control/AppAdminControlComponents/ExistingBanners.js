import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from 'react'
import { updateBanner } from "../../../../server_actions/actions/adminActions"

export default function ExistingBanners({ banners, loading, onBannerUpdate }) {
    const [currentSlide, setCurrentSlide] = useState(0)
    const [touchStart, setTouchStart] = useState(null)
    const [touchEnd, setTouchEnd] = useState(null)
    const [editingBannerId, setEditingBannerId] = useState(null)
    const [editedSerialNumber, setEditedSerialNumber] = useState("")

    // Auto-advance carousel
    useEffect(() => {
        if (banners.length > 0) {
            const timer = setInterval(() => {
                setCurrentSlide((prevSlide) => (prevSlide + 1) % banners.length)
            }, 5000)
            return () => clearInterval(timer)
        }
    }, [banners.length])

    // Touch handlers for mobile swipe
    const handleTouchStart = (e) => {
        setTouchStart(e.touches[0].clientX)
    }

    const handleTouchMove = (e) => {
        setTouchEnd(e.touches[0].clientX)
    }

    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return
        const distance = touchStart - touchEnd
        const isLeftSwipe = distance > 50
        const isRightSwipe = distance < -50

        if (isLeftSwipe && banners.length > 0) {
            setCurrentSlide((prev) => (prev + 1) % banners.length)
        }
        if (isRightSwipe && banners.length > 0) {
            setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length)
        }

        setTouchStart(null)
        setTouchEnd(null)
    }

    const slideVariants = {
        enter: {
            opacity: 0,
            scale: 1.05,
            filter: "blur(4px)"
        },
        center: {
            opacity: 1,
            scale: 1,
            filter: "blur(0px)",
            transition: {
                duration: 0.8,
                ease: [0.25, 0.46, 0.45, 0.94]
            }
        },
        exit: {
            opacity: 0,
            scale: 0.95,
            filter: "blur(4px)",
            transition: {
                duration: 0.6,
                ease: [0.25, 0.46, 0.45, 0.94]
            }
        }
    }

    const handleEditClick = (banner) => {
        setEditingBannerId(banner._id)
        setEditedSerialNumber(banner.serialNumber)
    }

    const handleSaveEdit = async(bannerId) => {
        const details = {
            _id: bannerId,
            serialNumber: editedSerialNumber
        }
        const response = await updateBanner(details)
        if (response.success) {
            setEditingBannerId(null)
            setEditedSerialNumber("")
            onBannerUpdate() // Trigger refresh from parent
        } else {
            console.error('Error updating banner:', response.message)
        }
    }

    return (
        <div className="mb-10">
            <h3 className="text-lg md:text-xl font-medium mb-4">Existing Banners</h3>
            {loading ? (
                <div className="text-gray-500 py-8 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mr-2"></div>
                    <span>Loading banners...</span>
                </div>
            ) : banners.length > 0 ? (
                <div className="mb-8">
                    <div 
                        className="relative max-w-[267px] md:max-w-[400px] lg:max-w-[533px] mx-auto h-[150px] md:h-[225px] lg:h-[300px] rounded-3xl border-4 border-black bg-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 overflow-hidden"
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                    >
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentSlide}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                className="absolute inset-0"
                            >
                                <img
                                    src={banners[currentSlide]?.imageUrl}
                                    alt={`Banner ${banners[currentSlide]?.serialNumber}`}
                                    className="w-full h-full object-contain"
                                    onError={(e) => {
                                        e.target.src = '/placeholder-image.png'
                                        e.target.alt = 'Image not found'
                                    }}
                                />
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Carousel Controls */}
                    <div className="flex items-center space-x-4 mt-4 justify-center">
                        {banners.map((_, index) => (
                            <button
                                key={index}
                                className={`h-4 transition-all duration-300 rounded-full border-4 border-black hover:scale-115 ${
                                    currentSlide === index ? 'w-16 bg-yellow-300 translate-y-1 translate-x-1 scale-110 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]' : 'w-8 bg-white hover:bg-gray-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                                } hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]`}
                                onClick={() => setCurrentSlide(index)}
                            />
                        ))}
                    </div>

                    {/* Banner Info */}
                    <div className="mt-4 text-center">
                        <p className="text-sm font-medium text-gray-700">
                            Serial Number: {banners[currentSlide]?.serialNumber}
                        </p>
                        {banners[currentSlide]?.createdAt && (
                            <p className="text-xs text-gray-500">
                                Created: {new Date(banners[currentSlide]?.createdAt).toLocaleDateString()}
                            </p>
                        )}
                    </div>

                    {/* Banner Grid View */}
                    <div className="mt-8">
                        <h4 className="text-md font-medium mb-4">All Banners</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {banners.map((banner, index) => (
                                <div 
                                    key={banner.id || index} 
                                    className="border rounded-lg p-2 bg-gray-50 shadow-sm hover:shadow-md transition-shadow"
                                >
                                    <div 
                                        className="aspect-w-16 aspect-h-9 overflow-hidden rounded-md cursor-pointer"
                                        onClick={() => setCurrentSlide(index)}
                                    >
                                        <img 
                                            src={banner.imageUrl} 
                                            alt={`Banner ${banner.serialNumber}`}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.src = '/placeholder-image.png'
                                                e.target.alt = 'Image not found'
                                            }}
                                        />
                                    </div>
                                    <div className="mt-2 pt-2 border-t border-gray-200">
                                        <div className="flex justify-between items-center">
                                            <div className="flex-1">
                                                {editingBannerId === banner._id ? (
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="text"
                                                            value={editedSerialNumber}
                                                            onChange={(e) => setEditedSerialNumber(e.target.value)}
                                                            className="w-full px-2 py-1 text-xs border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                                                            placeholder="Enter serial number"
                                                        />
                                                        <button
                                                            onClick={() => handleSaveEdit(banner._id)}
                                                            className="min-w-[60px] px-3 py-1.5 text-xs font-semibold text-white bg-green-500 hover:bg-green-600 rounded-md transition-colors duration-200 shadow-sm"
                                                        >
                                                            Save
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <p className="text-xs font-medium text-gray-700 truncate">
                                                        {banner.serialNumber}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 ml-4">
                                                <button
                                                    onClick={() => handleEditClick(banner)}
                                                    className="group relative px-3 py-1.5 text-xs font-semibold text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 rounded-md transition-all duration-200 shadow-sm"
                                                >
                                                    <span className="relative z-10">Edit</span>
                                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                                                </button>
                                                <button
                                                    onClick={() => console.log('Delete Banner ID:', banner._id)}
                                                    className="group relative px-3 py-1.5 text-xs font-semibold text-red-600 hover:text-white bg-red-50 hover:bg-red-600 rounded-md transition-all duration-200 shadow-sm"
                                                >
                                                    <span className="relative z-10">Delete</span>
                                                    <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-gray-500 text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                    <p className="text-lg mb-2">No banners found</p>
                    <p className="text-sm">Add your first banner below</p>
                </div>
            )}
        </div>
    )
}