"use client"
import { useState } from "react"
const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [emailError, setEmailError] = useState('')
    const [passwordError, setPasswordError] = useState('')
    const [showPassword, setShowPassword] = useState(false)

    const validateEmail = (email) => {
        const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
        return re.test(String(email).toLowerCase())
    }

    const handleEmailChange = (e) => {
        setEmail(e.target.value)
        if (!validateEmail(e.target.value)) {
            setEmailError('Please enter a valid email address')
        } else {
            setEmailError('')
        }
    }

    const handlePasswordChange = (e) => {
        setPassword(e.target.value)
        if (e.target.value.length < 8) {
            setPasswordError('Password must be at least 8 characters long')
        } else {
            setPasswordError('')
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!emailError && !passwordError && email && password) {
            // Proceed with login
            alert('Login submitted')
        } else {
            console.log('Form has errors')
        }
    }

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword)
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-8">
            <div className="w-full max-w-md">
                <div className="bg-white shadow-2xl rounded-lg px-6 sm:px-8 py-8 mb-4 transition-all duration-300 perspective-1000 transform hover:scale-105 hover:border-2 hover:border-[#106FB7]">
                    <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Login</h1>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                                Email
                            </label>
                            <div className="relative">
                                <input
                                    className={`shadow-sm appearance-none border ${emailError ? 'border-red-500' : 'border-gray-300'} rounded-lg w-full py-2 pl-10 pr-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-[#106FB7] focus:border-transparent transition-all duration-300`}
                                    id="email"
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={handleEmailChange}
                                />
                                <span className="absolute left-3 top-2 text-gray-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                    </svg>
                                </span>
                            </div>
                            {emailError && <p className="text-red-500 text-xs italic mt-1">{emailError}</p>}
                        </div>
                        <div className="mb-8">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    className={`shadow-sm appearance-none border ${passwordError ? 'border-red-500' : 'border-gray-300'} rounded-lg w-full py-2 pl-10 pr-10 text-gray-700 mb-2 leading-tight focus:outline-none focus:ring-2 focus:ring-[#106FB7] focus:border-transparent transition-all duration-300`}
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={handlePasswordChange}
                                />
                                <span className="absolute left-3 top-2 text-gray-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                    </svg>
                                </span>
                                <button
                                    type="button"
                                    className="absolute right-3 top-2 text-gray-400 focus:outline-none"
                                    onClick={togglePasswordVisibility}
                                >
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                                            <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {passwordError && <p className="text-red-500 text-xs italic mt-1">{passwordError}</p>}
                        </div>
                        <div className="flex flex-col space-y-4">
                            <button
                                className="bg-gradient-to-r from-[#fe9852] to-[#ef5a2a] hover:from-[#ef5a2a] hover:to-[#fe9852] text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 transition-all duration-300 transform hover:scale-105 shadow-md w-full sm:w-auto"
                                type="submit"
                            >
                                Sign In
                            </button>
                            <div className="flex justify-center">
                                <button
                                    className="bg-white text-[#106FB7] font-bold p-2 rounded-lg border border-gray-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#106FB7] focus:ring-opacity-50 transition-all duration-300 transform hover:scale-105 shadow-md flex items-center justify-center space-x-2"
                                    type="button"
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
                            <div className="flex justify-center mt-1">
                                <a className="inline-block align-baseline font-semibold text-sm text-[#106FB7] hover:text-[#106FB7] transition-colors duration-300 hover:underline" href="#">
                                    Forgot Password?
                                </a>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Login