"use client"
import { useSelector, useDispatch } from "react-redux"
import { useEffect, useState } from "react"
import { getStudentDetails  } from "../../server_actions/actions/studentActions"
import { studentDetails } from "../../features/login/LoginSlice"
import VerifyDetails from "./VerifyDetails"
import StudentDashboard from "./StudentDashboard"
import LoadingSpinner from "../common/LoadingSpinner"
import { useRouter } from "next/navigation"
export default function ClassroomHome() {

    const dispatch = useDispatch()
    const student = useSelector(state => state.login.studentDetails)
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)

    const router = useRouter()

    async function getDetails(token){
        const studentDetail = await getStudentDetails(token)
        if(!studentDetail.success){
            localStorage.removeItem('token')
            router.push('/login')
        }else{
        dispatch(studentDetails(studentDetail.student))
        setLoading(false)
        }
    }
    
    useEffect(() => {
        const token =  localStorage.getItem('token')
        if(token){
            const cart = localStorage.getItem('cart')
            if(cart){
                setShowModal(true)
                setTimeout(() => {
                    localStorage.removeItem("cart")
                    router.push(cart)
                }, 3000)
            }else{
                getDetails(token)
            }
        }
    }, [])

    return (
      <section className="min-h-screen">
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-1.5 h-12 bg-gradient-to-b from-[#1d77bc] to-[#2488d8] rounded-full"></div>
                  <p className="text-xl font-bold text-gray-800">
                    Complete Your Purchase
                  </p>
                </div>
                <p className="text-gray-600">
                  Redirecting to Payment Page .. 
                </p>
                <div className="flex justify-center">
                  <LoadingSpinner />
                </div>
              </div>
            </div>
          </div>
        )}
        {loading ? (
          <div className="h-screen flex items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : student.isVerified ? (
          <StudentDashboard />
        ) : (
          <VerifyDetails />
        )}
      </section>
    );
}
