"use client"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"

export default function Events(){
    const [currentIndex, setCurrentIndex] = useState(0)
    const [direction, setDirection] = useState(0)
    const [autoPlay, setAutoPlay] = useState(true)
    const images = [
        "/vichar-events/vivekSirEvent.jpeg",
        "/vichar-events/redSirEvent.jpeg",
        "/vichar-events/viverSirEvent2.jpeg"
    ]

    useEffect(() => {
        let interval
        if (autoPlay) {
            interval = setInterval(() => {
                setDirection(1)
                setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
            }, 3000)
        }
        return () => clearInterval(interval)
    }, [autoPlay, images.length])

    const slideVariants = {
        enter: (direction) => ({
            y: direction > 0 ? 300 : -300,
            scale: 0.8,
            opacity: 0
        }),
        center: {
            zIndex: 1,
            y: 0,
            scale: 1,
            opacity: 1
        },
        exit: (direction) => ({
            zIndex: 0,
            y: direction < 0 ? 300 : -300,
            scale: 0.8,
            opacity: 0
        })
    }

    const swipeConfidenceThreshold = 10000
    const swipePower = (offset, velocity) => {
        return Math.abs(offset) * velocity
    }

    const paginate = (newDirection) => {
        setAutoPlay(false)
        setDirection(newDirection)
        setCurrentIndex((prevIndex) => {
            let nextIndex = prevIndex + newDirection
            if (nextIndex >= images.length) nextIndex = 0
            if (nextIndex < 0) nextIndex = images.length - 1
            return nextIndex
        })
    }

    return(
        <div className="events-section pb-12 pt-24">
            <div className="max-w-6xl mx-auto px-4">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-2 sm:mb-4 md:mb-6 text-center text-gray-800 tracking-tight">
                    Science Talk Show
                </h1>
                <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gray-900 p-2 sm:p-4 md:p-6 lg:p-8 border-[10px] sm:border-[15px] md:border-[20px] border-gray-800">
                    <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-transparent opacity-20"></div>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 sm:w-16 md:w-20 h-2 sm:h-3 md:h-4 bg-gray-800 rounded-b-xl"></div>
                    <div className="absolute bottom-2 sm:bottom-3 md:bottom-4 left-0 right-0 flex justify-between items-center px-2 sm:px-3 md:px-4">
                        <div className="flex-1"></div>
                        <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
                            {images.map((_, index) => (
                                <button
                                    key={index}
                                    className={`w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                                        currentIndex === index ? 'bg-blue-600 w-3 sm:w-4' : 'bg-gray-400'
                                    }`}
                                    onClick={() => {
                                        setAutoPlay(false)
                                        setDirection(index > currentIndex ? 1 : -1)
                                        setCurrentIndex(index)
                                    }}
                                />
                            ))}
                        </div>
                        <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 flex-1 justify-end">
                            <div className="w-2 sm:w-2.5 md:w-3 h-2 sm:h-2.5 md:h-3 rounded-full bg-red-500"></div>
                            <div className="w-2 sm:w-2.5 md:w-3 h-2 sm:h-2.5 md:h-3 rounded-full bg-green-500"></div>
                        </div>
                    </div>
                    <div className="aspect-[16/9] sm:aspect-[18/9] md:aspect-[21/9] w-full relative">
                        <div className="absolute inset-0 bg-blue-500 opacity-5 animate-pulse"></div>
                        <AnimatePresence initial={false} custom={direction} mode="wait">
                            <motion.img
                                key={currentIndex}
                                src={images[currentIndex]}
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{
                                    y: { type: "spring", stiffness: 300, damping: 30 },
                                    opacity: { duration: 0.3 },
                                    scale: { duration: 0.3 }
                                }}
                                drag="y"
                                dragConstraints={{ top: 0, bottom: 0 }}
                                dragElastic={0.7}
                                onDragEnd={(e, { offset, velocity }) => {
                                    const swipe = swipePower(offset.y, velocity.y)
                                    if (swipe < -swipeConfidenceThreshold) {
                                        paginate(1)
                                    } else if (swipe > swipeConfidenceThreshold) {
                                        paginate(-1)
                                    }
                                }}
                                className="rounded-lg object-cover w-full h-full"
                                alt={`Event ${currentIndex + 1}`}
                            />
                        </AnimatePresence>
                    </div>
                </div>
                <div className="flex items-center justify-center mt-4 space-x-4">
                    <motion.button
                        className="rounded-full bg-white/80 backdrop-blur-sm p-2 sm:p-3 text-gray-800 hover:bg-white transition-all duration-200 shadow-lg"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => paginate(-1)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </motion.button>
                    <motion.button
                        className="rounded-full bg-white/80 backdrop-blur-sm p-2 sm:p-3 text-gray-800 hover:bg-white transition-all duration-200 shadow-lg"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => paginate(1)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </motion.button>
                </div>
            </div>
        </div>
    )
}