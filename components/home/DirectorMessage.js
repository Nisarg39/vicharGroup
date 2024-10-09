function DirectorMessage() {
    return (
        <section className="bg-gradient-to-r from-primary-100 to-primary-200 text-primary-900 py-32">
            <div className="container mx-auto px-4">
                <h2 className="text-5xl font-bold mb-16 text-center">Director's Message</h2>
                <div className="max-w-4xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between mb-12">
                        <div className="md:w-1/3 text-center md:text-left mb-8 md:mb-0">
                            <div className="relative w-40 h-40 mx-auto md:mx-0">
                                <img src="/director-avatar.jpg" alt="Director" className="w-40 h-40 rounded-full border-4 border-[#e96030] shadow-lg hover:scale-105 transition-transform duration-300" />
                                <div className="absolute inset-0 rounded-full border-4 border-[#e96030] animate-pulse"></div>
                            </div>
                            <p className="font-bold text-3xl mt-4 mb-2">Vivek Gupta</p>
                            <p className="text-primary-700 text-xl flex items-center justify-center md:justify-start">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                Director
                            </p>
                        </div>
                        <div className="md:w-2/3 space-y-6">
                            <p className="text-xl leading-relaxed flex items-start">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 mt-1 flex-shrink-0 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Welcome to our organization. As the director, I am pleased to share our vision and commitment to excellence.
                            </p>
                            <p className="text-xl leading-relaxed flex items-start">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 mt-1 flex-shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                Our team is dedicated to innovation, collaboration, and making a positive impact in our field.
                            </p>
                            <p className="text-xl leading-relaxed flex items-start">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 mt-1 flex-shrink-0 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Thank you for your interest and support. We look forward to working together towards a brighter future.
                            </p>
                        </div>
                    </div>
                    <div className="mt-12 text-center md:text-right">
                        <img src="/signature.png" alt="Director's Signature" className="inline-block h-20 hover:scale-105 transition-transform duration-300" />
                    </div>
                </div>
            </div>
        </section>
    )
}

export default DirectorMessage