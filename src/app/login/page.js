"use client"
import SignIn from "../../../components/signIn/SignIn"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { SessionProvider } from "next-auth/react"
const Login = () => {
    const router = useRouter()

    useEffect(() => {
        if(localStorage.getItem("token")){
            router.push('/classroom')
        }
    }, [])
    return (
        <>
        <SessionProvider>
            <SignIn />
        </SessionProvider>
        </>
    )
}

export default Login