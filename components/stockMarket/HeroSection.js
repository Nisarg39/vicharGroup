"use client"
import { motion } from 'framer-motion'
import Image from 'next/image'
import { useState } from 'react'

export default function HeroSection(){
    const slides = [
        {
            src: "https://wallpapercg.com/download/heartbeat-stock-market-candlestick-trading-chart-amoled--19463.png",
            alt: "Stock Market Classes"
        }
    ]
    
    const [currentSlide, setCurrentSlide] = useState(0)
    
    const handleTouchStart = (e) => {
        setTouchStart(e.touches[0].clientX)
    }
    
    const handleTouchMove = (e) => {
        setTouchMove(e.touches[0].clientX)
    }
    
    const handleTouchEnd = () => {
        if (touchStart - touchMove > 75) {
            setCurrentSlide((prev) => (prev + 1) % slides.length)
        }
        
        if (touchMove - touchStart > 75) {
            setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
        }
    }
    
    return (
        <section className="w-full min-h-screen flex items-center bg-gradient-to-b from-white to-gray-200 pt-12 md:pt-20 overflow-hidden relative">
            <div className="absolute inset-0 pointer-events-none">
                <motion.div
                    className="absolute top-20 left-10 hidden md:block"
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 180, 360],
                    }}
                    transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                >
                    <div className="w-12 h-12 bg-yellow-300 rounded-full opacity-50 shadow-lg" />
                </motion.div>
                
                <motion.div
                    className="absolute bottom-20 right-10 hidden md:block"
                    animate={{
                        y: [0, -20, 0],
                        x: [0, 20, 0],
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    <div className="w-16 h-16 bg-blue-400 rounded-lg opacity-40 shadow-lg" />
                </motion.div>
                
                <motion.div
                    className="absolute top-1/3 right-1/4"
                    animate={{
                        scale: [1, 0.8, 1],
                        rotate: [0, -90, 0],
                    }}
                    transition={{
                        duration: 6,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    <div className="w-10 h-10 bg-orange-400 rounded-full opacity-45 shadow-lg" />
                </motion.div>
                
                <motion.div
                    className="absolute bottom-1/4 left-1/4"
                    animate={{
                        x: [0, 30, 0],
                        y: [0, -30, 0],
                    }}
                    transition={{
                        duration: 7,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                >
                    <div className="w-14 h-14 bg-gray-400 rounded-lg opacity-40 rotate-45 shadow-lg" />
                </motion.div>
                
                <motion.div
                    className="absolute top-1/2 left-10"
                    animate={{
                        rotate: [0, 360],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                >
                    <div className="w-8 h-8 bg-green-400 rounded-full opacity-50 shadow-lg" />
                </motion.div>
                
                <motion.div
                    className="absolute bottom-32 right-1/3"
                    animate={{
                        y: [0, 40, 0],
                        x: [0, -20, 0],
                    }}
                    transition={{
                        duration: 6,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    <div className="w-12 h-12 bg-purple-400 rounded-lg opacity-40 shadow-lg" />
                </motion.div>
                
                <motion.div
                    className="absolute top-40 right-20"
                    animate={{
                        scale: [1, 0.7, 1],
                        rotate: [0, 180, 0],
                    }}
                    transition={{
                        duration: 9,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                >
                    <div className="w-10 h-10 bg-pink-400 rounded-full opacity-45 shadow-lg" />
                </motion.div>
                
                <motion.div
                    className="absolute top-1/4 left-1/2"
                    animate={{
                        scale: [1, 1.3, 1],
                        rotate: [0, 270, 0],
                    }}
                    transition={{
                        duration: 7,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                >
                    <div className="w-10 h-10 bg-teal-400 rounded-full opacity-40 shadow-lg" />
                </motion.div>
                
                <motion.div
                    className="absolute bottom-40 left-20"
                    animate={{
                        y: [0, 30, 0],
                        x: [0, 30, 0],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    <div className="w-12 h-12 bg-indigo-400 rounded-lg opacity-35 shadow-lg" />
                </motion.div>
                
                <motion.div
                    className="absolute top-32 left-1/3"
                    animate={{
                        rotate: [0, -180, 0],
                        scale: [1, 0.8, 1],
                    }}
                    transition={{
                        duration: 6,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                >
                    <div className="w-8 h-8 bg-amber-400 rounded-full opacity-45 shadow-lg" />
                </motion.div>
                
                <motion.div
                    className="absolute bottom-1/2 right-20"
                    animate={{
                        x: [0, -25, 0],
                        y: [0, -25, 0],
                    }}
                    transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    <div className="w-14 h-14 bg-lime-400 rounded-lg opacity-40 rotate-45 shadow-lg" />
                </motion.div>
            </div>
            
            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col lg:flex-row lg:gap-8 items-center">
                    <div className="order-2 lg:order-1 lg:w-1/3 mt-8 lg:mt-0">
                        <h1 className="text-7xl md:text-7xl lg:text-8xl font-extrabold mb-4 lg:mb-8 animate-fade-in">
                            <span className={`${currentSlide === 0 ? "bg-gradient-to-r from-[#e96030] to-[#ff8a65]" : "bg-gradient-to-r from-[#1d77bc] to-[#4da3e4]"} text-transparent bg-clip-text hover:scale-105 transition-transform duration-300`}>S</span>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-700 to-gray-800 hover:from-gray-800 hover:to-black transition-colors duration-300">tock</span>
                            <br />
                            <span className={`${currentSlide === 0 ? "bg-gradient-to-r from-[#1d77bc] to-[#4da3e4]" : "bg-gradient-to-r from-[#e96030] to-[#ff8a65]"} text-transparent bg-clip-text hover:scale-105 transition-transform duration-300`}>M</span>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-700 to-gray-800 hover:from-gray-800 hover:to-black transition-colors duration-300">arket</span>
                        </h1>
                        <p className="text-gray-600 text-lg lg:text-xl mb-4 lg:mb-8 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 bg-clip-text text-transparent animate-slide-up">
                            Unlock the Mysteries of the Stock Market with our Expert Guidance.
                        </p>
                        <div className="flex items-center space-x-4 mb-4 lg:mb-8 animate-bounce-slow">
                            {slides.map((_, index) => (
                                <button
                                    key={index}
                                    className={`h-4 transition-all duration-300 rounded-full border-4 border-black ${
                                        currentSlide === index ? 'w-16 bg-yellow-300 hover:bg-yellow-400 translate-y-1 translate-x-1 scale-110' : 'w-8 bg-white hover:bg-gray-100'
                                    } shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:scale-105`}
                                    onClick={() => setCurrentSlide(index)}
                                />
                            ))}
                        </div>
                    </div>
                    
                    <div className="order-1 lg:order-2 lg:w-2/3 w-full">
                        <div
                            className="relative w-full h-[200px] md:h-[300px] lg:h-[400px] rounded-3xl border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden transform transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:scale-[1.02] group"
                            onTouchStart={handleTouchStart}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleTouchEnd}
                        >
                            {slides.map((slide, index) => (
                                <div
                                    key={index}
                                    className={`absolute inset-0 transform transition-transform duration-500 ${
                                        index === currentSlide
                                            ? 'translate-x-0 opacity-100'
                                            : index < currentSlide
                                                ? '-translate-x-full opacity-0'
                                                : 'translate-x-full opacity-0'
                                    }`}
                                >
                                    <Image
                                        src={slide.src}
                                        alt={slide.alt}
                                        fill
                                        style={{ objectFit: "cover" }}
                                        priority={index === 0}
                                        className="hover:scale-105 transition-transform duration-300 group-hover:scale-110"
                                    />
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                        <h3 className="text-white text-2xl font-bold tracking-wider">{slide.alt}</h3>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}