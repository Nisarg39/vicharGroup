"use client"

import { Alert, AlertDescription } from "../../../ui/alert"
import { BarChart3 } from "lucide-react"

export default function PreviousAttemptAlert({ hasAttempted }) {
    if (!hasAttempted) return null

    return (
        <Alert className="bg-blue-50 border border-blue-200 rounded-xl">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <AlertDescription className="text-blue-800">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h3 className="font-semibold text-blue-900">Previous Attempt Found</h3>
                        <p className="text-sm text-blue-700">
                            You have already attempted this exam. You can retake the exam if allowed.
                        </p>
                    </div>
                </div>
            </AlertDescription>
        </Alert>
    )
} 