import { useDispatch } from "react-redux"
import { useRouter } from "next/navigation"
import { loggedOut } from "../../features/login/LoginSlice"
import FirstDashboard  from "./FirstDashboard"
import StudentProfile from "./StudentProfile"
import { useState, useEffect } from "react"
import { signOut } from "next-auth/react"

export default function StudentDashboard() {
    const dispatch = useDispatch()
    const router = useRouter()
    const [selectedBadge, setSelectedBadge] = useState('main')
    const [showFirstDashboard, setShowFirstDashboard] = useState(true)

    const handleLogout = () => {
        localStorage.removeItem('token')
        // signOut is a function from next-auth/react that deletes the session from the server of google and the client side of our website
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
        <section className="h-screen bg-white mt-24 overflow-y-auto">
            <div className="w-full px-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                    <h1 className="text-2xl md:text-3xl font-extrabold text-black tracking-tight">Student Dashboard</h1>
                    <div className="flex flex-wrap items-center gap-2 md:gap-4 w-full md:w-auto">
                        <button
                            onClick={() => {
                                setSelectedBadge('main')
                                setShowFirstDashboard(true)
                            }}
                            className={`flex items-center gap-2 text-sm md:text-base ${selectedBadge === 'main' ? 'bg-red-500 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800'} px-3 md:px-4 py-2 rounded-full`}
                            title="Main"
                        >
                            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            <span className="hidden md:inline">Main</span>
                        </button>
                        <button
                            onClick={() => {
                                setSelectedBadge('courses')
                                setShowFirstDashboard(false)
                            }}
                            className={`flex items-center gap-2 text-sm md:text-base ${selectedBadge === 'courses' ? 'bg-red-500 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800'} px-3 md:px-4 py-2 rounded-full`}
                            title="Courses"
                        >
                            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            <span className="hidden md:inline">Courses</span>
                        </button>
                        <button
                            onClick={() => {
                                setSelectedBadge('notifications')
                                setShowFirstDashboard(false)
                            }}
                            className={`flex items-center gap-2 text-sm md:text-base ${selectedBadge === 'notifications' ? 'bg-red-500 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800'} px-3 md:px-4 py-2 rounded-full`}
                            title="Notifications"
                        >
                            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            <span className="hidden md:inline">Notifications</span>
                            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">3</span>
                        </button>
                        <button
                            onClick={() => {
                                setSelectedBadge('settings')
                                setShowFirstDashboard(false)
                            }}
                            className={`flex items-center gap-2 text-sm md:text-base ${selectedBadge === 'settings' ? 'bg-red-500 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800'} px-3 md:px-4 py-2 rounded-full`}
                            title="Settings"
                        >
                            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="hidden md:inline">Settings</span>
                        </button>
                        <button
                            onClick={() => handleProfileClick() }
                            className={`flex items-center gap-2 text-sm md:text-base ${selectedBadge === 'profile' ? 'bg-red-500 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800'} px-3 md:px-4 py-2 rounded-full`}
                            title="Profile"
                        >
                            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span className="hidden md:inline">Profile</span>
                        </button>
                        <button
                            onClick={() => {
                                setSelectedBadge('logout')
                                handleLogout()
                            }}
                            className={`flex items-center gap-2 text-sm md:text-base ${selectedBadge === 'logout' ? 'bg-red-500 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800'} px-3 md:px-4 py-2 rounded-full`}
                            title="Logout"
                        >
                            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span className="hidden md:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </div>
            {showFirstDashboard && <FirstDashboard/>}
            {selectedBadge === 'profile' && <StudentProfile/>}
        </section>
    )
}