"use client"

import { useState } from 'react'
import ResultsOverview from './collegeResultsComponents/ResultsOverview'
import ExamResultsList from './collegeResultsComponents/ExamResultsList'
import ExamStudentStats from './collegeResultsComponents/ExamStudentStats'
import StudentWiseAnalytics from './collegeResultsComponents/StudentWiseAnalytics'


export default function Results() {
    const [currentView, setCurrentView] = useState('overview')
    const [navigationData, setNavigationData] = useState({})

    const handleNavigate = (view, data = {}) => {
        setCurrentView(view)
        setNavigationData(data)
    }

    const handleBack = () => {
        // Navigate back to previous view based on current view
        switch (currentView) {
            case 'exams':
                setCurrentView('overview')
                break
            case 'examStudentStats':
                setCurrentView('exams')
                break
            case 'studentAnalytics':
                setCurrentView('overview')
                break
            default:
                setCurrentView('overview')
        }
        setNavigationData({})
    }

    const renderCurrentView = () => {
        switch (currentView) {
            case 'overview':
                return <ResultsOverview onNavigate={handleNavigate} />
            
            case 'exams':
                return <ExamResultsList onNavigate={handleNavigate} onBack={handleBack} />
            
            case 'examStudentStats':
                return (
                    <ExamStudentStats 
                        examId={navigationData.examId}
                        examData={navigationData.examData}
                        onNavigate={handleNavigate} 
                        onBack={handleBack} 
                    />
                )
            
            case 'studentAnalytics':
                return (
                    <StudentWiseAnalytics 
                        onNavigate={handleNavigate} 
                        onBack={handleBack} 
                    />
                )
            
            default:
                return <ResultsOverview onNavigate={handleNavigate} />
        }
    }

    return (
        <div className="w-full min-h-screen">
            {renderCurrentView()}
        </div>
    );
}