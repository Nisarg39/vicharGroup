import { FaUser, FaEnvelope, FaBook, FaCalendarAlt, FaIdCard, FaUserTie, FaCamera } from 'react-icons/fa'

export default function TeacherProfile({ teacherDetails }) {
    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            {Object.keys(teacherDetails).length === 0 ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#1d77bc] mx-auto mb-6"></div>
                    <p className="text-gray-600 text-lg">Loading teacher details...</p>
                </div>
            ) : (
                <>
                    {/* Header with Avatar */}
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8 pb-6 border-b border-gray-200">
                        <div className="relative">
                            <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-[#1d77bc] to-[#2c9652] p-1 shadow-lg">
                                <div className="w-full h-full rounded-full overflow-hidden bg-white">
                                    {teacherDetails.profileImageUrl ? (
                                        <img 
                                            src={teacherDetails.profileImageUrl} 
                                            alt={teacherDetails.name || 'Teacher'} 
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.style.display = 'none'
                                                e.target.nextSibling.style.display = 'flex'
                                            }}
                                        />
                                    ) : null}
                                    <div className={`w-full h-full bg-gradient-to-br from-[#1d77bc] to-[#2c9652] flex items-center justify-center ${teacherDetails.profileImageUrl ? 'hidden' : 'flex'}`}>
                                        <FaUserTie className="text-white text-4xl" />
                                    </div>
                                </div>
                            </div>
                            <div className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-md border-2 border-gray-100">
                                <FaCamera className="text-gray-400 text-sm" />
                            </div>
                        </div>
                        
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                {teacherDetails.name || 'Teacher Name'}
                            </h1>
                            {teacherDetails.subject && (
                                <div className="inline-flex items-center gap-2 bg-[#1d77bc] text-white px-4 py-2 rounded-full mb-3">
                                    <FaBook className="text-sm" />
                                    <span className="font-medium">{teacherDetails.subject}</span>
                                </div>
                            )}
                            {teacherDetails.email && (
                                <div className="flex items-center justify-center md:justify-start gap-2 text-gray-600 mb-2">
                                    <FaEnvelope className="text-sm" />
                                    <span>{teacherDetails.email}</span>
                                </div>
                            )}
                            {teacherDetails.createdAt && (
                                <div className="flex items-center justify-center md:justify-start gap-2 text-gray-500 text-sm">
                                    <FaCalendarAlt className="text-xs" />
                                    <span>
                                        Member since {new Date(teacherDetails.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long'
                                        })}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Information Cards */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Personal Information Card */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-[#1d77bc] p-2 rounded-lg">
                                    <FaUser className="text-white text-lg" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900">Personal Information</h3>
                            </div>
                            
                            <div className="space-y-4">
                                {teacherDetails.name && (
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                        <span className="text-gray-600 font-medium min-w-[100px]">Full Name:</span>
                                        <span className="text-gray-900 font-medium">{teacherDetails.name}</span>
                                    </div>
                                )}
                                
                                {teacherDetails.email && (
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                        <span className="text-gray-600 font-medium min-w-[100px]">Email:</span>
                                        <span className="text-gray-900 break-all">{teacherDetails.email}</span>
                                    </div>
                                )}
                                
                                {teacherDetails.phone && (
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                        <span className="text-gray-600 font-medium min-w-[100px]">Phone:</span>
                                        <span className="text-gray-900">{teacherDetails.phone}</span>
                                    </div>
                                )}

                                {teacherDetails.department && (
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                        <span className="text-gray-600 font-medium min-w-[100px]">Department:</span>
                                        <span className="text-gray-900">{teacherDetails.department}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Account Information Card */}
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-[#2c9652] p-2 rounded-lg">
                                    <FaIdCard className="text-white text-lg" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900">Account Information</h3>
                            </div>
                            
                            <div className="space-y-4">
                                {teacherDetails.createdAt && (
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                        <span className="text-gray-600 font-medium min-w-[100px]">Joined:</span>
                                        <span className="text-gray-900">
                                            {new Date(teacherDetails.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                )}

                                {teacherDetails.status && (
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                        <span className="text-gray-600 font-medium min-w-[100px]">Status:</span>
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                            teacherDetails.status === 'active' 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {teacherDetails.status}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Additional Information Card */}
                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-100 lg:col-span-2">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-[#8b5a2b] p-2 rounded-lg">
                                    <FaBook className="text-white text-lg" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900">Additional Information</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.entries(teacherDetails).map(([key, value]) => {
                                    // Skip already displayed fields and internal fields
                                    if (['_id', 'name', 'email', 'subject', 'createdAt', 'updatedAt', 'password', 'token', '__v', 'profileImageUrl', 'phone', 'department', 'status'].includes(key)) {
                                        return null
                                    }
                                    
                                    return (
                                        <div key={key} className="bg-white rounded-lg p-4 border border-amber-200">
                                            <span className="text-gray-600 font-medium capitalize block mb-1">
                                                {key.replace(/([A-Z])/g, ' $1').trim()}:
                                            </span>
                                            <span className="text-gray-900">
                                                {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                            
                            {Object.keys(teacherDetails).filter(key => 
                                !['_id', 'name', 'email', 'subject', 'createdAt', 'updatedAt', 'password', 'token', '__v', 'profileImageUrl', 'phone', 'department', 'status'].includes(key)
                            ).length === 0 && (
                                <div className="text-center py-8">
                                    <div className="bg-white rounded-lg p-6 border border-amber-200">
                                        <p className="text-gray-500 italic">No additional information available.</p>
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