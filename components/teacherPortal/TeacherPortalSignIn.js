"use client"
import { useState } from 'react';
import { FaEnvelope, FaLock, FaUser } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { teacherLogin } from '../../server_actions/actions/examController/teacherActions';

export default function TeacherPortalSignIn({ onLoginSuccess }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSignIn = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        
        try {
            const details = {
                email,
                password
            }
            
            const result = await teacherLogin(details);
            
            if (result.success) {
                alert('✅ ' + result.message + ' - Welcome!');
                await localStorage.setItem('isTeacher', result.teacher.token);
                // Reset form on successful login
                setEmail('');
                setPassword('');
                // Call the callback to update parent component
                if (onLoginSuccess) {
                    onLoginSuccess();
                }
            } else {
                alert('❌ ' + result.message + ' - Please check your credentials');
            }
        } catch (error) {
            alert('❌ An error occurred during login. Please try again.');
            console.error('Login error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen bg-transparent to-white flex items-center justify-center p-4"
        >
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
                    className="text-3xl sm:text-4xl font-extrabold text-center text-gray-800 mb-8 leading-tight"
                >
                    <FaUser className="inline mr-2 text-[#106fb8]" />
                    Teacher Portal Sign In
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
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:border-[#106fb8] focus:ring-2 focus:ring-[#106fb8] focus:ring-opacity-50 transition duration-200 ease-in-out bg-white text-gray-800 hover:bg-gray-50 group-hover:border-[#106fb8] transform hover:scale-105 hover:shadow-md"
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <div className="group relative">
                        <label htmlFor="password" className="block text-sm font-semibold text-gray-600 mb-2 group-hover:text-[#106fb8] transition-colors duration-200">
                            <FaLock className="inline mr-2" />Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:border-[#106fb8] focus:ring-2 focus:ring-[#106fb8] focus:ring-opacity-50 transition duration-200 ease-in-out bg-white text-gray-800 hover:bg-gray-50 group-hover:border-[#106fb8] transform hover:scale-105 hover:shadow-md"
                            placeholder="Enter your password"
                            required
                        />
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
    );
}