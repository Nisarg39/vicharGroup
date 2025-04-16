"use client"
import CourseControl from "../../../components/admin/product-controls/coursePanel/CourseControl";
import CourseSignIn from "../../../components/courseController/CourseSignIn";
import { useState, useEffect } from "react";

const CourseController = () => {

    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("isCourseController");
        if (token) {
            setIsAuthenticated(true);
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("isCourseController");
        setIsAuthenticated(false);
    };

    return (
        <section className="bg-white py-12 sm:py-16 lg:py-20 min-h-screen">
        <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-4 sm:mb-6 md:mb-8">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-800 tracking-tight">Course Controller</h2>
                {isAuthenticated && (
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                        Logout
                    </button>
                )}
            </div>
            <div className="flex flex-wrap justify-center gap-8 sm:gap-10 md:gap-18">
                {isAuthenticated ? 
                        <CourseControl /> 
                    : 
                        <CourseSignIn setIsAuthenticated={setIsAuthenticated} />
                }
            </div>
        </div>
        </section>
    )
}

export default CourseController;