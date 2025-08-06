"use client"
import { useState, useEffect } from 'react'
import { BuildingOfficeIcon, UserGroupIcon, AcademicCapIcon, ArrowRightIcon, BookOpenIcon, ChartBarIcon, CheckCircleIcon, SparklesIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline'
import { ClockIcon, CalendarIcon, TagIcon, ClipboardIcon } from '@heroicons/react/24/outline'
import { searchCollege, sendStudentRequest, collegeRequestStatus } from '../../../server_actions/actions/studentActions'
import toast from 'react-hot-toast'
// Add import for shadcn Checkbox if available, else fallback to input
import { Checkbox } from "@/components/ui/checkbox" // Uncomment if shadcn Checkbox exists
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export default function JoinCollege() {
    const [collegeCode, setCollegeCode] = useState('')
    const [loading, setLoading] = useState(false)
    const [response, setResponse] = useState(null)
    const [foundCollege, setFoundCollege] = useState(null)
    const [showSearch, setShowSearch] = useState(true)
    const [exams, setExams] = useState([])
    const [requestMessage, setRequestMessage] = useState('')
    const [requestSent, setRequestSent] = useState(false)
    const [requestStatuses, setRequestStatuses] = useState([])
    const [loadingStatus, setLoadingStatus] = useState(false)
    const [showWarning, setShowWarning] = useState(false)
    const [allocatedStreams, setAllocatedStreams] = useState([]) // <-- NEW: selected streams
    const [allocatedClasses, setAllocatedClasses] = useState([]) // <-- selected class (as array for backend)

    // Remove or comment out this debug log after testing
    // console.log(foundCollege.allocatedClasses[0]);

    useEffect(() => {
        const checkRequestStatus = async () => {
            setLoadingStatus(true)
            try {
                const token = localStorage.getItem('token')
                
                const result = await collegeRequestStatus({
                    token: token
                })

                if (result.success) {
                    setRequestStatuses(result.collegeRequest)
                }
            } catch (error) {
                console.error('Error checking request status:', error)
            } finally {
                setLoadingStatus(false) 
            }
        }

        checkRequestStatus()
    }, [])

    const handleJoinCollege = async () => {
        if (!collegeCode.trim()) {
            toast.error('Please enter college code')
            return
        }
        
        setLoading(true)
        setResponse(null)
        setFoundCollege(null)
        
        try {
            const result = await searchCollege({ collegeCode: collegeCode.trim() })
            setResponse(result)          
            if (result.success) {
                setFoundCollege(result.college)
                setExams(result.exams)
                setShowSearch(false)
            }
        } catch (error) {
            console.error('Error joining college:', error)
            setResponse({
                message: 'An error occurred while searching for the college',
                success: false
            })
        } finally {
            setLoading(false)
        }
    }

    const handleSendRequest = async () => {
        if (!requestMessage.trim()) {
            toast.error('Please enter a message to introduce yourself')
            return
        }
        if (!allocatedStreams.length) {
            toast.error('Please select at least one stream')
            return
        }
        if (!allocatedClasses.length) {
            toast.error('Please select a class')
            return
        }
        
        // Check if this would be the 5th request
        if (requestStatuses.length === 4) {
            setShowWarning(true)
            return
        }
        
        // If already at 5 requests, disable
        if (requestStatuses.length >= 5) {
            toast.error('Maximum college join requests (5) reached')
            return
        }
        
        setLoading(true)
        try {
            const token = localStorage.getItem('token')
            const details = {
                collegeId: foundCollege._id,
                message: requestMessage.trim(),
                token: token,
                allocatedStreams: allocatedStreams, // <-- NEW: send selected streams
                allocatedClasses: allocatedClasses, // <-- send selected class as array
            }
            const result = await sendStudentRequest(details)
            
            if (result.success) {
                toast.success(result.message || "Request sent successfully!")
                setResponse({
                    message: result.message || "Request sent successfully!",
                    success: true
                })
                setRequestMessage('')
                setRequestSent(true)
                setAllocatedStreams([]) // Reset after send
                setAllocatedClasses([]) // Reset after send
            } else {
                toast.error(result.message || "Failed to send request")
            }
        } catch (error) {
            console.error('Error sending request:', error)
            toast.error("An error occurred while sending the request")
            setResponse({
                message: 'Failed to send request',
                success: false
            })
        } finally {
            setLoading(false)
        }
    }

    const handleFinalRequest = () => {
        setShowWarning(false)
        handleSendRequest()
    }

    const resetComponent = async () => {
        // First check for updated request statuses
        setLoadingStatus(true)
        try {
            const token = localStorage.getItem('token')
            const result = await collegeRequestStatus({
                token: token
            })
            
            if (result.success) {
                setRequestStatuses(result.collegeRequest)
            }
        } catch (error) {
            console.error('Error updating request status:', error)
        } finally {
            setLoadingStatus(false)
        }

        // Then reset other states
        setCollegeCode('')
        setLoading(false)
        setResponse(null)
        setFoundCollege(null)
        setShowSearch(true)
        setExams([])
        setRequestMessage('')
        setRequestSent(false)
        setAllocatedStreams([]) // Reset streams
        setAllocatedClasses([]) // Reset classes
    }

    return (
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 border border-gray-100">
            {/* Header Section - More Compact */}
            <div className="text-center mb-6 sm:mb-8">
                <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#1d77bc]/10 to-[#2d8bd4]/10 rounded-xl mb-3 sm:mb-4 shadow-md">
                    <BuildingOfficeIcon className="w-5 h-5 sm:w-6 sm:h-6 text-[#1d77bc]" />
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#1d77bc] to-[#2d8bd4] mb-2">
                    Join Your College
                </h2>
                <p className="text-gray-600 text-sm sm:text-base max-w-xl mx-auto leading-relaxed px-2">
                    Connect with your institution and unlock exclusive features
                </p>
                <div className="mt-3 sm:mt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                        <span>Secure Connection</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                        <span>Instant Access</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse"></div>
                        <span>24/7 Support</span>
                    </div>
                </div>
            </div>

            {/* Request Count Indicator */}
            <div className="max-w-3xl mx-auto mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-gradient-to-r from-[#1d77bc]/5 to-[#2d8bd4]/5 rounded-xl p-3 sm:p-4 gap-3 sm:gap-0">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-[#1d77bc]/10 flex items-center justify-center flex-shrink-0">
                            <BuildingOfficeIcon className="h-3 w-3 sm:h-4 sm:w-4 text-[#1d77bc]" />
                        </div>
                        <span className="text-xs sm:text-sm font-medium text-gray-700">
                            College Join Requests
                        </span>
                    </div>
                    <div className="flex items-center gap-2 justify-center sm:justify-end">
                        <div className="flex items-center">
                            {[...Array(5)].map((_, index) => (
                                <div
                                    key={index}
                                    className={`h-1.5 sm:h-2 w-6 sm:w-8 rounded-full mx-0.5 ${
                                        index < requestStatuses.length
                                            ? 'bg-[#1d77bc]'
                                            : 'bg-gray-200'
                                    }`}
                                />
                            ))}
                        </div>
                        <span className="text-xs sm:text-sm font-medium text-gray-600 ml-2 sm:ml-3">
                            {requestStatuses.length}/5
                        </span>
                    </div>
                </div>
            </div>

            {/* College Request Status Section */}
            {loadingStatus ? (
                <div className="flex justify-center my-6 sm:my-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1d77bc]"></div>
                </div>
            ) : requestStatuses.length > 0 && (
                <div className="max-w-3xl mx-auto mb-8 sm:mb-12">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-4 sm:p-6 border border-blue-200">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                            <BuildingOfficeIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[#1d77bc]" />
                            Your College Join Requests
                        </h3>
                        <div className="space-y-3 sm:space-y-4">
                            {requestStatuses.map((request, index) => (
                                <div key={index} 
                                    className="bg-white rounded-xl p-3 sm:p-4 border border-blue-100 hover:shadow-md transition-all">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                                            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-[#1d77bc]/10 to-[#2d8bd4]/10 flex items-center justify-center flex-shrink-0">
                                                {request.college?.collegeLogo ? (
                                                    <img 
                                                        src={request.college.collegeLogo} 
                                                        alt={request.college.collegeName}
                                                        className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <BuildingOfficeIcon className="h-5 w-5 sm:h-6 sm:w-6 text-[#1d77bc]" />
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h4 className="font-semibold text-gray-800 text-sm sm:text-base truncate">
                                                    {request.college?.collegeName}
                                                </h4>
                                                <p className="text-xs sm:text-sm text-gray-500">
                                                    Code: {request.college?.collegeCode}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-left sm:text-right flex-shrink-0">
                                            <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                                                request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                request.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                                <div className={`w-1.5 h-1.5 rounded-full mr-1.5 sm:mr-2 ${
                                                    request.status === 'pending' ? 'bg-yellow-500' :
                                                    request.status === 'approved' ? 'bg-green-500' :
                                                    'bg-red-500'
                                                } animate-pulse`}></div>
                                                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                            </span>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Sent: {new Date(request.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    {request.message && (
                                        <div className="mt-3 text-xs sm:text-sm text-gray-600 bg-gray-50 rounded-lg p-2 sm:p-3">
                                            <p className="font-medium text-gray-700 mb-1">Your Message:</p>
                                            <p className="break-words">{request.message}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Success Message Section */}
            {requestSent ? (
                <div className="max-w-lg mx-auto text-center">
                    <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl p-8 border border-green-200 shadow-lg">
                        {/* Success Icon */}
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full mb-6 shadow-lg">
                            <CheckCircleIcon className="w-8 h-8 text-white" />
                        </div>
                        
                        {/* College Info */}
                        <div className="flex items-center justify-center gap-4 mb-6">
                            <div className="relative h-16 w-16 flex-shrink-0">
                                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-500/20 to-green-600/20 p-0.5">
                                    <div className="h-full w-full rounded-full bg-white overflow-hidden shadow-md">
                                        {foundCollege?.collegeLogo ? (
                                            <img
                                                src={foundCollege.collegeLogo}
                                                alt={foundCollege.collegeName}
                                                className="h-full w-full object-cover"
                                                onError={(e) => {e.target.src = '/default-college-logo.png'}}
                                            />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-green-100 to-green-200">
                                                <BuildingOfficeIcon className="h-6 w-6 text-green-600" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="text-left">
                                <h3 className="text-lg font-bold text-gray-800">{foundCollege?.collegeName}</h3>
                                <p className="text-sm text-gray-600">Code: {foundCollege?.collegeCode}</p>
                            </div>
                        </div>

                        {/* Instructions */}
                        <div className="space-y-4 mb-8">
                            <h3 className="text-xl font-bold text-gray-800">Request Sent Successfully!</h3>
                            <p className="text-gray-600 leading-relaxed">
                                You will be able to join the portal once your college <strong>{foundCollege?.collegeName}</strong> accepts your joining request.
                            </p>
                            <div className="inline-flex items-center gap-2 text-sm text-green-600 bg-green-100 px-3 py-1 rounded-full">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                <span>We'll notify you when approved</span>
                            </div>
                        </div>

                        {/* Cool Button */}
                        <button
                            onClick={resetComponent}
                            className="bg-gradient-to-r from-[#1d77bc] to-[#2d8bd4] text-white px-8 py-3 rounded-xl text-sm font-medium transition-all hover:shadow-lg hover:translate-y-[-1px] focus:ring-2 focus:ring-blue-500/50"
                        >
                            Cool
                        </button>
                    </div>
                </div>
            ) : showSearch ? (
                <div className="max-w-md mx-auto">
                    <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg p-4 border border-gray-100">
                        <div className="mb-4">
                            <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-1.5">
                                <div className="p-1 bg-[#1d77bc]/10 rounded-md">
                                    <SparklesIcon className="w-3 h-3 text-[#1d77bc]" />
                                </div>
                                College Code
                            </label>
                            <input
                                type="text"
                                value={collegeCode}
                                onChange={(e) => setCollegeCode(e.target.value)}
                                placeholder="Enter your college code"
                                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#1d77bc]/20 focus:border-[#1d77bc]"
                                onKeyPress={(e) => e.key === 'Enter' && handleJoinCollege()}
                            />
                        </div>
                        {response && !response.success && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg">
                                <p className="text-sm text-red-600 flex items-start gap-2">
                                    <ExclamationCircleIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                    <span className="break-words">{response.message || "College not found. Please check the code and try again."}</span>
                                </p>
                            </div>
                        )}
                        <button
                            onClick={handleJoinCollege}
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-[#1d77bc] to-[#2d8bd4] text-white py-3 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg transition-all"
                        >
                            {loading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                                <>
                                    <CheckCircleIcon className="w-4 h-4" />
                                    Join College
                                    <ArrowRightIcon className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="relative">
                    <button 
                        onClick={() => setShowSearch(true)}
                        className="absolute right-0 -top-8 sm:-top-12 flex items-center gap-1.5 text-xs sm:text-sm text-[#1d77bc] hover:text-[#2d8bd4] transition-colors"
                    >
                        <ArrowRightIcon className="w-3 h-3 sm:w-4 sm:h-4 rotate-180" />
                        Search Another College
                    </button>
                    {/* College Details - More Compact */}
                    {foundCollege && (
                        <div className="mt-4 sm:mt-6 overflow-hidden">
                            {/* Status Banner */}
                            <div className="relative overflow-hidden rounded-t-2xl bg-gradient-to-r from-[#1d77bc] to-[#2d8bd4] p-4 sm:p-6">
                                <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,rgba(255,255,255,0.6))]" />
                                <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                                        {/* iPhone Camera Lens Style Avatar */}
                                        <div className="relative h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0">
                                            {/* Outer ring with gradient */}
                                            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 to-white/10 p-0.5">
                                                <div className="h-full w-full rounded-full bg-gradient-to-br from-white/20 to-transparent p-0.5">
                                                    {/* Inner lens ring */}
                                                    <div className="h-full w-full rounded-full bg-gradient-to-br from-white/40 via-white/20 to-white/5 p-1">
                                                        {/* Lens body */}
                                                        <div className="h-full w-full rounded-full bg-gradient-to-br from-white/30 to-white/10 p-0.5 shadow-inner">
                                                            {/* Image container */}
                                                            <div className="h-full w-full rounded-full bg-white/95 backdrop-blur-sm overflow-hidden shadow-lg">
                                                                {foundCollege.collegeLogo ? (
                                                                    <img
                                                                        src={foundCollege.collegeLogo}
                                                                        alt={foundCollege.collegeName}
                                                                        className="h-full w-full object-cover"
                                                                        onError={(e) => {e.target.src = '/default-college-logo.png'}}
                                                                    />
                                                                ) : (
                                                                    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-[#1d77bc]/20 to-[#2d8bd4]/20">
                                                                        <BuildingOfficeIcon className="h-8 w-8 text-[#1d77bc]" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Lens reflection effect */}
                                            <div className="absolute top-2 left-2 h-3 w-3 rounded-full bg-white/60 blur-sm"></div>
                                            <div className="absolute top-1 left-1 h-2 w-2 rounded-full bg-white/80"></div>
                                            
                                            {/* Active status indicator */}
                                            <div className={`absolute -bottom-1 -right-1 h-6 w-6 rounded-full border-2 border-white shadow-lg ${
                                                foundCollege.isActive ? 'bg-green-500' : 'bg-red-500'
                                            }`}>
                                                <div className={`absolute inset-1 rounded-full ${
                                                    foundCollege.isActive ? 'bg-green-400' : 'bg-red-400'
                                                } animate-pulse`}></div>
                                            </div>
                                        </div>
                                        
                                        <div className="min-w-0 flex-1">
                                            <h3 className="text-lg sm:text-xl font-bold text-white mb-1 truncate">{foundCollege.collegeName}</h3>
                                            <p className="text-xs sm:text-sm text-blue-100 mb-1">Code: {foundCollege.collegeCode}</p>
                                            <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
                                                foundCollege.isActive 
                                                    ? 'bg-green-500/20 text-green-100' 
                                                    : 'bg-red-500/20 text-red-100'
                                            }`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${
                                                    foundCollege.isActive ? 'bg-green-300' : 'bg-red-300'
                                                } animate-pulse`}></div>
                                                {foundCollege.isActive ? 'Active' : 'Inactive'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="rounded-b-2xl border border-t-0 border-blue-100 bg-white p-4 sm:p-6">
                                <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                                    {/* Location Card */}
                                    <div className="group rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/50 p-3 sm:p-4 transition-all hover:shadow-md">
                                        <div className="mb-2 flex items-center gap-2">
                                            <div className="rounded-lg bg-[#1d77bc]/10 p-1.5 sm:p-2">
                                                <BuildingOfficeIcon className="h-3 w-3 sm:h-4 sm:w-4 text-[#1d77bc]" />
                                            </div>
                                            <h4 className="font-medium text-gray-700 text-sm sm:text-base">Location</h4>
                                        </div>
                                        <p className="text-xs sm:text-sm text-gray-600 break-words">{foundCollege.collegeLocation || 'Not specified'}</p>
                                    </div>

                                    {/* Contact Info Card */}
                                    <div className="group rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/50 p-3 sm:p-4 transition-all hover:shadow-md">
                                        <div className="mb-2 flex items-center gap-2">
                                            <div className="rounded-lg bg-[#1d77bc]/10 p-1.5 sm:p-2">
                                                <UserGroupIcon className="h-3 w-3 sm:h-4 sm:w-4 text-[#1d77bc]" />
                                            </div>
                                            <h4 className="font-medium text-gray-700 text-sm sm:text-base">Contact</h4>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs sm:text-sm text-gray-600 break-words">{foundCollege.collegeEmail}</p>
                                            {foundCollege.collegeWebsite && (
                                                <a 
                                                    href={foundCollege.collegeWebsite}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs sm:text-sm text-[#1d77bc] hover:underline break-words inline-block"
                                                >
                                                    Visit Website
                                                </a>
                                            )}
                                        </div>
                                    </div>

                                    {/* Exam Statistics Card */}
                                    <div className="col-span-full group rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/50 p-3 sm:p-4 transition-all hover:shadow-md">
                                        <div className="mb-3 sm:mb-4 flex items-center gap-2">
                                            <div className="rounded-lg bg-[#1d77bc]/10 p-1.5 sm:p-2">
                                                <AcademicCapIcon className="h-3 w-3 sm:h-4 sm:w-4 text-[#1d77bc]" />
                                            </div>
                                            <h4 className="font-medium text-gray-700 text-sm sm:text-base">Exam Overview</h4>
                                        </div>

                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                                            {/* Total Exams */}
                                            <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-100">
                                                <div className="text-xl sm:text-3xl font-bold text-[#1d77bc] mb-1">
                                                    {exams.length}
                                                </div>
                                                <div className="text-xs sm:text-sm text-gray-600">Total Exams</div>
                                            </div>

                                            {/* Active Exams */}
                                            <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-100">
                                                <div className="text-xl sm:text-3xl font-bold text-[#1d77bc] mb-1">
                                                    {exams.filter(exam => exam.examStatus === 'active').length}
                                                </div>
                                                <div className="text-xs sm:text-sm text-gray-600">Active Exams</div>
                                            </div>

                                            {/* Practice Exams */}
                                            <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-100">
                                                <div className="text-xl sm:text-3xl font-bold text-[#1d77bc] mb-1">
                                                    {exams.filter(exam => exam.examAvailability === 'practice').length}
                                                </div>
                                                <div className="text-xs sm:text-sm text-gray-600">Practice Exams</div>
                                            </div>

                                            {/* Upcoming Exams */}
                                            <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-100">
                                                <div className="text-xl sm:text-3xl font-bold text-[#1d77bc] mb-1">
                                                    {exams.filter(exam => new Date(exam.startTime) > new Date()).length}
                                                </div>
                                                <div className="text-xs sm:text-sm text-gray-600">Upcoming Exams</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* NEW: Class Selection */}
                                {foundCollege.allocatedClasses && foundCollege.allocatedClasses.length > 0 && (
                                    <div className="mt-4 sm:mt-6 mb-3 sm:mb-4">
                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                                            Select Class <span className="text-red-500">*</span>
                                        </label>
                                        <RadioGroup
                                            value={allocatedClasses[0] || ""}
                                            onValueChange={val => setAllocatedClasses(val ? [val] : [])}
                                            className="flex flex-wrap gap-2 sm:gap-3"
                                        >
                                            {foundCollege.allocatedClasses.map((className, idx) => (
                                                <div key={className} className="flex items-center gap-1.5 sm:gap-2 bg-gray-50 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-gray-200 cursor-pointer">
                                                    <RadioGroupItem value={className} id={`class-radio-${idx}`} />
                                                    <label htmlFor={`class-radio-${idx}`} className="text-xs sm:text-sm text-gray-700 cursor-pointer">{className}</label>
                                                </div>
                                            ))}
                                        </RadioGroup>
                                    </div>
                                )}
                                {/* NEW: Streams Selection */}
                                {foundCollege.allocatedStreams && foundCollege.allocatedStreams.length > 0 && (
                                    <div className="mt-4 sm:mt-6 mb-3 sm:mb-4">
                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                                            Select Streams <span className="text-red-500">*</span>
                                        </label>
                                        <div className="flex flex-wrap gap-2 sm:gap-3">
                                            {foundCollege.allocatedStreams.map((stream, idx) => (
                                                <label key={stream} className="flex items-center gap-1.5 sm:gap-2 bg-gray-50 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-gray-200 cursor-pointer">
                                                    <Checkbox
                                                        checked={allocatedStreams.includes(stream)}
                                                        onCheckedChange={checked => {
                                                            if (checked) {
                                                                setAllocatedStreams([...allocatedStreams, stream])
                                                            } else {
                                                                setAllocatedStreams(allocatedStreams.filter(s => s !== stream))
                                                            }
                                                        }}
                                                        id={`stream-checkbox-${idx}`}
                                                    />
                                                    <span className="text-xs sm:text-sm text-gray-700">{stream}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {/* Join Button */}
                                <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
                                    <div className="rounded-lg border border-gray-200 p-3 sm:p-4">
                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                                            Message <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            value={requestMessage}
                                            onChange={(e) => setRequestMessage(e.target.value)}
                                            placeholder="Write a brief message to introduce yourself... (required)"
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm min-h-[80px] sm:min-h-[100px] focus:ring-2 focus:ring-green-500/20 focus:border-green-500 resize-none"
                                            required
                                        />
                                    </div>
                                    
                                    <button 
                                        onClick={handleSendRequest}
                                        disabled={loading}
                                        className="w-full rounded-xl bg-gradient-to-r from-green-500 to-green-600 py-3 text-xs sm:text-sm font-medium text-white shadow-lg transition-all hover:shadow-xl hover:translate-y-[-1px] focus:ring-2 focus:ring-green-500/50 active:shadow-md hover:from-green-600 hover:to-green-700 disabled:opacity-60"
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            {loading ? (
                                                <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                                            ) : (
                                                <>
                                                    <CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                                                    <span>Send Join Request</span>
                                                </>
                                            )}
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Benefits Grid */}
            <div className="mt-8 sm:mt-12">
                <h3 className="text-xl sm:text-2xl font-bold text-center text-gray-800 mb-2">
                    Why Join Your College?
                </h3>
                <p className="text-center text-gray-600 text-sm sm:text-base mb-6 sm:mb-8 px-2">
                    Unlock exclusive features for your academic journey
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {[
                        {
                            icon: AcademicCapIcon,
                            title: "Institutional Exams",
                            description: "Access college-specific exam content",
                            color: "text-[#1d77bc]",
                            gradient: "from-[#1d77bc]/10 to-[#2d8bd4]/10"
                        },
                        {
                            icon: UserGroupIcon,
                            title: "Peer Competition",
                            description: "Compare performance with classmates",
                            color: "text-[#1d77bc]",
                            gradient: "from-[#1d77bc]/10 to-[#2d8bd4]/10"
                        },
                        {
                            icon: ChartBarIcon,
                            title: "Performance Analytics",
                            description: "Track progress with detailed insights",
                            color: "text-[#1d77bc]",
                            gradient: "from-[#1d77bc]/10 to-[#2d8bd4]/10"
                        }
                    ].map((benefit, index) => (
                        <div 
                            key={index} 
                            className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-4 sm:p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 group"
                        >
                            <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${benefit.gradient} rounded-xl flex items-center justify-center mb-3 sm:mb-4 shadow-md group-hover:scale-110 transition-all duration-300`}>
                                <benefit.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${benefit.color}`} />
                            </div>
                            <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-2">
                                {benefit.title}
                            </h3>
                            <p className="text-gray-600 text-xs sm:text-sm">
                                {benefit.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Features Section */}
            <div className="mt-6 sm:mt-8 bg-gradient-to-r from-[#1d77bc]/5 via-[#2d8bd4]/5 to-[#2d8bd4]/5 rounded-xl p-4 sm:p-6 backdrop-blur-sm border border-white/20">
                <div className="text-center">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">
                        Ready to Get Started?
                    </h3>
                    <div className="flex flex-wrap justify-center gap-3 sm:gap-4 text-xs text-gray-500">
                        {['Instant Access', 'Secure Platform', '24/7 Support'].map((feature, index) => (
                            <div key={index} className="flex items-center gap-1">
                                <CheckCircleIcon className="w-3 h-3 sm:w-4 sm:h-4 text-[#1d77bc]" />
                                <span>{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Warning Modal */}
            {showWarning && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 max-w-sm sm:max-w-md w-full shadow-2xl mx-4">
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full mb-4 sm:mb-6 shadow-lg">
                                <ExclamationCircleIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                            </div>
                            
                            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Final Request Warning</h3>
                            <p className="text-gray-600 leading-relaxed mb-6 sm:mb-8 text-sm sm:text-base px-2">
                                This will be your 5th and final college join request. After this, you won't be able to send any more requests. Are you sure you want to proceed?
                            </p>
                            
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={() => setShowWarning(false)}
                                    className="flex-1 bg-gray-100 text-gray-700 py-2.5 sm:py-3 px-4 rounded-xl text-xs sm:text-sm font-medium hover:bg-gray-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleFinalRequest}
                                    className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-2.5 sm:py-3 px-4 rounded-xl text-xs sm:text-sm font-medium hover:from-red-600 hover:to-red-700 transition-all"
                                >
                                    Send Final Request
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
