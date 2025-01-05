"use client"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"

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
        }, 3000)
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
        <div className="events-section pb-8 sm:pb-12 pt-8 sm:pt-12">
            <div className="max-w-6xl mx-auto px-2 sm:px-4">
                <div className="flex items-center justify-center gap-2 sm:gap-4 mb-2 sm:mb-4 md:mb-6">
                    <img src="https://cdn-icons-gif.flaticon.com/12743/12743773.gif" alt="Logo" className="w-12 h-12 sm:w-16 sm:h-16 md:w-24 md:h-24 object-contain" />
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-center text-gray-800 tracking-tight hover:text-gray-900 transition-colors duration-300">
                        Science Talk Show
                    </h1>
                </div>
                <div className="relative w-full max-w-3xl mx-auto bg-gradient-to-r from-[#1d77bc]/20 to-[#1d77bc]/10 p-3 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.5 }}
                        className="rounded-xl sm:rounded-2xl overflow-hidden shadow-xl border-2 sm:border-4 border-white"
                    >
                        <img
                            src={images[currentIndex]}
                            alt={`Event ${currentIndex + 1}`}
                            className="w-full h-[200px] sm:h-[300px] md:h-[400px] object-cover transform hover:scale-105 transition-transform duration-500"
                        />
                    </motion.div>
                    <button
                        onClick={prevSlide}
                        className="absolute left-1 sm:left-2 top-1/2 transform -translate-y-1/2 bg-white/80 text-gray-800 p-2 sm:p-3 rounded-full hover:bg-white hover:text-black transition-all duration-300 shadow-lg text-sm sm:text-base"
                    >
                        ❮
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 bg-white/80 text-gray-800 p-2 sm:p-3 rounded-full hover:bg-white hover:text-black transition-all duration-300 shadow-lg text-sm sm:text-base"
                    >
                        ❯
                    </button>
                    <div className="absolute -bottom-3 sm:-bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 sm:gap-3 bg-white/30 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full">
                        {images.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                                    currentIndex === index 
                                        ? 'bg-[#1d77bc] scale-125' 
                                        : 'bg-gray-400 hover:bg-[#1d77bc]/60'
                                }`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}