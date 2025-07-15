"use client"
import { useState } from 'react';
import JoinCollege from './examViewComponents/JoinCollege';
import MyTestSeries from './examViewComponents/MyTestSeries';
import AvailableTests from './examViewComponents/AvailableTests';

export default function ExamView() {
    const [activeSection, setActiveSection] = useState('joinCollege');

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50/80 via-blue-50/20 to-indigo-50/10 w-full px-4 sm:px-6 md:px-8 py-6 rounded-3xl relative overflow-hidden backdrop-blur-lg">
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-10 left-10 w-20 h-20 bg-[#e96030]/20 rounded-full blur-xl animate-pulse"></div>
                <div className="absolute bottom-20 right-20 w-32 h-32 bg-[#ff8a65]/20 rounded-full blur-2xl animate-bounce"></div>
                <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-[#e96030]/20 rounded-full blur-lg animate-pulse delay-1000"></div>
            </div>
            
            <div className="relative z-10 max-w-7xl mx-auto space-y-6 sm:space-y-8">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#1d77bc] to-[#2d8bd4] p-6 sm:p-8 rounded-t-3xl">
                    <div className="text-center">
                        <h1 className="text-4xl sm:text-5xl font-bold mb-3 text-white drop-shadow-lg">Exam Portal</h1>
                        <p className="text-blue-50 text-lg md:text-xl">Choose your exam preparation path</p>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex justify-center -mt-4">
                    <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-1.5 shadow-lg border border-gray-100/50 hover:shadow-xl transition-all duration-300">
                        {[
                            { id: 'joinCollege', label: 'Join College' },
                            { id: 'purchased', label: 'My Test Series' },
                            { id: 'available', label: 'Available Tests' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveSection(tab.id)}
                                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                                    activeSection === tab.id
                                        ? 'bg-gradient-to-r from-[#e96030] to-[#ff8a65] text-white shadow-md transform scale-105'
                                        : 'text-gray-600 hover:text-[#e96030] hover:bg-orange-50/50'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Section with Animation */}
                <div className="transform transition-all duration-500 hover:scale-[1.01]">
                    <div className="bg-white/90 backdrop-blur-xl p-6 sm:p-8 rounded-3xl shadow-xl border border-gray-100/50 hover:shadow-2xl transition-all duration-500 hover:bg-white/95">
                        {activeSection === 'joinCollege' && <JoinCollege />}
                        {activeSection === 'purchased' && <MyTestSeries />}
                        {activeSection === 'available' && <AvailableTests />}
                    </div>
                </div>

                {/* Quick Stats Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-8">
                    {[
                        {
                            title: "Available Exams",
                            value: "24+",
                            icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
                            description: "Ready to take",
                            colors: {
                                bg: "from-white to-blue-50/50",
                                iconBg: "bg-blue-500/10",
                                iconColor: "text-blue-600",
                                badge: "bg-blue-100/80 text-blue-600"
                            }
                        },
                        {
                            title: "Colleges",
                            value: "50+",
                            icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
                            description: "Partner institutions",
                            colors: {
                                bg: "from-white to-green-50/50",
                                iconBg: "bg-green-500/10",
                                iconColor: "text-green-600",
                                badge: "bg-green-100/80 text-green-600"
                            }
                        },
                        {
                            title: "Success Rate",
                            value: "92%",
                            icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
                            description: "Student satisfaction",
                            colors: {
                                bg: "from-white to-purple-50/50",
                                iconBg: "bg-purple-500/10",
                                iconColor: "text-purple-600",
                                badge: "bg-purple-100/80 text-purple-600"
                            }
                        },
                        {
                            title: "Practice Tests",
                            value: "100+",
                            icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01",
                            description: "For all subjects",
                            colors: {
                                bg: "from-white to-orange-50/50",
                                iconBg: "bg-orange-500/10",
                                iconColor: "text-orange-600",
                                badge: "bg-orange-100/80 text-orange-600"
                            }
                        }
                    ].map((stat, index) => (
                        <div 
                            key={index}
                            className={`bg-gradient-to-br ${stat.colors.bg} p-5 rounded-2xl border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group`}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-2.5 ${stat.colors.iconBg} rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                                    <svg className={`w-5 h-5 ${stat.colors.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon} />
                                    </svg>
                                </div>
                                <span className={`text-xs font-semibold ${stat.colors.badge} px-3 py-1.5 rounded-full`}>
                                    {stat.title.toUpperCase()}
                                </span>
                            </div>
                            <p className={`text-3xl font-bold ${stat.colors.iconColor} mb-2`}>{stat.value}</p>
                            <p className={`text-sm ${stat.colors.iconColor}/80 flex items-center gap-1.5`}>
                                <span className={`w-2 h-2 ${stat.colors.iconColor} rounded-full animate-pulse`}></span>
                                {stat.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
