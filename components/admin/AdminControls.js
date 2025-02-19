"use client"
import { useState } from "react";
import CouponControls from "./admin_controls_components/CouponControls";

export default function AdminControls() {
    const [activeTab, setActiveTab] = useState('couponControls')

    return(
        <div className="ml-64 min-h-screen w-[calc(100%-16rem)]">
            <div className="pt-8">
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-4xl font-semibold text-gray-900">Admin Controls</h1>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-6">
                        <button
                            onClick={() => setActiveTab('couponControls')}
                            className={`px-4 py-2 text-sm rounded-full transition-colors duration-200 ${
                                activeTab === 'couponControls'
                                    ? 'bg-[#1d77bc] text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Coupon Controls
                        </button>
                    </div>
                    <div className="mt-4">
                        {activeTab === 'couponControls' && (
                            <div className="bg-white rounded-lg">
                                <CouponControls />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
