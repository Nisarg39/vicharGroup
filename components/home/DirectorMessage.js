import React, { useState, useRef, useEffect } from 'react';

function DirectorMessage() {
    const [currentPoint, setCurrentPoint] = useState(0);
    const scrollRef = useRef(null);
    const [scrollPosition, setScrollPosition] = useState(0);
    const [maxScroll, setMaxScroll] = useState(0);

    const directorPoints = [
        {
            icon: (
                <img src="https://cdn-icons-gif.flaticon.com/17513/17513878.gif" alt="Lightning icon" className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 lg:h-10 lg:w-10 mr-2 mt-1 flex-shrink-0" />
            ),
            text: "To all aspiring candidates with big dreams, remember that success is a journey that begins with the right start. If your goal is to crack competitive exams like NEET, IIT-JEE, AIIMS, FOUNDATION or to gain a solid foundation in the Stock Market, Vichar Group is here to guide you every step of the way."
        },
        {
            icon: (
                <img src="https://cdn-icons-gif.flaticon.com/18124/18124694.gif" alt="Group icon" className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 lg:h-10 lg:w-10 mr-2 mt-1 flex-shrink-0" />
            ),
            text: "These exams require dedication, hard work, and the right guidance, and at Vichar Group, we are committed to helping each student reach their full potential. For us, success goes beyond simply qualifying in tough exams; it's about building a deep understanding and a strong foundation in the subjects, ensuring that you thrive not only in exams but throughout your career."
        },
        {
            icon: (
                <img src="https://cdn-icons-gif.flaticon.com/15401/15401473.gif" alt="Smile icon" className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 lg:h-10 lg:w-10 mr-2 mt-1 flex-shrink-0" />
            ),
            text: "Vichar Group has earned the trust of both students and parents alike. Our students consistently achieve high ranks in medical and engineering entrance exams, and many go on to successful careers. We are equally dedicated to preparing students for success in the Stock Market, offering them the skills and knowledge to navigate today's financial world confidently."
        },
        {
            icon: (
                <img src="https://cdn-icons-gif.flaticon.com/13311/13311725.gif" alt="Smile icon" className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 lg:h-10 lg:w-10 mr-2 mt-1 flex-shrink-0" />
            ),
            text: "We believe every student brings unique potential, and we take special care to support students from all backgrounds, including those from economically underprivileged families, helping them make their dreams a reality. At Vichar Group, we nurture not only academic skills but also personal growth, so every student leaves our institute with the confidence and drive to succeed."
        }
    ]

    const handleScroll = (direction) => {
        if (scrollRef.current) {
            const scrollAmount = direction === 'left' ? -300 : 300;
            scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    useEffect(() => {
        const handleScrollUpdate = () => {
            if (scrollRef.current) {
                setScrollPosition(scrollRef.current.scrollLeft);
                setMaxScroll(scrollRef.current.scrollWidth - scrollRef.current.clientWidth);
            }
        };

        if (scrollRef.current) {
            scrollRef.current.addEventListener('scroll', handleScrollUpdate);
            handleScrollUpdate();
        }

        return () => {
            if (scrollRef.current) {
                scrollRef.current.removeEventListener('scroll', handleScrollUpdate);
            }
        };
    }, []);

    return (
        <section className="bg-gradient-to-r from-primary-100 to-primary-200 text-primary-900 py-12 sm:py-16 md:py-24 lg:py-32">
            <div className="container mx-auto px-4">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6 sm:mb-8 md:mb-12 lg:mb-16 text-center">Director's Message</h2>
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col lg:flex-row items-center justify-between mb-6 sm:mb-8 md:mb-10 lg:mb-12">
                        <div className="w-full lg:w-1/4 text-center lg:text-left mb-6 lg:mb-0">
                            <div className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 mx-auto lg:mx-0">
                                <img src="/director-avatar.jpg" alt="Director" className="w-full h-full rounded-full border-4 border-[#e96030] shadow-lg hover:scale-105 transition-transform duration-300" />
                                <div className="absolute inset-0 rounded-full border-4 border-[#e96030] animate-pulse"></div>
                            </div>
                            <p className="font-bold text-xl sm:text-2xl md:text-3xl mt-3 sm:mt-4 mb-1 sm:mb-2">Vivek Gupta</p>
                            <p className="text-primary-700 text-base sm:text-lg md:text-xl flex items-center justify-center lg:justify-start">
                                <img src="/icons/briefcase.png" alt="Briefcase icon" className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 mr-2" />
                                Director
                            </p>
                        </div>
                        <div className="w-full lg:w-3/4">
                            <div className="relative">
                                <div ref={scrollRef} className="flex overflow-x-auto scrollbar-hide lg:grid lg:grid-cols-2 gap-4 sm:gap-6 no-scrollbar">
                                    {directorPoints.map((point, index) => (
                                        <div key={index} className="bg-white rounded-lg p-4 sm:p-6 flex items-start flex-shrink-0 w-full lg:w-auto hover:shadow-xl transition-shadow duration-300">
                                            <div className="flex-shrink-0 mr-3 sm:mr-4">{point.icon}</div>
                                            <p className="text-sm sm:text-base md:text-lg leading-relaxed">{point.text}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 flex justify-center items-center lg:hidden">
                                    <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-600 rounded-full"
                                            style={{
                                                width: `${(scrollPosition / maxScroll) * 100}%`,
                                                transition: 'width 0.3s ease-out',
                                            }}
                                        ></div>
                                    </div>
                                </div>
                                <div className="hidden lg:block absolute top-1/2 left-1/2 w-px h-full bg-gray-300 transform -translate-x-1/2 -translate-y-1/2"></div>
                                <div className="hidden lg:block absolute top-1/2 left-0 w-full h-px bg-gray-300 transform -translate-y-1/2"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default DirectorMessage