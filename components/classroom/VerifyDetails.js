import { useState } from "react"
import { mandatoryDetails } from "../../server_actions/actions/studentActions"
import { useDispatch } from "react-redux"
import { studentDetails } from "../../features/login/LoginSlice"
import Modal from "../common/Modal"

export default function VerifyDetails(props) {
    const dispatch = useDispatch()
    const [showModal, setShowModal] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [modalMessage, setModalMessage] = useState("")
    const [selectedStream, setSelectedStream] = useState("")

    const handleStreamChange = (stream) => {
        setSelectedStream(stream)
    }

    const handleSubmit = async(e) => {
        e.preventDefault()
        
        // Validate selected stream
        if (!selectedStream) {
            setIsSuccess(false)
            setModalMessage("Please select an interested stream")
            setShowModal(true)
            return
        }
        
        const formData = new FormData(e.target)
        const name = formData.get('name')
        const email = formData.get('email')
        const interestedClass = parseInt(formData.get('interestedClass'))
        const token = localStorage.getItem('token')
        
        // Validate interestedClass
        if (!interestedClass || isNaN(interestedClass)) {
            setIsSuccess(false)
            setModalMessage("Please select a valid class")
            setShowModal(true)
            return
        }
        
        const response = await mandatoryDetails({name, email, interestedStream: selectedStream, interestedClass, token})
        if(!response.success){
            setIsSuccess(false)
            setModalMessage(response.message)
            setShowModal(true)
        }else{
            setIsSuccess(true)
            setModalMessage("Details updated successfully!")
            setShowModal(true)
            dispatch(studentDetails(response.student))
        }
    }

    return (
        <div className="w-full h-full flex items-center justify-center px-4 sm:px-6 lg:px-8 py-6">
            <div className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-all duration-500 hover:bg-white/95">
                <h1 className="text-3xl font-bold mb-8 text-gray-800 text-center">Verify Details</h1>
                <p className="text-gray-600 text-center mb-6">Please enter the mandatory details to get started</p>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex flex-col">
                        <label htmlFor="name" className="mb-2 text-gray-700 font-medium">Full Name:</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            required
                            placeholder="Enter your full name"
                            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1d77bc] focus:border-[#1d77bc] transition-all duration-200"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="email" className="mb-2 text-gray-700 font-medium">Email:</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            required
                            placeholder="Enter your email address"
                            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1d77bc] focus:border-[#1d77bc] transition-all duration-200"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="mb-3 text-gray-700 font-medium">Interested Stream:</label>
                        <div className="grid grid-cols-2 gap-3">
                            {["NEET", "JEE", "MHT-CET", "SSC", "HSC", "ICSE"].map((stream) => (
                                <label key={stream} className={`flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-all duration-200 cursor-pointer ${selectedStream === stream ? 'border-[#1d77bc] bg-blue-50' : 'border-gray-200'}`}>
                                    <input
                                        type="radio"
                                        name="interestedStream"
                                        value={stream}
                                        checked={selectedStream === stream}
                                        onChange={() => handleStreamChange(stream)}
                                        className="w-4 h-4 text-[#1d77bc] border-gray-300 focus:ring-[#1d77bc] focus:ring-2"
                                        required
                                    />
                                    <span className="text-gray-700 font-medium select-none">{stream}</span>
                                </label>
                            ))}
                        </div>
                        {!selectedStream && (
                            <p className="text-sm text-red-500 mt-1">Please select a stream</p>
                        )}
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="interestedClass" className="mb-2 text-gray-700 font-medium">Interested Class:</label>
                        <select
                            id="interestedClass"
                            name="interestedClass"
                            required
                            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1d77bc] focus:border-[#1d77bc] transition-all duration-200"
                        >
                            <option value="">Select Class</option>
                            <option value="12">Class 12</option>
                            <option value="11">Class 11</option>
                            <option value="10">Class 10</option>
                            <option value="9">Class 9</option>
                            <option value="8">Class 8</option>
                        </select>
                    </div>
                    <button 
                        type="submit"
                        className="w-full bg-gradient-to-r from-[#1d77bc] to-[#2d8bd4] text-white py-3 px-6 rounded-xl hover:shadow-lg transition-all duration-200 font-medium shadow-md transform hover:-translate-y-0.5"
                    >
                        Submit
                    </button>
                </form>
            </div>
            <Modal 
                showModal={showModal}
                setShowModal={setShowModal}
                isSuccess={isSuccess}
                modalMessage={modalMessage}
            />
        </div>
    )
}