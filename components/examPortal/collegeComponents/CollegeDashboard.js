"use client"
import { useState, useEffect } from "react";
import CollegeSidebar from "./collegeDashboardComponents/CollegeSidebar";
import CollegeOverview from "./collegeDashboardComponents/CollegeOverview";
import ManageExams from './collegeDashboardComponents/ManageExams';
import Students from './collegeDashboardComponents/Students';
import Teachers from './collegeDashboardComponents/Teachers';
import Results from './collegeDashboardComponents/Results';
import Reports from './collegeDashboardComponents/Reports';
import CollegeProfile from './collegeDashboardComponents/CollegeProfile';
import NegativeMarkingSettings from './collegeDashboardComponents/NegativeMarkingSettings';
import { collegeDetails } from "../../../server_actions/actions/examController/collegeActions";

export default function CollegeDashboard({ onSignOut }) {
    const [selectedMenu, setSelectedMenu] = useState('overview')
    const [collegeData, setCollegeData] = useState(null)
    const [examDetails, setExamDetails] = useState(null)

    useEffect(() => {
        const fetchCollegeDetails = async () => {
            // Get token from localStorage or wherever you store it after login
            const token = localStorage.getItem('isCollege')
            const response = await collegeDetails({ token })
            
            if (response.success) {
                setCollegeData(response.college)
                setExamDetails(response.examDetails)
            }
        }

        fetchCollegeDetails()
    }, [])

    const handleMenuSelect = (menuId) => {
        setSelectedMenu(menuId)
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Fixed Sidebar */}
            <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg z-10">
                <CollegeSidebar onMenuSelect={handleMenuSelect} collegeData={collegeData} />
            </div>
            
            {/* Main Content */}
            <div className="flex-1 ml-64">
                {/* Header */}
                <header className="bg-white shadow-sm border-b border-gray-200 px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-800">College Dashboard</h1>
                            <p className="text-sm text-gray-500 mt-1">Welcome back! Here's what's happening at your college.</p>
                        </div>
                        <button 
                            onClick={onSignOut}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                        >
                            Logout
                        </button>
                    </div>
                </header>

                {/* Render components based on selected menu */}
                {selectedMenu === 'overview' && <CollegeOverview collegeData={collegeData} examDetails={examDetails} />}
                {selectedMenu === 'exams' && <ManageExams collegeData={collegeData} examDetails={examDetails} />}
                {selectedMenu === 'students' && <Students collegeData={collegeData} />}
                {selectedMenu === 'teachers' && <Teachers collegeData={collegeData} />}
                {selectedMenu === 'results' && <Results />}
                {selectedMenu === 'reports' && <Reports />}
                {selectedMenu === 'negative-marking' && <NegativeMarkingSettings collegeData={collegeData} onBack={() => setSelectedMenu('overview')} />}
                {selectedMenu === 'profile' && <CollegeProfile collegeData={collegeData} />}
            </div>
        </div>
    )
}