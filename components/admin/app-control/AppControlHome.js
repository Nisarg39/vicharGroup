"use client"
import { useState } from "react";
import AppAdminControls from "./AppAdminControls";
import AppProductControls from "./AppProductControls";
export default function AppControlHome() {
    const [selectedBadge, setSelectedBadge] = useState('Admin Controls')

    return (
        <div className="md:ml-64 min-h-screen w-full md:w-[calc(100%-16rem)] px-4 md:px-0">
            <div className="pt-8">
                <div className="bg-white rounded-lg shadow p-4">
                    <h1 className="text-2xl md:text-4xl font-semibold text-gray-900 text-center md:text-left">App Control</h1>
                    <div className="flex flex-wrap gap-2 mt-4">
                        <span 
                            onClick={() => setSelectedBadge('Admin Controls')}
                            className={`px-4 py-2 text-base font-medium ${selectedBadge === 'Admin Controls' ? 'bg-[#1d77bc]' : 'bg-gray-300'} text-white rounded-full cursor-pointer`}
                        >Admin Controls</span>
                        <span 
                            onClick={() => setSelectedBadge('Product Controls')}
                            className={`px-4 py-2 text-base font-medium ${selectedBadge === 'Product Controls' ? 'bg-[#1d77bc]' : 'bg-gray-300'} text-white rounded-full cursor-pointer`}
                        >Product Controls</span>
                    </div>
                    {selectedBadge === 'Admin Controls' ? <AppAdminControls /> : <AppProductControls />}
                </div>
            </div>
        </div>
    )
}