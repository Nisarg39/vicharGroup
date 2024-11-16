import React, { useState, useRef, useEffect } from 'react';

function DirectorMessage() {
    const [activeIndex, setActiveIndex] = useState(0);
    const scrollRef = useRef(null);

    const directorPoints = [
        {
            text: "To all aspiring candidates with big dreams, remember that success is a journey that begins with the right start. If your goal is to crack competitive exams like NEET, IIT-JEE, AIIMS, FOUNDATION or to gain a solid foundation in the Stock Market, Vichar Group is here to guide you every step of the way."
        },
        {
            text: "These exams require dedication, hard work, and the right guidance, and at Vichar Group, we are committed to helping each student reach their full potential. For us, success goes beyond simply qualifying in tough exams; it's about building a deep understanding and a strong foundation in the subjects, ensuring that you thrive not only in exams but throughout your career."
        },
        {
            text: "Vichar Group has earned the trust of both students and parents alike. Our students consistently achieve high ranks in medical and engineering entrance exams, and many go on to successful careers. We are equally dedicated to preparing students for success in the Stock Market, offering them the skills and knowledge to navigate today's financial world confidently."
        },
        {
            text: "We believe every student brings unique potential, and we take special care to support students from all backgrounds, including those from economically underprivileged families, helping them make their dreams a reality. At Vichar Group, we nurture not only academic skills but also personal growth, so every student leaves our institute with the confidence and drive to succeed."
        }
    ]

    const handleNext = () => {
        setActiveIndex((prevIndex) => (prevIndex + 1) % directorPoints.length);
    };

    const handlePrev = () => {
        setActiveIndex((prevIndex) => (prevIndex - 1 + directorPoints.length) % directorPoints.length);
    };

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = 0;
        }
    }, [activeIndex]);

    return (
        <section className="bg-gradient-to-r from-primary-100 to-primary-200 text-primary-900 py-12 sm:py-16 md:py-24 lg:py-32">
            <div className="container mx-auto px-4">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6 sm:mb-8 md:mb-12 lg:mb-16 text-center">Director's Message</h2>
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="w-full md:w-1/3 text-center mb-6 md:mb-0">
                            <div className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 mx-auto">
                                <img src="/director-avatar.jpg" alt="Director" className="w-full h-full rounded-full border-4 border-[#106fb8] shadow-lg hover:scale-105 transition-transform duration-300" />
                                <div className="absolute inset-0 rounded-full border-4 border-[#106fb8] animate-pulse"></div>
                            </div>
                            <p className="font-bold text-xl sm:text-2xl md:text-3xl mt-4 mb-2">Vivek Gupta</p>
                            <p className="text-primary-700 text-base sm:text-lg md:text-xl">Director</p>
                        </div>
                        <div className="w-full md:w-2/3">
                            <div className="bg-white p-6 rounded-lg shadow-md">
                                <div ref={scrollRef} className="h-48 overflow-y-auto mb-4 pr-4 flex items-center justify-center" style={{ scrollbarWidth: 'thin', scrollbarColor: '#106fb8 #f1f1f1' }}>
                                    <p className="text-sm sm:text-base md:text-lg leading-relaxed text-center">{directorPoints[activeIndex].text}</p>
                                </div>
                                <div className="flex justify-between items-center mt-6">
                                    <button onClick={handlePrev} className="bg-[#106fb8] text-white px-4 py-2 rounded-md hover:bg-[#f8f8f8] hover:text-[#106fb8] transition-colors duration-300">←</button>
                                    <div className="flex">
                                        {directorPoints.map((_, index) => (
                                            <div
                                                key={index}
                                                className={`w-3 h-3 rounded-full mx-1 ${index === activeIndex ? 'bg-primary-500' : 'bg-gray-300'}`}
                                            ></div>
                                        ))}
                                    </div>
                                    <button onClick={handleNext} className="bg-[#106fb8] text-white px-4 py-2 rounded-md hover:bg-[#f8f8f8] hover:text-[#106fb8] transition-colors duration-300">→</button>
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