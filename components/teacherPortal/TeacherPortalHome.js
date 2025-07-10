"use client"
import { useEffect, useState } from "react"
import { FaSignOutAlt } from 'react-icons/fa'
import TeacherPortalSignIn from "./TeacherPortalSignIn"
import TeacherPortalDashboard from "./TeacherPortalDashboard"

export default function TeacherPortalHome() {

    const [isTeacher, setIsTeacher] = useState(false)

    useEffect(() => {
        const isTeacher = localStorage.getItem("isTeacher")
        if (isTeacher) {
            setIsTeacher(true)
        }
    }, [])

    const handleLoginSuccess = () => {
        setIsTeacher(true)
    }

    const handleLogout = () => {
        localStorage.removeItem("isTeacher")
        setIsTeacher(false)
    }

    return (
        <div className="mt-20">
            {!isTeacher ? (
                <TeacherPortalSignIn onLoginSuccess={handleLoginSuccess} />
            ) : (
                <div>
                    <div className="flex justify-end mb-4 px-4">
                        <button
                            onClick={handleLogout}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-opacity-50 transition duration-300 ease-in-out font-bold shadow-md hover:shadow-lg transform hover:scale-105 flex items-center gap-2"
                        >
                            <FaSignOutAlt />
                            Logout
                        </button>
                    </div>
                    <TeacherPortalDashboard />
                </div>
            )}
        </div>
    )
}