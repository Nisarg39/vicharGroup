"use client"
import { FaUniversity, FaEnvelope, FaPhone, FaMapMarkerAlt, FaGlobe, FaUserTie, FaIdCard, FaBuilding, FaCamera, FaBook } from 'react-icons/fa'
import { updateCollegeDetails } from '../../../../server_actions/actions/examController/collegeActions'
import toast from 'react-hot-toast'

export default function CollegeProfile({ collegeData }) {
    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            {!collegeData ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#1d77bc] mx-auto mb-6"></div>
                    <p className="text-gray-600 text-lg">Loading college details...</p>
                </div>
            ) : (
                <>
                    {/* Header with Logo */}
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8 pb-6 border-b border-gray-200">
                        <div className="relative">
                            <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-[#1d77bc] to-[#2c9652] p-1 shadow-lg">
                                <div className="w-full h-full rounded-full overflow-hidden bg-white">
                                    {collegeData.collegeLogo ? (
                                        <img 
                                            src={collegeData.collegeLogo} 
                                            alt={collegeData.collegeName || 'College Logo'} 
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.style.display = 'none'
                                                e.target.nextSibling.style.display = 'flex'
                                            }}
                                        />
                                    ) : null}
                                    <div className={`w-full h-full bg-gradient-to-br from-[#1d77bc] to-[#2c9652] flex items-center justify-center ${collegeData.collegeLogo ? 'hidden' : 'flex'}`}>
                                        <FaUniversity className="text-white text-4xl" />
                                    </div>
                                </div>
                            </div>
                            <div className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-md border-2 border-gray-100">
                                <FaCamera className="text-gray-400 text-sm" />
                            </div>
                        </div>
                        
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                {collegeData.collegeName || 'College Name'}
                            </h1>
                            {collegeData.collegeCode && (
                                <div className="inline-flex items-center gap-2 bg-[#1d77bc] text-white px-4 py-2 rounded-full mb-3">
                                    <FaIdCard className="text-sm" />
                                    <span className="font-medium">Code: {collegeData.collegeCode}</span>
                                </div>
                            )}
                            {collegeData.collegeEmail && (
                                <div className="flex items-center justify-center md:justify-start gap-2 text-gray-600 mb-2">
                                    <FaEnvelope className="text-sm" />
                                    <span>{collegeData.collegeEmail}</span>
                                </div>
                            )}
                            {collegeData.collegeLocation && (
                                <div className="flex items-center justify-center md:justify-start gap-2 text-gray-500 text-sm">
                                    <FaMapMarkerAlt className="text-xs" />
                                    <span>{collegeData.collegeLocation}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Information Cards */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* College Information Card */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-[#1d77bc] p-2 rounded-lg">
                                    <FaBuilding className="text-white text-lg" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900">College Information</h3>
                            </div>
                            
                            <div className="space-y-4">
                                {collegeData.collegeName && (
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                        <span className="text-gray-600 font-medium min-w-[120px]">College Name:</span>
                                        <span className="text-gray-900 font-medium">{collegeData.collegeName}</span>
                                    </div>
                                )}
                                
                                {collegeData.collegeCode && (
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                        <span className="text-gray-600 font-medium min-w-[120px]">College Code:</span>
                                        <span className="text-gray-900">{collegeData.collegeCode}</span>
                                    </div>
                                )}
                                
                                {collegeData.collegeLocation && (
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                        <span className="text-gray-600 font-medium min-w-[120px]">Location:</span>
                                        <span className="text-gray-900">{collegeData.collegeLocation}</span>
                                    </div>
                                )}

                                {collegeData.Address && (
                                    <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                                        <span className="text-gray-600 font-medium min-w-[120px]">Address:</span>
                                        <span className="text-gray-900">{collegeData.Address}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Contact Information Card */}
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-[#2c9652] p-2 rounded-lg">
                                    <FaPhone className="text-white text-lg" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900">Contact Information</h3>
                            </div>
                            
                            <div className="space-y-4">
                                {collegeData.collegeEmail && (
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                        <span className="text-gray-600 font-medium min-w-[120px]">Email:</span>
                                        <span className="text-gray-900 break-all">{collegeData.collegeEmail}</span>
                                    </div>
                                )}

                                {collegeData.collegeContact && (
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                        <span className="text-gray-600 font-medium min-w-[120px]">Phone:</span>
                                        <span className="text-gray-900">{collegeData.collegeContact}</span>
                                    </div>
                                )}

                                {collegeData.collegeWebsite && (
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                        <span className="text-gray-600 font-medium min-w-[120px]">Website:</span>
                                        <a 
                                            href={collegeData.collegeWebsite} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline break-all"
                                        >
                                            {collegeData.collegeWebsite}
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Combined Allocations Card */}
                        <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-6 border border-purple-100 lg:col-span-2">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-[#7c3aed] p-2 rounded-lg">
                                    <FaBook className="text-white text-lg" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900">Allocated Streams, Classes & Subjects</h3>
                            </div>
                            {/* Streams */}
                            <div className="mb-4">
                                <span className="block text-sm font-semibold text-gray-700 mb-1">Streams:</span>
                                {collegeData.allocatedStreams && Array.isArray(collegeData.allocatedStreams) && collegeData.allocatedStreams.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {collegeData.allocatedStreams.map((stream, idx) => (
                                            <span key={idx} className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                                                {stream}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 italic">No streams allocated yet.</p>
                                )}
                            </div>
                            {/* Classes */}
                            <div className="mb-4">
                                <span className="block text-sm font-semibold text-gray-700 mb-1">Classes:</span>
                                {collegeData.allocatedClasses && Array.isArray(collegeData.allocatedClasses) && collegeData.allocatedClasses.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {collegeData.allocatedClasses.map((cls, idx) => (
                                            <span key={idx} className="bg-yellow-100 text-yellow-800 text-sm px-3 py-1 rounded-full">
                                                {cls}th
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 italic">No classes allocated yet.</p>
                                )}
                            </div>
                            {/* Subjects */}
                            <div>
                                <span className="block text-sm font-semibold text-gray-700 mb-1">Subjects:</span>
                                {collegeData.allocatedSubjects && Array.isArray(collegeData.allocatedSubjects) && collegeData.allocatedSubjects.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                        {collegeData.allocatedSubjects.map((subject, index) => (
                                            <div key={index} className="bg-white rounded-lg p-4 border border-purple-200 shadow-sm hover:shadow-md transition-shadow">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 bg-[#7c3aed] rounded-full"></div>
                                                    <span className="text-gray-900 font-medium text-sm">
                                                        {typeof subject === 'string' ? subject : subject.name || subject.subjectName || 'Unknown Subject'}
                                                    </span>
                                                </div>
                                                {typeof subject === 'object' && subject.code && (
                                                    <div className="mt-1 text-xs text-gray-500">
                                                        Code: {subject.code}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 italic">No subjects allocated yet.</p>
                                )}
                            </div>
                        </div>

                        {/* Principal Information Card */}
                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-100 lg:col-span-2">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-[#8b5a2b] p-2 rounded-lg">
                                    <FaUserTie className="text-white text-lg" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900">Principal Information</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {collegeData.principalName && (
                                    <div className="bg-white rounded-lg p-4 border border-amber-200">
                                        <span className="text-gray-600 font-medium block mb-1">Principal Name:</span>
                                        <span className="text-gray-900 font-medium">{collegeData.principalName}</span>
                                    </div>
                                )}
                                
                                {collegeData.principalContact && (
                                    <div className="bg-white rounded-lg p-4 border border-amber-200">
                                        <span className="text-gray-600 font-medium block mb-1">Principal Contact:</span>
                                        <span className="text-gray-900">{collegeData.principalContact}</span>
                                    </div>
                                )}
                            </div>
                            
                            {(!collegeData.principalName && !collegeData.principalContact) && (
                                <div className="text-center py-8">
                                    <div className="bg-white rounded-lg p-6 border border-amber-200">
                                        <p className="text-gray-500 italic">No principal information available.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}