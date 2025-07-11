"use client";
import CollegeSignIn from "./CollegeSignIn";
import CollegeDashboard from "./CollegeDashboard";
import { useState, useEffect } from "react";

export default function CollegeHome(){
    const [isCollegeSignedIn, setIsCollegeSignedIn] = useState(false);

    useEffect(() => {
        const collegeToken = localStorage.getItem("isCollege");
        if (collegeToken !== null) {
            setIsCollegeSignedIn(true);
        }
    }, [])

    const handleSignOut = () => {
        localStorage.removeItem("isCollege");
        setIsCollegeSignedIn(false);
    };

    return (
        <div>
            {isCollegeSignedIn ? 
                    <CollegeDashboard 
                        onSignOut={handleSignOut}
                    /> 
                : 
                    <CollegeSignIn 
                        setIsCollegeSignedIn={setIsCollegeSignedIn}
                    />
            }
        </div>
    )
}