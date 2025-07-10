"use client"
import { getTeacherDetails } from "../../server_actions/actions/examController/teacherActions"
import AddQuestion from "../admin/exam_portal_components/super_admin/questionControls/AddQuestion"
import QuestionsList from "../admin/exam_portal_components/super_admin/questionControls/QuestionsList"
import TeacherProfile from "./TeacherProfile"
import { useEffect, useState } from "react"
import { FaQuestion, FaPlus, FaUser, FaChalkboardTeacher } from 'react-icons/fa'

export default function TeacherPortalDashboard() {

    const [teacherDetails, setTeacherDetails] = useState({})
    const [subjects, setSubjects] = useState([])
    const [activeSection, setActiveSection] = useState('addQuestion')

    async function getTeacherDetailsFromServer() {
        const token = localStorage.getItem("isTeacher")
        const details = {
            token: token,
        }
        const result = await getTeacherDetails(details)
        if (result.success) {
            setTeacherDetails(result.teacher)
            
            // Extract teacher's subject and format it for AddQuestion component
            if (result.teacher.subject) {
                const teacherSubject = result.teacher.subject
                const formattedSubjects = [{
                    value: teacherSubject,
                    label: teacherSubject
                }]
                setSubjects(formattedSubjects)
            }
        }
    }

    useEffect(() => {
        getTeacherDetailsFromServer()
    }, [])
    
    return (
        <div className="container mx-auto px-4">
            {/* Header Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h1 className="text-2xl md:text-4xl font-semibold text-gray-900 flex items-center gap-3">
                    <FaChalkboardTeacher className="text-[#1d77bc]" />
                    Teacher Portal
                </h1>
                {teacherDetails.name && (
                    <p className="text-gray-600 mt-2 text-lg">
                        Welcome, {teacherDetails.name}
                        {teacherDetails.subject && (
                            <span className="ml-2 text-[#1d77bc] font-medium">
                                • {teacherDetails.subject}
                            </span>
                        )}
                    </p>
                )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex flex-wrap gap-4 mb-8">
                <button 
                    className={`${activeSection === 'questionsList' ? 'bg-[#2c9652]' : 'bg-[#2c9652]/60'} text-white px-6 py-2.5 rounded-lg hover:bg-[#2c9652]/90 transition-colors duration-200 flex items-center gap-2`}
                    onClick={() => setActiveSection('questionsList')}
                >
                    <FaQuestion />
                    Show Questions
                </button>

                <button 
                    className={`${activeSection === 'addQuestion' ? 'bg-[#1d77bc]' : 'bg-[#1d77bc]/60'} text-white px-6 py-2.5 rounded-lg hover:bg-[#1d77bc]/90 transition-colors duration-200 flex items-center gap-2`}
                    onClick={() => setActiveSection('addQuestion')}
                >
                    <FaPlus />
                    Add Question
                </button>

                <button 
                    className={`${activeSection === 'teacherProfile' ? 'bg-[#8b5a2b]' : 'bg-[#8b5a2b]/60'} text-white px-6 py-2.5 rounded-lg hover:bg-[#8b5a2b]/90 transition-colors duration-200 flex items-center gap-2`}
                    onClick={() => setActiveSection('teacherProfile')}
                >
                    <FaUser />
                    Teacher Profile
                </button>
            </div>

            {/* Content Sections */}
            {activeSection === 'addQuestion' && <AddQuestion subjects={subjects}/>}
            {activeSection === 'questionsList' && <QuestionsList subjects={subjects}/>}
            {activeSection === 'teacherProfile' && <TeacherProfile teacherDetails={teacherDetails}/>}
        </div>
    )
}