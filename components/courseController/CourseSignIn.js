import { useState } from "react"

export default function CourseSignIn({setIsAuthenticated}){
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")

    const handleSignIn = () => {
        if(username === "courseadmin" && password === "vichargroupadmin@411"){
            setIsAuthenticated(true);
            localStorage.setItem("isCourseController", true);
        } else {
            alert("Invalid username or password");
        }
    }

    return(
        <div className=" flex items-top justify-center">
            <div className="bg-white p-8 rounded-lg shadow-md w-96">
                <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Sign In</h1>
                <div className="mb-4">
                    <input 
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="mb-6">
                    <input 
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <button 
                    onClick={handleSignIn}
                    className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors duration-200"
                >
                    Sign In
                </button>
            </div>
        </div>
    )
}