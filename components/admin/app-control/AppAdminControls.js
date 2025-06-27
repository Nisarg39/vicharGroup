"use client"
import BannerControl from './AppAdminControlComponents/BannerControl';
import { useState } from 'react';

export default function AppAdminControls() {
    const [showBanner, setShowBanner] = useState(true);

    return (
        <div className="h-full w-full">
            <div className="mb-6 mt-8">
                <div className="flex flex-wrap gap-4">
                    <div className="badge-container">
                        <div onClick={() => setShowBanner(!showBanner)} className={`${showBanner ? 'bg-blue-200 border-2 border-blue-400' : 'bg-blue-100'} hover:bg-blue-200 transition-colors cursor-pointer p-4 rounded-lg flex flex-col items-center`}>
                            <span className="text-blue-600 font-medium">Banner Control</span>
                        </div>
                    </div>
                    
                    <div className="badge-container">
                        <div className="bg-purple-100 hover:bg-purple-200 transition-colors cursor-pointer p-4 rounded-lg flex flex-col items-center">
                            <span className="text-purple-600 font-medium">Notification Control</span>
                        </div>
                    </div>
                </div>
            </div>
            {showBanner && <BannerControl />}
        </div>
    )
}