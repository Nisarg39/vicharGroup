"use client"
import { useState } from 'react'
import { ClockIcon, DocumentTextIcon, CheckCircleIcon, ChartBarIcon, CalendarIcon, UserGroupIcon } from '@heroicons/react/24/outline'
import { useSelector } from 'react-redux'

export default function MyTestSeries() {
    const student = useSelector(state => state.login.studentDetails)
    const testSeries = student?.purchases?.filter(purchase => purchase.product.type === "test-series") || []

    return (
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="mb-10 text-center">
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#1d77bc] to-[#2d8bd4] mb-3">My Test Series</h2>
                <p className="text-gray-600 text-lg">Track and manage your test preparations</p>
            </div>

            <div className="grid gap-8">
                {testSeries.length > 0 ? (
                    testSeries.map((item) => (
                        <div 
                            key={item._id} 
                            className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
                        >
                            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="px-4 py-1.5 rounded-full text-sm font-semibold bg-blue-100 text-[#1d77bc]">
                                            Active
                                        </span>
                                        <span className="text-gray-500 flex items-center gap-1">
                                            <CalendarIcon className="w-4 h-4" />
                                            {new Date(item.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-800 mb-3">
                                        {item.product.name}
                                    </h3>

                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <DocumentTextIcon className="w-5 h-5 text-[#1d77bc]" />
                                            <span>{item.product.subject || "All Subjects"}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <ClockIcon className="w-5 h-5 text-[#1d77bc]" />
                                            <span>{item.product.duration || "3 hours"}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <UserGroupIcon className="w-5 h-5 text-[#1d77bc]" />
                                            <span>{item.product.enrollments || 0} Enrolled</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <CheckCircleIcon className="w-5 h-5 text-[#1d77bc]" />
                                            <span>{item.product.tests || 0} Tests</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-4 min-w-[200px]">
                                    <div className="text-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 shadow-md w-full">
                                        <div className="text-3xl font-bold text-[#1d77bc] mb-1">₹{item.amountPaid}</div>
                                        <div className="text-gray-600">Amount Paid</div>
                                    </div>

                                    <button 
                                        onClick={() => window.location.href = 'https://drcexam.in/'}
                                        className="w-full py-3 px-6 rounded-lg font-semibold text-white flex items-center justify-center gap-2 transform hover:scale-[1.02] transition-all duration-200 shadow-lg bg-gradient-to-r from-[#1d77bc] to-[#2d8bd4] hover:from-[#1d77bc]/90 hover:to-[#2d8bd4]/90"
                                    >
                                        <ChartBarIcon className="w-5 h-5" />
                                        Start Test
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                        <DocumentTextIcon className="w-16 h-16 text-[#1d77bc] mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">No Test Series Found</h3>
                        <p className="text-gray-600">Purchase a test series to start your preparation</p>
                    </div>
                )}
            </div>
        </div>
    )
}
