'use client'
import { useEffect, useState } from 'react'
import AddQuestion from "./AddQuestion"
import QuestionsList from "./QuestionsList"
import TeacherExamManagement from "./TeacherExamManagement"
import { FaQuestion, FaPlus, FaChalkboardTeacher } from 'react-icons/fa'

export default function QuestionsControlHome() {
  const [subjects, setSubjects] = useState([])
  const [activeSection, setActiveSection] = useState('questionsList')

  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin')
    
    if (isAdmin !== "") {
      const data = {
        Physics: true,
        Chemistry: true,
        Biology: true,
        Maths: true,
        Botany: true,
        Zoology: true
      }

      const subjectsList = Object.keys(data).map(subject => ({
        value: subject,
        label: subject
      }))

      setSubjects(subjectsList)
    }
  }, [])

  return (
    <div className="container mx-auto">
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
          className={`${activeSection === 'teacherManagement' ? 'bg-[#9c27b0]' : 'bg-[#9c27b0]/60'} text-white px-6 py-2.5 rounded-lg hover:bg-[#9c27b0]/90 transition-colors duration-200 flex items-center gap-2`}
          onClick={() => setActiveSection('teacherManagement')}
        >
          <FaChalkboardTeacher />
          Teacher Management
        </button>
      </div>

      {activeSection === 'addQuestion' && <AddQuestion subjects={subjects}/>}
      {activeSection === 'questionsList' && <QuestionsList subjects={subjects}/>}
      {activeSection === 'teacherManagement' && <TeacherExamManagement />}
    </div>
  )
}