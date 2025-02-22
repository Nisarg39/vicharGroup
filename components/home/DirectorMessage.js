import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

function DirectorMessage() {
    const [activeIndex, setActiveIndex] = useState(0);
    const scrollRef = useRef(null);
    const touchStartX = useRef(null);

    const totalPoints = 4;

    const handleNext = () => {
        setActiveIndex((prevIndex) => (prevIndex + 1) % totalPoints);
    };

    const handlePrev = () => {
        setActiveIndex((prevIndex) => (prevIndex - 1 + totalPoints) % totalPoints);
    };

    const handleTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e) => {
        if (!touchStartX.current) return;

        const touchEndX = e.changedTouches[0].clientX;
        const diff = touchStartX.current - touchEndX;

        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                handleNext();
            } else {
                handlePrev();
            }
        }

        touchStartX.current = null;
    };

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = 0;
        }
    }, [activeIndex]);

    return (
        <section className="w-full pb-16 flex items-center bg-transparent pt-12 md:pt-20 overflow-hidden relative">
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
                    <div className="w-12 h-12 flex items-center justify-center bg-yellow-300 backdrop-blur-sm rounded-full opacity-50 shadow-lg">
                        <span className="text-black text-lg font-bold">π</span>
                    </div>
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
                    <div className="w-16 h-16 flex items-center justify-center bg-blue-400 backdrop-blur-sm rounded-lg opacity-40 shadow-lg">
                        <span className="text-black text-xl font-bold">∑</span>
                    </div>
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
                    <div className="w-10 h-10 flex items-center justify-center bg-orange-400 backdrop-blur-sm rounded-full opacity-45 shadow-lg">
                        <span className="text-black text-lg font-bold">∫</span>
                    </div>
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
                    <div className="w-14 h-14 flex items-center justify-center bg-gray-400 backdrop-blur-sm rounded-lg opacity-40 rotate-45 shadow-lg">
                        <span className="text-black text-xl font-bold -rotate-45">√</span>
                    </div>
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
                    <div className="w-8 h-8 flex items-center justify-center bg-green-400 backdrop-blur-sm rounded-full opacity-50 shadow-lg">
                        <span className="text-black text-sm font-bold">∞</span>
                    </div>
                </motion.div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <h2 className="text-3xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-center mb-6 sm:mb-10 text-gray-800 leading-tight tracking-tight">Director's Message</h2>
                <div className="max-w-6xl mx-auto">
                    <div className="bg-gradient-to-b from-gray-200 via-white to-gray-200 p-4 sm:p-6 md:p-8 rounded-3xl shadow-2xl backdrop-blur-lg">
                        <div className="bg-gray-50/90 p-4 sm:p-6 md:p-8 rounded-3xl shadow-[0_20px_50px_rgba(0,_0,_0,_0.1)] hover:shadow-[0_20px_60px_rgba(0,_0,_0,_0.2)] transition-all duration-300 border-2 border-gray-200/80 backdrop-filter">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 md:gap-8">
                                <div className="w-full md:w-1/3 text-center border-b-2 md:border-b-0 border-[#106fb8] pb-2 md:pb-0">
                                    <div className="relative w-56 h-64 sm:w-40 sm:h-56 md:w-48 md:h-56 lg:w-64 lg:h-72 mx-auto group">
                                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#106fb8]/20 rounded-xl z-20"></div>
                                        <Image src="/vivekSir2.png" alt="Director" fill className="object-cover rounded-xl relative z-10 transform group-hover:scale-105 transition-transform duration-300 border-b-1 border-[#106fb8] shadow-lg" />
                                    </div>
                                    <p className="font-bold text-3xl sm:text-3xl md:text-3xl lg:text-3xl text-gray-800 mt-4">
                                        ER. Vivek Gupta
                                    </p>
                                    <div className="flex items-center justify-center mt-2">
                                        <p className="text-gray-600 text-sm md:text-base font-medium">
                                            Director and Founder
                                        </p>
                                        <div className="flex items-center ml-2 space-x-2">
                                            <Link href="https://www.takalkarjeeneet.com" target="_blank">
                                                <Image 
                                                    src="/takalkarLogo.ico" 
                                                    alt="Takalkar Academy Logo" 
                                                    width={24} 
                                                    height={24} 
                                                    className="rounded-full border-2 border-[#106fb8] object-cover transform hover:scale-125 transition-transform duration-300 cursor-pointer shadow-md" 
                                                />
                                            </Link>
                                        </div>
                                    </div>
                                    <p className="text-gray-500 text-xs sm:text-sm font-medium bg-gray-100/80 inline-block rounded-full px-4 py-1 mt-2 backdrop-blur-sm">( BTech IIT Madras )</p>
                                </div>
                                <div className="w-full md:w-2/2">
                                    <div 
                                        ref={scrollRef} 
                                        className="h-54 sm:h-40 md:h-48 overflow-y-auto mb-4 pr-4 flex items-center justify-center pt-2 md:pt-4 scrollbar-thin scrollbar-thumb-[#106fb8] scrollbar-track-gray-200 bg-white/50 rounded-xl p-4" 
                                        style={{ scrollbarWidth: 'thin', scrollbarColor: '#106fb8 #e5e7eb' }}
                                        onTouchStart={handleTouchStart}
                                        onTouchEnd={handleTouchEnd}
                                    >
                                        {activeIndex === 0 && (
                                            <p className="text-sm sm:text-sm md:text-base lg:text-lg leading-relaxed text-left animate-fade-in text-gray-600">
                                                To all aspiring candidates with big dreams, remember that success is a journey that begins with the right start. If your goal is to crack competitive exams like <span className='text-[#e96030] font-semibold hover:text-[#e96030] transition-colors duration-300'>NEET, IIT-JEE, MHT-CET, FOUNDATION</span> or to gain a solid foundation in the Stock Market, Vichar Group is here to guide you every step of the way.
                                            </p>
                                        )}
                                        {activeIndex === 1 && (
                                            <p className="text-sm sm:text-sm md:text-base lg:text-lg leading-relaxed text-left animate-fade-in text-gray-600">
                                                These exams require dedication, hard work, and the right guidance, and at Vichar Group, we are committed to helping each student reach their full potential. For us, success goes beyond simply qualifying in tough exams; it's about building a deep understanding and a strong foundation in the subjects, ensuring that you thrive not only in exams but throughout your career.
                                            </p>
                                        )}
                                        {activeIndex === 2 && (
                                            <p className="text-sm sm:text-sm md:text-base lg:text-lg leading-relaxed text-left animate-fade-in text-gray-600">
                                                Vichar Group has earned the trust of both students and parents alike. Our students consistently achieve high ranks in medical and engineering entrance exams, and many go on to successful careers. We are equally dedicated to preparing students for success in the Stock Market, offering them the skills and knowledge to navigate today's financial world confidently.
                                            </p>
                                        )}
                                        {activeIndex === 3 && (
                                            <p className="text-sm sm:text-sm md:text-base lg:text-lg leading-relaxed text-left animate-fade-in text-gray-600">
                                                We believe every student brings unique potential, and we take special care to support students from all backgrounds, including those from economically underprivileged families, helping them make their dreams a reality. At Vichar Group, we nurture not only academic skills but also personal growth, so every student leaves our institute with the confidence and drive to succeed.
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex justify-between items-center mt-4 sm:mt-6 bg-white/50 p-4 rounded-xl">
                                        <button onClick={handlePrev} className="bg-[#106fb8] text-white px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-lg hover:bg-white hover:text-[#106fb8] transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-xl text-sm sm:text-base backdrop-blur-sm">←</button>
                                        <div className="flex space-x-1 sm:space-x-2">
                                            {[...Array(totalPoints)].map((_, index) => (
                                                <div
                                                    key={index}
                                                    className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 transform hover:scale-125 cursor-pointer ${index === activeIndex ? 'bg-[#106fb8] scale-110' : 'bg-gray-200'}`}
                                                    onClick={() => setActiveIndex(index)}
                                                ></div>
                                            ))}
                                        </div>
                                        <button onClick={handleNext} className="bg-[#106fb8] text-white px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-lg hover:bg-white hover:text-[#106fb8] transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-xl text-sm sm:text-base backdrop-blur-sm">→</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default DirectorMessage