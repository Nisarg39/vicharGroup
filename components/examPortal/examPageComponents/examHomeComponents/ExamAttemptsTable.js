"use client"

import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card"
import { Button } from "../../../ui/button"
import { Badge } from "../../../ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../ui/table"
import { ScrollArea } from "../../../ui/scroll-area"
import { BarChart3 } from "lucide-react"

export default function ExamAttemptsTable({ 
    allAttempts, 
    bestAttempt, 
    onViewAttemptDetails 
}) {
    if (allAttempts.length === 0) return null

    return (
        <Card className="bg-white/90 backdrop-blur-xl shadow-xl border border-gray-100/60">
            <CardHeader>
                <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    All Attempts
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[400px] w-full rounded-md border">
                    <Table className="min-w-full bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100/60">
                        <TableHeader className="bg-gradient-to-r from-blue-50/60 to-indigo-50/40 sticky top-0">
                            <TableRow>
                                <TableHead className="text-xs font-bold text-gray-700 uppercase tracking-wider">Attempt #</TableHead>
                                <TableHead className="text-xs font-bold text-gray-700 uppercase tracking-wider">Score</TableHead>
                                <TableHead className="text-xs font-bold text-gray-700 uppercase tracking-wider">Percentage</TableHead>
                                <TableHead className="text-xs font-bold text-gray-700 uppercase tracking-wider">Date</TableHead>
                                <TableHead className="text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-gray-100">
                            {allAttempts.map((attempt, idx) => {
                                // Use attemptNumber from backend if present, else fallback to idx+1
                                const attemptNumber = attempt.attemptNumber || (idx + 1);
                                const isBest = bestAttempt && attempt._id === bestAttempt._id;
                                return (
                                    <TableRow key={attempt._id} className={isBest ? "bg-green-50" : "hover:bg-blue-50/40 transition"}>
                                        <TableCell className="font-semibold">
                                            <div className="flex items-center gap-2">
                                                <span>{attemptNumber}</span>
                                                {isBest && (
                                                    <Badge className="bg-green-200 text-green-800 text-xs font-bold">Best</Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>{attempt.score} / {attempt.totalMarks}</TableCell>
                                        <TableCell>{attempt.percentage}%</TableCell>
                                        <TableCell className="text-sm">
                                            {new Date(attempt.completedAt).toLocaleDateString()}
                                            <br />
                                            <span className="text-gray-500">
                                                {new Date(attempt.completedAt).toLocaleTimeString()}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Button 
                                                size="sm" 
                                                variant="outline" 
                                                onClick={() => onViewAttemptDetails(attempt)}
                                                className="w-full sm:w-auto"
                                            >
                                                View Details
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </ScrollArea>
            </CardContent>
        </Card>
    )
} 