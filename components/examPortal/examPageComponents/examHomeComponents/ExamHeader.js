"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent } from "../../../ui/card"
import { Button } from "../../../ui/button"
import { Badge } from "../../../ui/badge"
import { Alert, AlertDescription } from "../../../ui/alert"
import { ArrowLeft, Wifi, WifiOff, AlertCircle, Upload, Download } from "lucide-react"

export default function ExamHeader({ 
    student, 
    isOnline, 
    offlineSubmissions, 
    onSyncOfflineData, 
    onViewResults 
}) {
    const router = useRouter()

    return (
        <Card className="bg-white/70 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30 overflow-hidden group hover:shadow-3xl transition-all duration-500 relative">
            {/* Background Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-purple-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <CardContent className="p-8 relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-6">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.back()}
                            className="p-3 hover:bg-gradient-to-br hover:from-gray-100 hover:to-gray-200 rounded-2xl transition-all duration-300 transform hover:scale-110 shadow-md hover:shadow-lg"
                        >
                            <ArrowLeft className="w-6 h-6 text-gray-700" />
                        </Button>
                        <div className="space-y-1">
                            <h1 className="text-3xl font-bold bg-black bg-clip-text text-transparent">
                                Exam Portal
                            </h1>
                            <p className="text-gray-600 text-lg font-medium">
                                Welcome back, <span className="text-blue-600 font-bold">{student?.name}</span>
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        {isOnline ? (
                            <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border-0">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                    <Wifi className="w-4 h-4" />
                                    <span className="font-semibold">Online</span>
                                </div>
                            </Badge>
                        ) : (
                            <Badge className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border-0">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                                    <WifiOff className="w-4 h-4" />
                                    <span className="font-semibold">Offline</span>
                                </div>
                            </Badge>
                        )}
                    </div>
                </div>
                
                {offlineSubmissions.length > 0 && (
                    <Alert className="bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-200 rounded-2xl mb-6 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                        {/* Alert Background Pattern */}
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-100/20 to-amber-100/20 opacity-50"></div>
                        
                        <div className="relative z-10 flex items-start gap-4">
                            <div className="p-2 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-xl shadow-md">
                                <AlertCircle className="w-6 h-6 text-white" />
                            </div>
                            
                            <AlertDescription className="flex-1">
                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                    <div>
                                        <p className="font-bold text-yellow-900 text-lg mb-1">
                                            Pending Sync Required
                                        </p>
                                        <p className="text-yellow-800 font-medium">
                                            {offlineSubmissions.length} exam result{offlineSubmissions.length > 1 ? 's' : ''} waiting to be uploaded to server
                                        </p>
                                    </div>
                                    
                                    {isOnline && (
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <Button 
                                                onClick={onSyncOfflineData}
                                                className="bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                                            >
                                                <div className="p-1 bg-white/20 rounded-lg">
                                                    <Upload className="w-4 h-4" />
                                                </div>
                                                Sync Now
                                            </Button>
                                            <Button 
                                                onClick={onViewResults}
                                                variant="outline"
                                                className="border-2 border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:border-blue-400 font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                                            >
                                                <div className="p-1 bg-blue-200 rounded-lg">
                                                    <Download className="w-4 h-4" />
                                                </div>
                                                View Results
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </AlertDescription>
                        </div>
                    </Alert>
                )}
            </CardContent>
        </Card>
    )
} 