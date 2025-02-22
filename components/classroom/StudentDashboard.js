import { useDispatch } from "react-redux"
import { useRouter } from "next/navigation"
import { loggedOut } from "../../features/login/LoginSlice"
import FirstDashboard  from "./FirstDashboard"
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