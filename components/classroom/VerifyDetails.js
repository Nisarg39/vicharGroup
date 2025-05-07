
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

    const handleSubmit = async(e) => {
        e.preventDefault()
        const name = e.target[0].value
        const email = e.target[1].value
        const token = localStorage.getItem('token')
        const response = await mandatoryDetails({name, email, token})
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
        <section id="verify-details" className="max-w-md mx-auto min-h-screen p-8 flex items-center justify-center">
            <div className="w-full bg-white rounded-xl shadow-lg p-8">
                <h1 className="text-3xl font-bold mb-8 text-gray-800 text-center">Verify Details</h1>
                <p className="text-gray-600 text-center mb-6"> Please enter the mandatory details to get started </p>
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
                    <button 
                        type="submit"
                        className="w-full bg-[#1d77bc] text-white py-3 px-6 rounded-lg hover:bg-[#1d77bc]/80 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
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
        </section>
    )
}