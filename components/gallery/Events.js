"use client"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { FaFlask, FaChevronLeft, FaChevronRight } from 'react-icons/fa'

export default function Events(){
    const images = [
        "/vichar-events/vivekSirEvent.jpeg",
        "/vichar-events/redSirEvent.jpeg",
        "/vichar-events/viverSirEvent2.jpeg"
    ]

    const [currentIndex, setCurrentIndex] = useState(0)

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prevIndex) => 
                prevIndex === images.length - 1 ? 0 : prevIndex + 1
            )
        }, 5000)
        return () => clearInterval(timer)
    }, [])

    const nextSlide = () => {
        setCurrentIndex((prevIndex) => 
            prevIndex === images.length - 1 ? 0 : prevIndex + 1
        )
    }

    const prevSlide = () => {
        setCurrentIndex((prevIndex) => 
            prevIndex === 0 ? images.length - 1 : prevIndex - 1
        )
    }

    return(
        <div className="events-section pb-16 sm:pb-24 pt-16 sm:pt-24 bg-gradient-to-b from-white to-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 md:gap-12">
                    <div className="w-full md:w-1/3">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <FaFlask className="text-[#1d77bc] text-2xl" />
                                <h2 className="text-[#1d77bc] font-semibold tracking-wide uppercase">Events</h2>
                            </div>
                            <h1 className="text-5xl sm:text-6xl font-extrabold text-left text-gray-900 tracking-tight">
                                Science Talk Show
                            </h1>
                            <p className="text-gray-600 text-lg leading-relaxed">
                                Join us for an engaging discussion on the latest scientific discoveries and innovations.
                            </p>
                        </div>
                    </div>
                    <div className="w-full md:w-2/3">
                        <div className="relative w-full bg-white rounded-xl shadow-2xl overflow-hidden">
                            <motion.div
                                key={currentIndex}
                                initial={{ opacity: 0, x: 100 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -100 }}
                                transition={{ duration: 0.5, ease: "easeInOut" }}
                                className="relative"
                            >
                                <img
                                    src={images[currentIndex]}
                                    alt={`Event ${currentIndex + 1}`}
                                    className="w-full h-[300px] sm:h-[450px] md:h-[550px] object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                            </motion.div>
                            
                            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                                <div className="flex items-center justify-between">
                                    <div className="flex space-x-2">
                                        {images.map((_, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setCurrentIndex(index)}
                                                className={`w-12 h-1 rounded-full transition-all duration-300 ${
                                                    currentIndex === index 
                                                        ? 'bg-white' 
                                                        : 'bg-white/40 hover:bg-white/60'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                    <div className="flex space-x-3">
                                        <button
                                            onClick={prevSlide}
                                            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 backdrop-blur-sm"
                                        >
                                            <FaChevronLeft className="w-5 h-5 text-white" />
                                        </button>
                                        <button
                                            onClick={nextSlide}
                                            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 backdrop-blur-sm"
                                        >
                                            <FaChevronRight className="w-5 h-5 text-white" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}