"use client"
import { showFeelingConsfusedData, messageSeenFeelingConfused, contactedToggleFeelingConfused } from "../../../../server_actions/actions/adminActions"
import { useState, useEffect } from 'react'

export default function FeelingConfusedAdmin() {
    const [confusedData, setConfusedData] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [loading, setLoading] = useState(true)

    const fetchConfusedData = async (page = 1) => {
        setLoading(true)
        try {
            const result = await showFeelingConsfusedData(page)
            if (result.success) {
                setConfusedData(result)
                setCurrentPage(page)
            }
        } catch (error) {
            console.error('Error fetching confused data:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchConfusedData(currentPage)
    }, [])

    const handleMarkAsSeen = async (id) => {
        try {
            const result = await messageSeenFeelingConfused(id)
            if (result.success) {
                fetchConfusedData(currentPage)
            }
        } catch (error) {
            console.error('Error marking as seen:', error)
        }
    }

    const handleToggleContacted = async (id) => {
        try {
            const result = await contactedToggleFeelingConfused(id)
            if (result.success) {
                fetchConfusedData(currentPage)
            }
        } catch (error) {
            console.error('Error toggling contacted status:', error)
        }
    }

    const handlePageChange = (page) => {
        fetchConfusedData(page)
    }

    const getStreamBadgeColor = (stream) => {
        const colors = {
            'JEE': 'bg-blue-100 text-blue-800',
            'NEET': 'bg-green-100 text-green-800',
            'MHT-CET': 'bg-purple-100 text-purple-800',
            'SSC': 'bg-orange-100 text-orange-800',
            'ICSE': 'bg-indigo-100 text-indigo-800',
            'CSBE': 'bg-pink-100 text-pink-800'
        }
        return colors[stream] || 'bg-gray-100 text-gray-800'
    }

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6 mt-4">
                <div className="flex items-center justify-center h-64">
                    <div className="text-gray-500">Loading feeling confused data...</div>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6 mt-4">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-semibold text-gray-800">Students Feeling Confused</h2>
                    <div className="flex gap-4 text-sm text-gray-600 mt-1">
                        <span>Total: {confusedData?.totalCount || 0}</span>
                        <span>Unseen: {confusedData?.unseenCount || 0}</span>
                        <span>Uncontacted: {confusedData?.uncontactedCount || 0}</span>
                    </div>
                </div>
            </div>

            {confusedData?.feelingConfusedData?.length > 0 ? (
                <div className="space-y-4">
                    {confusedData.feelingConfusedData.map((item) => (
                        <div key={item._id} className={`border rounded-lg p-4 ${!item.seen ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="font-medium text-gray-900">
                                            {item.student?.name || 'Unknown Student'}
                                        </h3>
                                        {item.streamName && (
                                            <span className={`text-xs px-2 py-1 rounded-full ${getStreamBadgeColor(item.streamName)}`}>
                                                {item.streamName}
                                            </span>
                                        )}
                                        {!item.seen && (
                                            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                                                New
                                            </span>
                                        )}
                                        {item.contacted && (
                                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                                Contacted
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-sm text-gray-600 mb-2">
                                        <span>Email: {item.student?.email || 'N/A'}</span>
                                        <span className="mx-2">•</span>
                                        <span>Phone: {item.student?.phone || 'N/A'}</span>
                                    </div>
                                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-2">
                                        <p className="text-gray-800 text-sm italic">"{item.message}"</p>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        {new Date(item.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                                <div className="flex gap-2 ml-4">
                                    {!item.seen && (
                                        <button
                                            onClick={() => handleMarkAsSeen(item._id)}
                                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                                        >
                                            Mark as Seen
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleToggleContacted(item._id)}
                                        className={`px-3 py-1 rounded text-sm transition-colors ${
                                            item.contacted 
                                                ? 'bg-gray-600 text-white hover:bg-gray-700' 
                                                : 'bg-green-600 text-white hover:bg-green-700'
                                        }`}
                                    >
                                        {item.contacted ? 'Mark as Not Contacted' : 'Mark as Contacted'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Pagination */}
                    {confusedData.totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-6">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Previous
                            </button>
                            
                            <div className="flex gap-1">
                                {Array.from({ length: confusedData.totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => handlePageChange(page)}
                                        className={`px-3 py-2 border rounded-md text-sm ${
                                            currentPage === page
                                                ? 'bg-blue-600 text-white border-blue-600'
                                                : 'border-gray-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>
                            
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === confusedData.totalPages}
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-8">
                    <div className="text-gray-500 mb-2">No confused students found</div>
                    <div className="text-sm text-gray-400">No students have reported feeling confused yet.</div>
                </div>
            )}
        </div>
    )
}