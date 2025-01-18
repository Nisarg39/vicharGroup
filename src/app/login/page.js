"use client"
import SignIn from "../../../components/signIn/SignIn"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
const Login = () => {
    const router = useRouter()

    useEffect(() => {
        if(localStorage.getItem("token")){
            router.push('/classroom')
        }
    }, [])
    return (
        <>
            <SignIn />
        </>
    )
}

export default Login