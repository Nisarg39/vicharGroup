"use client"

import { VicharCard, VicharCardContent, VicharCardHeader, VicharCardTitle } from "../../../ui/vichar-card"
import { WifiOff, Download, Upload, Timer, RefreshCw } from "lucide-react"

export default function OfflineCapabilitiesCard() {
    return (
        <VicharCard aria-label="Offline and Sync Features" className="w-full max-w-md mx-auto">
            <VicharCardHeader>
                <VicharCardTitle className="flex items-center gap-2 text-xl">
                    <WifiOff className="w-5 h-5 text-blue-600" />
                    Offline & Sync Features
                </VicharCardTitle>
                <p className="text-gray-600 text-sm mt-1">Seamless experience even when you lose connection.</p>
            </VicharCardHeader>
            <VicharCardContent className="p-6 pt-2">
                <div className="flex flex-col gap-4">
                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-blue-100 rounded-lg flex items-center justify-center min-w-[44px] min-h-[44px]">
                            <Download className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <div className="font-semibold text-gray-900">Exam Data Cached</div>
                            <div className="text-sm text-gray-600">All exam questions and details are stored locally for offline access.</div>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-green-100 rounded-lg flex items-center justify-center min-w-[44px] min-h-[44px]">
                            <Upload className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <div className="font-semibold text-gray-900">Offline Submission</div>
                            <div className="text-sm text-gray-600">Complete exams offline and submit automatically when connection is restored.</div>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-purple-100 rounded-lg flex items-center justify-center min-w-[44px] min-h-[44px]">
                            <Timer className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <div className="font-semibold text-gray-900">Progress Saved</div>
                            <div className="text-sm text-gray-600">Your exam progress is automatically saved and can be resumed.</div>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-orange-100 rounded-lg flex items-center justify-center min-w-[44px] min-h-[44px]">
                            <RefreshCw className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                            <div className="font-semibold text-gray-900">Auto Sync</div>
                            <div className="text-sm text-gray-600">Results are automatically uploaded when you're back online.</div>
                        </div>
                    </div>
                </div>
            </VicharCardContent>
        </VicharCard>
    )
} 