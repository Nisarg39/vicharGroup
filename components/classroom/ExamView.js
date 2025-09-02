"use client"
import { useState } from 'react';
import JoinCollege from './examViewComponents/JoinCollege';
import MyTestSeriesOptimized from './examViewComponents/MyTestSeriesOptimized';

export default function ExamView() {
    const [activeSection, setActiveSection] = useState('joinCollege');

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50/80 via-blue-50/20 to-indigo-50/10 w-full px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 rounded-3xl relative overflow-hidden backdrop-blur-lg">
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-10 left-10 w-20 h-20 bg-[#e96030]/20 rounded-full blur-xl animate-pulse"></div>
                <div className="absolute bottom-20 right-20 w-32 h-32 bg-[#ff8a65]/20 rounded-full blur-2xl animate-bounce"></div>
                <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-[#e96030]/20 rounded-full blur-lg animate-pulse delay-1000"></div>
            </div>
            
            <div className="relative z-10 max-w-7xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#1d77bc] to-[#2d8bd4] p-4 sm:p-6 lg:p-8 rounded-t-3xl">
                    <div className="text-center">
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3 text-white drop-shadow-lg">Exam Portal</h1>
                        <p className="text-blue-50 text-base sm:text-lg md:text-xl">Choose your exam preparation path</p>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex justify-center -mt-2 sm:-mt-4 px-2">
                    <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-1 sm:p-1.5 shadow-lg border border-gray-100/50 hover:shadow-xl transition-all duration-300 w-full sm:w-auto">
                        <div className="flex w-full sm:w-auto">
                            {[
                                { id: 'joinCollege', label: 'Join College' },
                                { id: 'purchased', label: 'My Test Series' }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveSection(tab.id)}
                                    className={`flex-1 sm:flex-none px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3 rounded-xl font-medium transition-all duration-300 text-xs sm:text-sm lg:text-base whitespace-nowrap ${
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
                </div>

                {/* Content Section with Animation */}
                <div className="transform transition-all duration-500 hover:scale-[1.01]">
                    <div className="bg-white/90 backdrop-blur-xl p-3 sm:p-6 lg:p-8 rounded-3xl shadow-xl border border-gray-100/50 hover:shadow-2xl transition-all duration-500 hover:bg-white/95">
                        {activeSection === 'joinCollege' && <JoinCollege />}
                        {activeSection === 'purchased' && <MyTestSeriesOptimized />}
                    </div>
                </div>

            </div>
        </div>
    );
}
