const FirstDashboard = () => {
    return (
        <div className="bg-gray-100 w-full p-4 h-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl hover:shadow-2xl transition duration-300 transform hover:scale-[1.02] border border-gray-200">
                    <h2 className="text-xl mb-3 text-dark border-b pb-2 font-semibold flex items-center gap-2">
                        <svg className="w-6 h-6 text-[#1d77bc]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        Current Courses
                    </h2>
                    <ul className="space-y-2">
                        <li className="p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition font-medium transform hover:translate-x-1">Mathematics 101</li>
                        <li className="p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition font-medium transform hover:translate-x-1">Physics Advanced</li>
                        <li className="p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition font-medium transform hover:translate-x-1">Computer Science</li>
                    </ul>
                </div>
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl hover:shadow-2xl transition duration-300 transform hover:scale-[1.02] border border-gray-200">
                    <h2 className="text-xl mb-3 text-dark border-b pb-2 font-semibold flex items-center gap-2">
                        <svg className="w-6 h-6 text-[#1d77bc]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Upcoming Assignments
                    </h2>
                    <ul className="space-y-2">
                        <li className="p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition transform hover:translate-x-1">
                            <span className="font-bold text-base">Math Quiz</span>
                            <p className="text-[#1d77bc]">Due: Tomorrow</p>
                        </li>
                        <li className="p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition transform hover:translate-x-1">
                            <span className="font-bold text-base">Physics Lab Report</span>
                            <p className="text-[#1d77bc]">Due: Next Week</p>
                        </li>
                    </ul>
                </div>
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl hover:shadow-2xl transition duration-300 transform hover:scale-[1.02] border border-gray-200">
                    <h2 className="text-xl mb-3 text-dark border-b pb-2 font-semibold flex items-center gap-2">
                        <svg className="w-6 h-6 text-[#1d77bc]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Recent Grades
                    </h2>
                    <ul className="space-y-2">
                        <li className="p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition transform hover:translate-x-1">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="font-bold">Mathematics</span>
                                    <span className="text-emerald-600 font-bold text-base">95%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div className="bg-emerald-600 h-2.5 rounded-full" style={{width: '95%'}}></div>
                                </div>
                            </div>
                        </li>
                        <li className="p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition transform hover:translate-x-1">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="font-bold">Physics</span>
                                    <span className="text-emerald-600 font-bold text-base">88%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div className="bg-emerald-600 h-2.5 rounded-full" style={{width: '88%'}}></div>
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl hover:shadow-2xl transition duration-300 transform hover:scale-[1.02] border border-gray-200">
                    <h2 className="text-xl mb-3 text-dark border-b pb-2 font-semibold flex items-center gap-2">
                        <svg className="w-6 h-6 text-[#1d77bc]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Upcoming Events
                    </h2>
                    <ul className="space-y-2">
                        <li className="p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition transform hover:translate-x-1">
                            <span className="font-bold text-base">Science Fair</span>
                            <p className="text-[#1d77bc]">Date: Next Month</p>
                        </li>
                        <li className="p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition transform hover:translate-x-1">
                            <span className="font-bold text-base">Career Counseling</span>
                            <p className="text-[#1d77bc]">Date: This Friday</p>
                        </li>
                    </ul>
                </div>
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl hover:shadow-2xl transition duration-300 transform hover:scale-[1.02] border border-gray-200">
                    <h2 className="text-xl mb-3 text-dark border-b pb-2 font-semibold flex items-center gap-2">
                        <svg className="w-6 h-6 text-[#1d77bc]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        Study Resources
                    </h2>
                    <ul className="space-y-2">
                        <li className="p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition cursor-pointer group transform hover:translate-x-1">
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-[#1d77bc] group-hover:text-blue-700 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                                <span className="font-bold">Online Library</span>
                            </div>
                        </li>
                        <li className="p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition cursor-pointer group transform hover:translate-x-1">
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-[#1d77bc] group-hover:text-blue-700 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                <span className="font-bold">Video Tutorials</span>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default FirstDashboard