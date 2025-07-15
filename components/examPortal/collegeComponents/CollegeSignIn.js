"use client"
import { useState } from 'react'
import { FaEnvelope, FaLock, FaUniversity, FaEye, FaEyeSlash } from 'react-icons/fa'
import { motion } from 'framer-motion'
import { collegeSignIn} from "../../../server_actions/actions/examController/collegeActions"
import Modal from "../../common/Modal"
import { toast } from 'react-hot-toast'

export default function CollegeSignIn({ setIsCollegeSignedIn }) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [modalMessage, setModalMessage] = useState('')
    const [isSuccess, setIsSuccess] = useState(false)

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword)
    }

    const handleSignIn = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        
        try {
            const details = {
                email,
                password
            }
            
            const result = await collegeSignIn(details)
            
            if (result.success) {
                toast.success(result.message + ' - Welcome!')
                await localStorage.setItem('isCollege', result.college.token)
                
                // Add a slight delay before navigation
                setTimeout(() => {
                    setEmail('')
                    setPassword('')
                    setShowPassword(false)
                    if (setIsCollegeSignedIn) {
                        setIsCollegeSignedIn(true)
                    }
                }, 1500) // 1.5 seconds delay
                
            } else {
                toast.error(result.message + ' - Please check your credentials')
            }
        } catch (error) {
            toast.error('An error occurred during login. Please try again.')
            console.error('College Login error:', error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen bg-transparent to-white flex items-center justify-center p-4"
        >
            <Modal 
                showModal={showModal}
                setShowModal={setShowModal}
                isSuccess={isSuccess}
                modalMessage={modalMessage}
            />
            <motion.div 
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md border-t-4 border-[#106fb8] transition-all duration-300 hover:shadow-3xl"
            >
                <motion.h2 
                    initial={{ y: -20 }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-2xl sm:text-3xl font-extrabold text-center text-gray-800 mb-8 leading-tight"
                >
                    <FaUniversity className="inline mr-2 text-[#106fb8]" />
                    College Portal Sign In
                </motion.h2>
                
                <form onSubmit={handleSignIn} className="space-y-6">
                    <div className="group relative">
                        <label htmlFor="email" className="block text-sm font-semibold text-gray-600 mb-2 group-hover:text-[#106fb8] transition-colors duration-200">
                            <FaEnvelope className="inline mr-2" />Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:border-[#106fb8] focus:ring-2 focus:ring-[#106fb8] focus:ring-opacity-50 transition duration-200 ease-in-out bg-white text-gray-800 hover:bg-gray-50 group-hover:border-[#106fb8]"
                            placeholder="Enter your college email"
                            required
                        />
                    </div>

                    <div className="group relative">
                        <label htmlFor="password" className="block text-sm font-semibold text-gray-600 mb-2 group-hover:text-[#106fb8] transition-colors duration-200">
                            <FaLock className="inline mr-2" />Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg shadow-sm focus:border-[#106fb8] focus:ring-2 focus:ring-[#106fb8] focus:ring-opacity-50 transition duration-200 ease-in-out bg-white text-gray-800 hover:bg-gray-50 group-hover:border-[#106fb8]"
                                placeholder="Enter your password"
                                required
                            />
                            <button
                                type="button"
                                onClick={togglePasswordVisibility}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-[#106fb8] focus:outline-none focus:text-[#106fb8] transition-colors duration-200"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? (
                                    <FaEyeSlash className="w-5 h-5" />
                                ) : (
                                    <FaEye className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>

                    <motion.button
                        type="submit"
                        disabled={isLoading}
                        whileTap={{ scale: 0.95 }}
                        className="w-full bg-[#106fb8] text-white py-3 px-4 rounded-lg hover:bg-[#0e5d9e] focus:outline-none focus:ring-4 focus:ring-[#106fb8] focus:ring-opacity-50 transition duration-300 ease-in-out font-bold shadow-md hover:shadow-lg transform hover:scale-105 relative overflow-hidden group disabled:opacity-70"
                    >
                        <span className="absolute top-0 left-0 w-full h-full bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300 ease-in-out"></span>
                        {isLoading ? (
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full inline-block"
                            />
                        ) : (
                            'Sign In'
                        )}
                    </motion.button>
                </form>
            </motion.div>
        </motion.div>
    )
}