import { useDispatch } from "react-redux"
import { useRouter } from "next/navigation"
import { loggedOut } from "../../features/login/LoginSlice"
import FirstDashboard from "./FirstDashboard"
import StudentProfile from "./StudentProfile"
import { useState, useEffect } from "react"
import { signOut } from "next-auth/react"
import { useSelector } from "react-redux"

export default function StudentDashboard() {
    const dispatch = useDispatch()
    const student = useSelector(state => state.login.studentDetails)
    const router = useRouter()
    const [selectedBadge, setSelectedBadge] = useState('main')
    const [showFirstDashboard, setShowFirstDashboard] = useState(true)

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('nextauth.message')
        signOut({ callbackUrl: '/login' })
        dispatch(loggedOut())
        router.push('/login')
    }

    useEffect(() => {
        setSelectedBadge('main')
        setShowFirstDashboard(true)
    }, [])

    const handleProfileClick = () => {
        setSelectedBadge('profile')
        setShowFirstDashboard(false)
    }

    return (
        <section className="min-h-screen bg-gradient-to-br from-gray-50/80 via-blue-50/20 to-indigo-50/10 pt-24 sm:pt-28 md:pt-32 lg:pt-36 pb-6 sm:pb-8 overflow-y-auto">
            <div className="px-2 sm:px-4 lg:px-8"> {/* Removed max-w-4xl mx-auto */}
                <div className="bg-white/90 backdrop-blur-xl p-6 sm:p-8 rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500 hover:bg-white/95">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <h1 className="text-2xl lg:text-3xl font-extrabold text-gray-800 tracking-tight flex items-center gap-3">
                            <span className="p-2.5 bg-gradient-to-br from-[#1d77bc]/10 to-[#2d8bd4]/10 rounded-xl">
                                <svg className="w-7 h-7 text-[#1d77bc]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </span>
                            Student Dashboard
                        </h1>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
                            <button
                                onClick={() => {
                                    setSelectedBadge('main')
                                    setShowFirstDashboard(true)
                                }}
                                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 text-sm sm:text-base rounded-full transition-colors duration-200 ${selectedBadge === 'main' ? 'bg-red-500 text-white shadow-lg' : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800'}`}
                                title="Main"
                            >
                                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                                <span className="hidden sm:inline">Main</span>
                            </button>
                            <button
                                onClick={handleProfileClick}
                                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 text-sm sm:text-base rounded-full transition-colors duration-200 ${selectedBadge === 'profile' ? 'bg-red-500 text-white shadow-lg' : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800'} `}
                                title="Profile"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span className="hidden sm:inline">Profile</span>
                            </button>
                            <button
                                onClick={() => {
                                    setSelectedBadge('logout')
                                    handleLogout()
                                }}
                                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 text-sm sm:text-base rounded-full transition-colors duration-200 ${selectedBadge === 'logout' ? 'bg-red-500 text-white shadow-lg' : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800'} `}
                                title="Logout"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    </div>
                    <div className="mt-3 md:mt-4">
                        {showFirstDashboard && <FirstDashboard />}
                        {selectedBadge === 'profile' && <StudentProfile />}
                    </div>
                </div>
            </div>
        </section>
    )
}