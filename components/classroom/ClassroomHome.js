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

    const router = useRouter()

    async function getDetails(token){
        const studentDetail = await getStudentDetails(token)
        dispatch(studentDetails(studentDetail.student))
        setLoading(false)
    }
    
    useEffect(() => {
        const token =  localStorage.getItem('token')
        if(token){
            const reponse = getDetails(token)
            if(!response.success){
                localStorage.removeItem('token')
                router.push('/login')
            }else{
                router.push('login')
            }
        }else{
            router.push('/login')
        }
    }, [])

    return (
        <section className="min-h-screen">
            {loading ? (
                <div className="h-screen flex items-center justify-center">
                    <LoadingSpinner />
                </div>
            ) : (
                student.isVerified ? <StudentDashboard /> : <VerifyDetails />
            )}
        </section>
    )
}
