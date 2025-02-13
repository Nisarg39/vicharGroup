"use client"
import { useState, useEffect } from "react"
import { sendOtp, verifyOtp, } from "../../server_actions/actions/studentActions"
import { validateGoogleSignIn } from "../../server_actions/actions/serverActions"
import Modal from "../common/Modal"
import { useRouter } from "next/navigation"
import LoadingSpinner from "../common/LoadingSpinner"
import { signIn, getSession } from "next-auth/react"

const SignIn = () => {
    const [mobile, setMobile] = useState('')
    const [mobileError, setMobileError] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [modalMessage, setModalMessage] = useState('')
    const [isSuccess, setIsSuccess] = useState(false)
    const [showOtpInput, setShowOtpInput] = useState(false)
    const [otp, setOtp] = useState('')
    const [otpError, setOtpError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const router = useRouter()
    
    async function checkSession(){
        // we get this session from api/auth/[...nextauth]/route.js which handles callbacks from google
        // this is a way to check if the user is logged in or not google auth
        // watch the youtube video . link is in instructions.txt
        const session = await getSession()
        if (session) {
            const response = await validateGoogleSignIn(session)
            if (response.success) {
                console.log(response)
                localStorage.setItem('token', response.student.token)
                router.push('/classroom')
            }else{
                setModalMessage(response.message)
                setShowModal(true)
            }
        }
    }
    useEffect(() => {
        if(localStorage.getItem('token')){
            router.push('/classroom')
        }else{
            checkSession()
        }
    }, [])


    const validateMobile = (mobile) => {
        const re = /^[0-9]{10}$/
        return re.test(mobile)
    }

    const validateOtp = (otp) => {
        const re = /^[0-9]{4}$/
        return re.test(otp)
    }

    const handleMobileChange = (e) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 10)
        setMobile(value)
        if (!validateMobile(value)) {
            setMobileError('Please enter a valid 10-digit mobile number')
        } else {
            setMobileError('')
        }
    }

    const handleOtpChange = (e) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 4)
        setOtp(value)
        if (!validateOtp(value)) {
            setOtpError('Please enter a valid 4-digit OTP')
        } else {
            setOtpError('')
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!mobileError && mobile) {
            setIsLoading(true)
            const response = await sendOtp(mobile)
            setIsLoading(false)
            if (response.success) {
                setModalMessage(response.message || 'OTP sent successfully')
                setIsSuccess(true)
                setShowModal(true)
                setShowOtpInput(true)
            }
        } else {
            setModalMessage('Please fix the errors in the form')
            setIsSuccess(false)
            setShowModal(true)
        }
    }

    const handleVerifyOtp = async (e) => {
        e.preventDefault()
        if (!otpError && otp) {
            setIsLoading(true)
            const response = await verifyOtp({otp, mobile})
            setIsLoading(false)
            if (response.success){
                localStorage.setItem('token', response.student.token)
                setModalMessage('Login successful')
                setIsSuccess(true)
                setShowModal(true)
                router.push('/classroom')
            } else {
                setModalMessage('Invalid OTP')
                setIsSuccess(false)
                setShowModal(true)
            }
        }
    }

    async function signInWithGoogle() {
        await signIn('google', { callbackUrl: '/login' })
    }
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-8">
            <div className="w-full max-w-md">
                <div className="bg-white shadow-2xl rounded-lg px-6 sm:px-8 py-8 mb-4 transition-all duration-300 perspective-1000 transform hover:scale-105 hover:border-2 hover:border-[#106FB7]">
                    <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Login</h1>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <LoadingSpinner />
                        </div>
                    ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="mobile">
                                Mobile Number
                            </label>
                            <div className="relative">
                                <input
                                    className={`shadow-sm appearance-none border ${mobileError ? 'border-red-500' : 'border-gray-300'} rounded-lg w-full py-2 pl-10 pr-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-[#106FB7] focus:border-transparent transition-all duration-300`}
                                    id="mobile"
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    maxLength="10"
                                    placeholder="Enter your mobile number"
                                    value={mobile}
                                    onChange={handleMobileChange}
                                />
                                <span className="absolute left-3 top-2 text-gray-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                    </svg>
                                </span>
                            </div>
                            {mobileError && <p className="text-red-500 text-xs italic mt-1">{mobileError}</p>}
                        </div>
                        {showOtpInput && (
                            <div className="mb-6">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="otp">
                                    Enter OTP
                                </label>
                                <input
                                    className={`shadow-sm appearance-none border ${otpError ? 'border-red-500' : 'border-gray-300'} rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-[#106FB7] focus:border-transparent transition-all duration-300`}
                                    id="otp"
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    maxLength="4"
                                    placeholder="Enter 4-digit OTP"
                                    value={otp}
                                    onChange={handleOtpChange}
                                />
                                {otpError && <p className="text-red-500 text-xs italic mt-1">{otpError}</p>}
                                <button
                                    onClick={handleVerifyOtp}
                                    className="mt-4 bg-gradient-to-r from-[#106FB7] to-[#2E8BC0] hover:from-[#2E8BC0] hover:to-[#106FB7] text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-300 transform hover:scale-105 shadow-md w-full"
                                    type="button"
                                >
                                    Verify OTP
                                </button>
                            </div>
                        )}
                        <div className="flex flex-col space-y-6">
                            {!showOtpInput && (
                                <>
                                    <button
                                        className="bg-gradient-to-r from-[#fe9852] to-[#ef5a2a] hover:from-[#ef5a2a] hover:to-[#fe9852] text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 transition-all duration-300 transform hover:scale-105 shadow-md w-full sm:w-auto"
                                        type="submit"
                                    >
                                        Sign In
                                    </button>
                                    <div className="flex items-center justify-center">
                                        <div className="flex-grow border-t border-gray-300"></div>
                                        <div className="mx-4 text-gray-500 font-medium">OR</div>
                                        <div className="flex-grow border-t border-gray-300"></div>
                                    </div>
                                    <div className="flex justify-center">
                                        <button
                                            className="bg-white text-[#106FB7] font-bold p-2 rounded-lg border border-gray-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#106FB7] focus:ring-opacity-50 transition-all duration-300 transform hover:scale-105 shadow-md flex items-center justify-center space-x-2"
                                            type="button"
                                            onClick={async() => await signInWithGoogle()}
                                        >
                                            <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                            </svg>
                                            <span>Sign in with Google</span>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </form>
                    )}
                </div>
            </div>
            <Modal 
                showModal={showModal} 
                setShowModal={setShowModal} 
                isSuccess={isSuccess} 
                modalMessage={modalMessage}
            >
                <p>{modalMessage}</p>
            </Modal>
        </div>
    )
}

export default SignIn