"use client"

import { Card, CardContent } from "../../../ui/card"
import { Skeleton } from "../../../ui/skeleton"

export default function LoadingSpinner() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
            <Card className="max-w-md w-full bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100/60">
                <CardContent className="p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <Skeleton className="h-4 w-32 mx-auto mb-2" />
                    <Skeleton className="h-3 w-48 mx-auto" />
                </CardContent>
            </Card>
        </div>
    )
} 