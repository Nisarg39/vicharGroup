"use client"

import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card"
import { WifiOff, Download, Upload, Timer, RefreshCw } from "lucide-react"

export default function OfflineCapabilitiesCard() {
    return (
        <Card className="bg-white/90 backdrop-blur-xl shadow-xl border border-gray-100/60">
            <CardHeader>
                <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <WifiOff className="w-5 h-5 text-blue-600" />
                    Offline Capabilities
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Download className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900">Exam Data Cached</h4>
                                <p className="text-sm text-gray-600">All exam questions and details are stored locally for offline access.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <Upload className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900">Offline Submission</h4>
                                <p className="text-sm text-gray-600">Complete exams offline and submit automatically when connection is restored.</p>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Timer className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900">Progress Saved</h4>
                                <p className="text-sm text-gray-600">Your exam progress is automatically saved and can be resumed.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <RefreshCw className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900">Auto Sync</h4>
                                <p className="text-sm text-gray-600">Results are automatically uploaded when you're back online.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
} 