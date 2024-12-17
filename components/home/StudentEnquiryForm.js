"use client"
import { FaUser, FaEnvelope, FaPhone, FaBook, FaGraduationCap, FaComment } from 'react-icons/fa'
import { studentEnq } from '../../server_actions/actions/userActions'
import Modal from '../common/modal'
import React from 'react'

function StudentEnquiryForm() {
    const [selectedStream, setSelectedStream] = React.useState('')
    const [showModal, setShowModal] = React.useState(false)
    const [modalMessage, setModalMessage] = React.useState('')
    const [isSuccess, setIsSuccess] = React.useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        const formData = new FormData()
        formData.append('fullName', e.target.fullName.value)
        formData.append('email', e.target.email.value)
        formData.append('mobile', e.target.mobile.value)
        formData.append('stream', e.target.stream.value)
        formData.append('class', e.target.class.value)
        formData.append('message', e.target.message.value)
        const result = await studentEnq(formData)
        setIsSuccess(result.success)
        setModalMessage(result.success ? 'Enquiry submitted successfully!' : result.message)
        if (result.success) {
            e.target.reset()
            setSelectedStream('')
        }
        setShowModal(true)
        return
    }

    return (
        <div className="min-h-screen bg-cover bg-center bg-no-repeat">
            <Modal showModal={showModal} setShowModal={setShowModal} isSuccess={isSuccess} modalMessage={modalMessage} />
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-extrabold text-center mb-4 sm:mb-6 md:mb-10 text-gray-800 leading-tight mt-4 sm:mt-8 animate-fade-in-down relative">
                Student Enquiry Form
            </h2>
            <div className="p-4 sm:p-6 md:p-10 rounded-xl shadow-2xl max-w-3xl mx-auto my-4 sm:my-8 md:my-16 bg-white border-t-4 border-[#106fb8] transition-all duration-300 hover:shadow-3xl backdrop-filter backdrop-blur-lg bg-opacity-90">
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 md:space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div className="group relative">
                            <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-1 sm:mb-2 group-hover:text-[#106fb8] transition-colors duration-200">
                                <FaUser className="inline mr-2" />Full Name
                            </label>
                            <input type="text" id="fullName" name="fullName" required className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-[#106fb8] focus:ring-2 focus:ring-[#106fb8] focus:ring-opacity-50 transition duration-200 ease-in-out text-sm py-2 sm:py-3 px-3 sm:px-4 bg-gray-50 hover:bg-white group-hover:border-[#106fb8] transform hover:scale-105 hover:shadow-md" />
                        </div>
                        <div className="group relative">
                            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1 sm:mb-2 group-hover:text-[#106fb8] transition-colors duration-200">
                                <FaEnvelope className="inline mr-2" />Email
                            </label>
                            <input type="email" id="email" name="email" required className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-[#106fb8] focus:ring-2 focus:ring-[#106fb8] focus:ring-opacity-50 transition duration-200 ease-in-out text-sm py-2 sm:py-3 px-3 sm:px-4 bg-gray-50 hover:bg-white group-hover:border-[#106fb8] transform hover:scale-105 hover:shadow-md" />
                        </div>
                        <div className="group relative">
                            <label htmlFor="mobile" className="block text-sm font-semibold text-gray-700 mb-1 sm:mb-2 group-hover:text-[#106fb8] transition-colors duration-200">
                                <FaPhone className="inline mr-2 transform scale-x-[-1]" />Mobile Number
                            </label>
                            <input type="tel" id="mobile" name="mobile" required className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-[#106fb8] focus:ring-2 focus:ring-[#106fb8] focus:ring-opacity-50 transition duration-200 ease-in-out text-sm py-2 sm:py-3 px-3 sm:px-4 bg-gray-50 hover:bg-white group-hover:border-[#106fb8] transform hover:scale-105 hover:shadow-md" />
                        </div>
                        <div className="group relative">
                            <label htmlFor="stream" className="block text-sm font-semibold text-gray-700 mb-1 sm:mb-2 group-hover:text-[#106fb8] transition-colors duration-200">
                                <FaBook className="inline mr-2" />Stream
                            </label>
                            <select id="stream" name="stream" required className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-[#106fb8] focus:ring-2 focus:ring-[#106fb8] focus:ring-opacity-50 transition duration-200 ease-in-out text-sm py-2 sm:py-3 px-3 sm:px-4 bg-gray-50 hover:bg-white appearance-none group-hover:border-[#106fb8] transform hover:scale-105 hover:shadow-md" onChange={(e) => setSelectedStream(e.target.value)}>
                                <option value="">Select a stream</option>
                                <option value="Engineering">Engineering</option>
                                <option value="Medical">Medical</option>
                                <option value="Boards-mhtcet">Boards-MHTCET</option>
                                <option value="Foundation">Foundation</option>
                            </select>
                        </div>
                        <div className="group relative">
                            <label htmlFor="class" className="block text-sm font-semibold text-gray-700 mb-1 sm:mb-2 group-hover:text-[#106fb8] transition-colors duration-200">
                                <FaGraduationCap className="inline mr-2" />Class
                            </label>
                            <select id="class" name="class" required className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-[#106fb8] focus:ring-2 focus:ring-[#106fb8] focus:ring-opacity-50 transition duration-200 ease-in-out text-sm py-2 sm:py-3 px-3 sm:px-4 bg-gray-50 hover:bg-white appearance-none group-hover:border-[#106fb8] transform hover:scale-105 hover:shadow-md">
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
                        <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-1 sm:mb-2 group-hover:text-[#106fb8] transition-colors duration-200">
                            <FaComment className="inline mr-2" />Message
                        </label>
                        <textarea id="message" name="message" rows="4" required className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-[#106fb8] focus:ring-2 focus:ring-[#106fb8] focus:ring-opacity-50 transition duration-200 ease-in-out text-sm py-2 sm:py-3 px-3 sm:px-4 bg-gray-50 hover:bg-white resize-none group-hover:border-[#106fb8] transform hover:scale-105 hover:shadow-md"></textarea>
                    </div>
                    <div className="flex justify-center">
                        <button type="submit" className="w-full sm:w-1/2 bg-[#106fb8] text-white py-2 sm:py-3 px-3 sm:px-4 rounded-lg hover:bg-[#0e5d9e] focus:outline-none focus:ring-4 focus:ring-[#106fb8] focus:ring-opacity-50 transition duration-300 ease-in-out text-sm sm:text-base font-bold shadow-md hover:shadow-lg transform hover:scale-105 relative overflow-hidden group">
                            <span className="absolute top-0 left-0 w-full h-full bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300 ease-in-out"></span>
                            Send
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
export default StudentEnquiryForm