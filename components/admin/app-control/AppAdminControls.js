"use client"
import BannerControl from './AppAdminControlComponents/BannerControl';
import HelpAndSupportAdmin from './AppAdminControlComponents/HelpAndSupportAdmin';
import FeelingConfusedAdmin from './AppAdminControlComponents/FeelingConfusedAdmin';
import { useState } from 'react';

export default function AppAdminControls() {
    const [activeComponent, setActiveComponent] = useState('banner');

    return (
        <div className="h-full w-full">
            <div className="mb-6 mt-8">
                <div className="flex flex-wrap gap-4">
                    <div className="badge-container">
                        <div onClick={() => setActiveComponent('banner')} className={`${activeComponent === 'banner' ? 'bg-blue-200 border-2 border-blue-400' : 'bg-blue-100'} hover:bg-blue-200 transition-colors cursor-pointer p-4 rounded-lg flex flex-col items-center`}>
                            <span className="text-blue-600 font-medium">Banner Control</span>
                        </div>
                    </div>
                    
                    <div className="badge-container">
                        <div onClick={() => setActiveComponent('notification')} className={`${activeComponent === 'notification' ? 'bg-purple-200 border-2 border-purple-400' : 'bg-purple-100'} hover:bg-purple-200 transition-colors cursor-pointer p-4 rounded-lg flex flex-col items-center`}>
                            <span className="text-purple-600 font-medium">Notification Control</span>
                        </div>
                    </div>
                    
                    <div className="badge-container">
                        <div onClick={() => setActiveComponent('help')} className={`${activeComponent === 'help' ? 'bg-green-200 border-2 border-green-400' : 'bg-green-100'} hover:bg-green-200 transition-colors cursor-pointer p-4 rounded-lg flex flex-col items-center`}>
                            <span className="text-green-600 font-medium">Help And Support Queries</span>
                        </div>
                    </div>
                    
                    <div className="badge-container">
                        <div onClick={() => setActiveComponent('confused')} className={`${activeComponent === 'confused' ? 'bg-red-200 border-2 border-red-400' : 'bg-red-100'} hover:bg-red-200 transition-colors cursor-pointer p-4 rounded-lg flex flex-col items-center`}>
                            <span className="text-red-600 font-medium">Feeling Confused Students</span>
                        </div>
                    </div>
                </div>
            </div>
            {activeComponent === 'banner' && <BannerControl />}
            {activeComponent === 'help' && <HelpAndSupportAdmin />}
            {activeComponent === 'confused' && <FeelingConfusedAdmin />}
        </div>
    )
}