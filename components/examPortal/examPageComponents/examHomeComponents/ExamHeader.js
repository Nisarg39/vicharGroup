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
        <Card className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100/60">
            <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.back()}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Exam Portal</h1>
                            <p className="text-gray-600">Welcome, {student?.name}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {isOnline ? (
                            <Badge variant="default" className="bg-green-100 text-green-800">
                                <Wifi className="w-4 h-4 mr-1" />
                                Online
                            </Badge>
                        ) : (
                            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                                <WifiOff className="w-4 h-4 mr-1" />
                                Offline
                            </Badge>
                        )}
                    </div>
                </div>
                
                {offlineSubmissions.length > 0 && (
                    <Alert className="bg-yellow-50 border border-yellow-200 rounded-xl mb-4">
                        <AlertCircle className="w-5 h-5 text-yellow-600" />
                        <AlertDescription className="text-yellow-800">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <span className="font-medium">
                                    {offlineSubmissions.length} exam(s) pending upload
                                </span>
                                {isOnline && (
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <Button 
                                            onClick={onSyncOfflineData}
                                            size="sm"
                                            className="bg-yellow-600 hover:bg-yellow-700 text-white"
                                        >
                                            <Upload className="w-4 h-4 mr-1" />
                                            Sync Now
                                        </Button>
                                        <Button 
                                            onClick={onViewResults}
                                            size="sm"
                                            variant="outline"
                                            className="border-blue-200 text-blue-700 hover:bg-blue-50"
                                        >
                                            <Download className="w-4 h-4 mr-1" />
                                            View Results
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </AlertDescription>
                    </Alert>
                )}
            </CardContent>
        </Card>
    )
} 