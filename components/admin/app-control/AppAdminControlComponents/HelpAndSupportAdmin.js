"use client"
import { showStudentAppSupport, messageSeenHelpAndSupport, contactedToggleHelpAndSupport } from "../../../../server_actions/actions/adminActions"
import { useState, useEffect } from 'react'

export default function HelpAndSupportAdmin() {
    const [supportData, setSupportData] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [loading, setLoading] = useState(true)

    const fetchSupportData = async (page = 1) => {
        setLoading(true)
        try {
            const result = await showStudentAppSupport(page)
            if (result.success) {
                setSupportData(result)
                setCurrentPage(page)
            }
        } catch (error) {
            console.error('Error fetching support data:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSupportData(currentPage)
    }, [])

    const handleMarkAsSeen = async (id) => {
        try {
            const result = await messageSeenHelpAndSupport(id)
            if (result.success) {
                fetchSupportData(currentPage)
            }
        } catch (error) {
            console.error('Error marking as seen:', error)
        }
    }

    const handleToggleContacted = async (id) => {
        try {
            const result = await contactedToggleHelpAndSupport(id)
            if (result.success) {
                fetchSupportData(currentPage)
            }
        } catch (error) {
            console.error('Error toggling contacted status:', error)
        }
    }

    const handlePageChange = (page) => {
        fetchSupportData(page)
    }

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6 mt-4">
                <div className="flex items-center justify-center h-64">
                    <div className="text-gray-500">Loading support requests...</div>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6 mt-4">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-semibold text-gray-800">Help And Support Requests</h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Total: {supportData?.totalCount || 0} | Unseen: {supportData?.unseenCount || 0}
                    </p>
                </div>
            </div>

            {supportData?.supportRequests?.length > 0 ? (
                <div className="space-y-4">
                    {supportData.supportRequests.map((request) => (
                        <div key={request._id} className={`border rounded-lg p-4 ${!request.seen ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="font-medium text-gray-900">
                                            {request.student?.name || 'Unknown Student'}
                                        </h3>
                                        {!request.seen && (
                                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                                New
                                            </span>
                                        )}
                                        {request.contacted && (
                                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                                Contacted
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-sm text-gray-600 mb-2">
                                        <span>Email: {request.student?.email || 'N/A'}</span>
                                        <span className="mx-2">•</span>
                                        <span>Phone: {request.student?.phone || 'N/A'}</span>
                                    </div>
                                    <p className="text-gray-800 mb-2">{request.message}</p>
                                    <p className="text-xs text-gray-500">
                                        {new Date(request.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                                <div className="flex gap-2 ml-4">
                                    {!request.seen && (
                                        <button
                                            onClick={() => handleMarkAsSeen(request._id)}
                                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                                        >
                                            Mark as Seen
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleToggleContacted(request._id)}
                                        className={`px-3 py-1 rounded text-sm transition-colors ${
                                            request.contacted 
                                                ? 'bg-gray-600 text-white hover:bg-gray-700' 
                                                : 'bg-green-600 text-white hover:bg-green-700'
                                        }`}
                                    >
                                        {request.contacted ? 'Mark as Not Contacted' : 'Mark as Contacted'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Pagination */}
                    {supportData.totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-6">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Previous
                            </button>
                            
                            <div className="flex gap-1">
                                {Array.from({ length: supportData.totalPages }, (_, i) => i + 1).map((page) => (
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
                                disabled={currentPage === supportData.totalPages}
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-8">
                    <div className="text-gray-500 mb-2">No support requests found</div>
                    <div className="text-sm text-gray-400">Students haven't submitted any help requests yet.</div>
                </div>
            )}
        </div>
    )
}