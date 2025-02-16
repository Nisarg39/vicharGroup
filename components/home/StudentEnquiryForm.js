"use client"
import { FaUser, FaEnvelope, FaPhone, FaBook, FaGraduationCap, FaComment } from 'react-icons/fa'
import { studentEnq } from '../../server_actions/actions/userActions'
import Modal from '../common/Modal'
import React from 'react'
import { motion } from 'framer-motion'

function StudentEnquiryForm() {
    const [selectedStream, setSelectedStream] = React.useState('')
    const [showModal, setShowModal] = React.useState(false)
    const [modalMessage, setModalMessage] = React.useState('')
    const [isSuccess, setIsSuccess] = React.useState(false)
    const [isLoading, setIsLoading] = React.useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        const formData = new FormData()
        formData.append('fullName', e.target.fullName.value)
        formData.append('email', e.target.email.value)
        formData.append('mobile', e.target.mobile.value)
        formData.append('stream', e.target.stream.value)
        formData.append('class', e.target.class.value)
        formData.append('message', e.target.message.value)

        const result = await studentEnq(formData)
        setIsSuccess(result.success)
        setModalMessage(result.message)
        if (result.success) {
            e.target.reset()
            setSelectedStream('')
        }
        setShowModal(true)
        setIsLoading(false)
        return
    }

    const handleMobileInput = (e) => {
        const value = e.target.value.replace(/\D/g, '')
        if (value.length <= 10) {
            e.target.value = value
        } else {
            e.target.value = value.slice(0, 10)
        }
    }

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-95 bg-transparent to-white py-8"
        >
            <Modal showModal={showModal} setShowModal={setShowModal} isSuccess={isSuccess} modalMessage={modalMessage} />
            <motion.h2 
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-3xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-center mb-6 sm:mb-10 text-gray-800 leading-tight"
            >
                Student Enquiry Form
            </motion.h2>
            <motion.div 
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
                className="p-4 sm:p-6 md:p-10 rounded-xl shadow-2xl max-w-5xl mx-auto my-4 sm:my-8 md:my-16 bg-white border-t-4 border-[#106fb8] transition-all duration-300 hover:shadow-3xl"
            >
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 md:space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        <div className="group relative">
                            <label htmlFor="fullName" className="block text-sm font-semibold text-gray-600 mb-1 sm:mb-2 group-hover:text-[#106fb8] transition-colors duration-200">
                                <FaUser className="inline mr-2" />Full Name
                            </label>
                            <input type="text" id="fullName" name="fullName" required className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-[#106fb8] focus:ring-2 focus:ring-[#106fb8] focus:ring-opacity-50 transition duration-200 ease-in-out text-sm py-2 sm:py-3 px-3 sm:px-4 bg-white text-gray-800 hover:bg-gray-50 group-hover:border-[#106fb8] transform hover:scale-105 hover:shadow-md" />
                        </div>
                        <div className="group relative">
                            <label htmlFor="email" className="block text-sm font-semibold text-gray-600 mb-1 sm:mb-2 group-hover:text-[#106fb8] transition-colors duration-200">
                                <FaEnvelope className="inline mr-2" />Email
                            </label>
                            <input type="email" id="email" name="email" required className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-[#106fb8] focus:ring-2 focus:ring-[#106fb8] focus:ring-opacity-50 transition duration-200 ease-in-out text-sm py-2 sm:py-3 px-3 sm:px-4 bg-white text-gray-800 hover:bg-gray-50 group-hover:border-[#106fb8] transform hover:scale-105 hover:shadow-md" />
                        </div>
                        <div className="group relative">
                            <label htmlFor="mobile" className="block text-sm font-semibold text-gray-600 mb-1 sm:mb-2 group-hover:text-[#106fb8] transition-colors duration-200">
                                <FaPhone className="inline mr-2 transform scale-x-[-1]" />Mobile Number
                            </label>
                            <input 
                                type="tel" 
                                id="mobile" 
                                name="mobile" 
                                required 
                                pattern="[0-9]{10}"
                                maxLength="10"
                                onInput={handleMobileInput}
                                className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-[#106fb8] focus:ring-2 focus:ring-[#106fb8] focus:ring-opacity-50 transition duration-200 ease-in-out text-sm py-2 sm:py-3 px-3 sm:px-4 bg-white text-gray-800 hover:bg-gray-50 group-hover:border-[#106fb8] transform hover:scale-105 hover:shadow-md" 
                            />
                        </div>
                        <div className="group relative">
                            <label htmlFor="stream" className="block text-sm font-semibold text-gray-600 mb-1 sm:mb-2 group-hover:text-[#106fb8] transition-colors duration-200">
                                <FaBook className="inline mr-2" />Stream
                            </label>
                            <select id="stream" name="stream" required className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-[#106fb8] focus:ring-2 focus:ring-[#106fb8] focus:ring-opacity-50 transition duration-200 ease-in-out text-sm py-2 sm:py-3 px-3 sm:px-4 bg-white text-gray-800 hover:bg-gray-50 appearance-none group-hover:border-[#106fb8] transform hover:scale-105 hover:shadow-md" onChange={(e) => setSelectedStream(e.target.value)}>
                                <option value="">Select a stream</option>
                                <option value="Engineering">Engineering</option>
                                <option value="Medical">Medical</option>
                                <option value="Boards-mhtcet">Boards-MHTCET</option>
                                <option value="Foundation">Foundation</option>
                            </select>
                        </div>
                        <div className="group relative">
                            <label htmlFor="class" className="block text-sm font-semibold text-gray-600 mb-1 sm:mb-2 group-hover:text-[#106fb8] transition-colors duration-200">
                                <FaGraduationCap className="inline mr-2" />Class
                            </label>
                            <select id="class" name="class" required className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-[#106fb8] focus:ring-2 focus:ring-[#106fb8] focus:ring-opacity-50 transition duration-200 ease-in-out text-sm py-2 sm:py-3 px-3 sm:px-4 bg-white text-gray-800 hover:bg-gray-50 appearance-none group-hover:border-[#106fb8] transform hover:scale-105 hover:shadow-md">
                                <option value="">Select a class</option>
                                {selectedStream === 'Foundation' ? (
                                    <>
                                        <option value="8">8th</option>
                                        <option value="9">9th</option>
                                        <option value="10">10th</option>
                                    </>
                                ) : (
                                    <>
                                        <option value="repeater">Repeater</option>
                                        <option value="11">11th</option>
                                        <option value="12">12th</option>
                                    </>
                                )}
                            </select>
                        </div>
                    </div>
                    <div className="group relative">
                        <label htmlFor="message" className="block text-sm font-semibold text-gray-600 mb-1 sm:mb-2 group-hover:text-[#106fb8] transition-colors duration-200">
                            <FaComment className="inline mr-2" />Message
                        </label>
                        <textarea id="message" name="message" rows="4" className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-[#106fb8] focus:ring-2 focus:ring-[#106fb8] focus:ring-opacity-50 transition duration-200 ease-in-out text-sm py-2 sm:py-3 px-3 sm:px-4 bg-white text-gray-800 hover:bg-gray-50 resize-none group-hover:border-[#106fb8] transform hover:scale-105 hover:shadow-md"></textarea>
                    </div>
                    <div className="flex justify-center">
                        <motion.button 
                            type="submit" 
                            disabled={isLoading}
                            whileTap={{ scale: 0.95 }}
                            className="w-full sm:w-1/3 bg-[#106fb8] text-white py-2 sm:py-3 px-3 sm:px-4 rounded-lg hover:bg-[#0e5d9e] focus:outline-none focus:ring-4 focus:ring-[#106fb8] focus:ring-opacity-50 transition duration-300 ease-in-out text-sm sm:text-base font-bold shadow-md hover:shadow-lg transform hover:scale-105 relative overflow-hidden group disabled:opacity-70"
                        >
                            <span className="absolute top-0 left-0 w-full h-full bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300 ease-in-out"></span>
                            {isLoading ? (
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full inline-block"
                                />
                            ) : (
                                'Send'
                            )}
                        </motion.button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    )
}
export default StudentEnquiryForm