'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { getTopics } from '../../../../../utils/examUtils/subject_Details'
import { showQuestionsList, deleteExamQuestion } from '../../../../../server_actions/actions/adminActions'
import AddQuestion from './AddQuestion'

export default function QuestionsList({ subjects }) {
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState(null)
  const [formData, setFormData] = useState({
    stream: '',
    subject: '',
    standard: '',
    section: '',
    topic: '',
    page: 1,
    limit: 10,
    difficultyLevel: '',
    searchTerm: ''
  })
  const [topics, setTopics] = useState([])
  const [questions, setQuestions] = useState([])
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalQuestions: 0,
    questionsPerPage: 10
  })
  const [expandedQuestionId, setExpandedQuestionId] = useState(null)
  const [isTeacher, setIsTeacher] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const debounceTimeoutRef = useRef(null)

  useEffect(() => {
    const teacherStatus = localStorage.getItem("isTeacher")
    if(teacherStatus !== null){
        setIsTeacher(true)
    }
  }, [])

  // Debounced search function
  const debouncedSearch = useCallback((searchValue) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      setFormData(prev => ({
        ...prev,
        searchTerm: searchValue,
        page: 1 // Reset to first page when searching
      }))
    }, 300) // 300ms debounce delay
  }, [])

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchInput(value)
    debouncedSearch(value)
  }

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [])

  // Add this function right after your state declarations
  const handleEditQuestion = (question) => {
    setSelectedQuestion(question)
    setShowEditModal(true)
  }

  const toggleQuestionDetails = (questionId) => {
    setExpandedQuestionId(expandedQuestionId === questionId ? null : questionId)
  }

  // Add refreshQuestions function definition
  const refreshQuestions = async () => {
    const response = await showQuestionsList(formData)
    if (response.success) {
      setQuestions(response.questions)
      setPagination(response.pagination)
    }
  }

  useEffect(() => {
    refreshQuestions()
  }, [formData])

  useEffect(() => {
    const { stream, subject, standard } = formData
    if (stream && subject && standard) {
      let topicsData = getTopics(stream, subject, standard)
      
      // If no topics returned, provide default JEE topics structure
      if (!topicsData && stream === 'JEE') {
        topicsData = {
          'Kinematics': 1,
          'Laws of Motion': 2,
          'Work, Energy and Power': 3,
          'Rotational Motion': 4,
          'Gravitation': 5,
          'Properties of Solids and Liquids': 6,
          'Thermodynamics': 7,
          'Kinetic Theory of Gases': 8,
          'Oscillations and Waves': 9,
          'Electrostatics': 10,
          'Current Electricity': 11,
          'Magnetic Effects of Current': 12,
          'Magnetism and Matter': 13,
          'Electromagnetic Induction': 14,
          'Alternating Current': 15,
          'Electromagnetic Waves': 16,
          'Optics': 17,
          'Dual Nature of Matter and Radiation': 18,
          'Atoms and Nuclei': 19,
          'Electronic Devices': 20
        }
      }
      
      const topicsArray = Object.entries(topicsData || {})
      setTopics(topicsArray)
    } else {
      setTopics([])
    }
  }, [formData.stream, formData.subject, formData.standard])

  // Clear dependent fields when parent selection changes
  const handleStreamChange = (e) => {
    setSearchInput('') // Clear search input
    setFormData({
      ...formData,
      stream: e.target.value,
      subject: isTeacher ? formData.subject : '',
      standard: '',
      section: '',
      topic: '',
      searchTerm: '' // Clear search term
    })
  }

  const handleSubjectChange = (e) => {
    setSearchInput('') // Clear search input
    setFormData({
      ...formData,
      subject: e.target.value,
      standard: '',
      section: '',
      topic: '',
      searchTerm: '' // Clear search term
    })
  }

  const handleStandardChange = (e) => {
    setSearchInput('') // Clear search input
    setFormData({
      ...formData,
      standard: e.target.value,
      section: '',
      topic: '',
      searchTerm: '' // Clear search term
    })
  }

  const handlePageChange = (newPage) => {
    setFormData(prev => ({
      ...prev,
      page: newPage
    }))
  }

  // Add this useEffect to set initial values when component mounts
  useEffect(() => {
    if (subjects && subjects.length > 0) {
      const defaultStream = 'JEE' // Or any default stream you prefer
      const defaultSubject = subjects[0].value
      const defaultStandard = '11'
      
      setFormData(prev => ({
        ...prev,
        stream: defaultStream,
        subject: defaultSubject, 
        standard: defaultStandard
      }))
    }
  }, [subjects]) // Only runs when subjects prop changes

  const handleDeleteQuestion = async (questionId) => {
    if (window.confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
      const response = await deleteExamQuestion(questionId)
      if (response?.success) {
        refreshQuestions()
      }
    }
  }

  return (
    <div className="w-full bg-white rounded-xl shadow-lg overflow-hidden flex flex-col h-[calc(100vh-120px)] min-h-[600px]">
      {/* Header */}
      <div className="p-6 border-b">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#2c9652]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Questions List
        </h1>
      </div>

      {/* Search and Filter Section */}
      <div className="p-4 space-y-4">
        {/* Search Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchInput}
            onChange={handleSearchChange}
            placeholder="Search questions by content, options, answer, or question number..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#2c9652] focus:border-transparent placeholder-gray-400"
          />
          {searchInput && (
            <button
              onClick={() => {
                setSearchInput('')
                setFormData(prev => ({ ...prev, searchTerm: '', page: 1 }))
              }}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        
        {/* Filter Dropdowns */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <select 
          value={formData.stream}
          onChange={handleStreamChange}
          className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#2c9652] focus:border-transparent"
        >
          <option value="">Stream</option>
          <option value="NEET">NEET</option>
          <option value="JEE">JEE</option>
          <option value="MHT-CET">MHT-CET</option>
        </select>

        <select 
          value={formData.subject}
          onChange={handleSubjectChange}
          className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#2c9652] focus:border-transparent"
          disabled={isTeacher}
        >
          <option value="">Select Subject</option>
          {subjects && subjects.length > 0 && subjects.map((subject) => (
            <option key={subject.value} value={subject.value}>
              {subject.label}
            </option>
          ))}
        </select>

        <select 
          value={formData.standard}
          onChange={handleStandardChange}
          className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#2c9652] focus:border-transparent"
          disabled={!formData.subject}
        >
          <option value="">Select Standard</option>
          <option value="11">11th</option>
          <option value="12">12th</option>
        </select>

        {formData.stream !== 'MHT-CET' && formData.stream !== 'NEET' && formData.stream && (
          <select
            value={formData.section}
            onChange={(e) => setFormData({...formData, section: e.target.value})}
            className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#2c9652] focus:border-transparent"
          >
            <option value="">Select Section</option>
            <option value="1">Section A</option>
            <option value="2">Section B</option>
          </select>
        )}

        <select 
          value={formData.topic}
          onChange={(e) => setFormData({...formData, topic: e.target.value})}
          className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#2c9652] focus:border-transparent"
          disabled={!topics.length}
        >
          <option value="">Select Topic</option>
          {topics.map(([topic, id]) => (
            <option key={id} value={id}>
              {topic}
            </option>
          ))}
        </select>

        <select 
          value={formData.difficultyLevel}
          onChange={(e) => setFormData({...formData, difficultyLevel: e.target.value})}
          className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#2c9652] focus:border-transparent"
        >
          <option value="">All Difficulties</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
        </div>
      </div>

      {/* Questions List */}
      <div className="flex-1 overflow-y-auto px-4 min-h-[400px] max-h-[calc(100vh-320px)]">
        <div className="space-y-4">
          {questions.map((question) => (
            <div key={question._id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
              {/* Compact View */}
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleQuestionDetails(question._id)}
              >
                <div className="flex items-center gap-4">
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    Q{question.questionNumber}
                  </span>
                  
                  {/* Add Question Type Badge */}
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${
                    question.isMultipleAnswer 
                      ? 'bg-purple-100 text-purple-800'
                      : question.userInputAnswer
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {question.isMultipleAnswer 
                      ? 'Multiple Correct'
                      : question.userInputAnswer
                      ? 'User Input'
                      : 'Single Choice'}
                  </span>

                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${
                    question.difficultyLevel === 'Hard' 
                      ? 'bg-red-100 text-red-800'
                      : question.difficultyLevel === 'Medium'
                      ? 'bg-yellow-100 text-yellow-800'  
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {question.difficultyLevel}
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-700" style={{overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", lineHeight: "1.4em", maxHeight: "2.8em"}}>
                      <div dangerouslySetInnerHTML={{ __html: question.question }} />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    Marks: {question.marks}
                  </span>
                  <svg 
                    className={`w-5 h-5 transition-transform ${expandedQuestionId === question._id ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedQuestionId === question._id && (
                <div className="mt-4 border-t pt-4">
                  <div className="bg-white rounded-xl shadow-sm p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {isTeacher && (
                          <button 
                            onClick={() => handleEditQuestion(question)}
                            className="flex items-center gap-1 text-[#2c9652] hover:text-[#217a3d] transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <span className="text-xs font-medium">Edit</span>
                          </button>
                        )}

                        {!isTeacher && (
                          <>
                            <button 
                              onClick={() => handleEditQuestion(question)}
                              className="flex items-center gap-1 text-[#2c9652] hover:text-[#217a3d] transition-colors"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              <span className="text-xs font-medium">Edit</span>
                            </button>

                            <button 
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteQuestion(question._id)
                              }}
                              className="flex items-center gap-1 text-red-500 hover:text-red-700 transition-colors"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              <span className="text-xs font-medium">Delete</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                      <div className="bg-white rounded-lg p-3 shadow-sm">
                        <div className="text-sm font-medium text-gray-700 mb-2">Question</div>
                        <div dangerouslySetInnerHTML={{ __html: question.question }} />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        {question.options.map((option, i) => (
                          <div key={i} className="bg-white rounded-lg p-3 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`w-6 h-6 rounded-full ${option === question.answer ? 'bg-green-500' : 'bg-[#1d77bc]'} text-white flex items-center justify-center text-sm`}>
                                {String.fromCharCode(65 + i)}
                              </span>
                            </div>
                            <div 
                              className=""
                                                            dangerouslySetInnerHTML={{ __html: option }} 
                            />
                          </div>
                        ))}
                      </div>

                      <div className="bg-white rounded-lg p-3 shadow-sm">
                        <div className="text-sm font-medium text-green-700 mb-2">
                          {question.isMultipleAnswer ? 'Correct Answers' : 'Correct Answer'}
                        </div>
                        {question.isMultipleAnswer ? (
                          <div className="flex gap-2">
                            {question.multipleAnswer.map((ans, idx) => (
                              <span key={idx} className="bg-green-100 text-green-800 px-2 py-1 rounded">
                                Option {ans}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <div dangerouslySetInnerHTML={{ __html: question.answer }} />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Pagination (now outside scrollable area) */}
      <div className="flex flex-col items-center mt-4">
        <div className="flex justify-center items-center gap-2 flex-wrap">
          <button
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
            className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
          >
            Previous
          </button>
          {pagination.currentPage > 3 && (
            <>
              <button
                onClick={() => handlePageChange(1)}
                className="px-3 py-1 rounded bg-gray-200"
              >
                1
              </button>
              <span className="px-2">...</span>
            </>
          )}
          {[...Array(5)].map((_, i) => {
            const pageNum = pagination.currentPage - 2 + i
            if (pageNum > 0 && pageNum <= pagination.totalPages) {
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-3 py-1 rounded ${
                    pagination.currentPage === pageNum 
                      ? 'bg-[#2c9652] text-white' 
                      : 'bg-gray-200'
                  }`}
                >
                  {pageNum}
                </button>
              )
            }
            return null
          })}
          {pagination.currentPage < pagination.totalPages - 2 && (
            <>
              <span className="px-2">...</span>
              <button
                onClick={() => handlePageChange(pagination.totalPages)}
                className="px-3 py-1 rounded bg-gray-200"
              >
                {pagination.totalPages}
              </button>
            </>
          )}
          <button
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
            className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
          >
            Next
          </button>
        </div>
        <div className="text-center text-sm text-gray-500 mt-2">
          Showing {((pagination.currentPage - 1) * pagination.questionsPerPage) + 1} to {Math.min(pagination.currentPage * pagination.questionsPerPage, pagination.totalQuestions)} of {pagination.totalQuestions} questions
        </div>
      </div>

      {/* Add Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center">
          <div className="bg-white rounded-xl w-[95%] max-w-7xl max-h-[90vh] overflow-y-auto relative z-[10000]">
            <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-[10001]">
              <h2 className="text-xl font-semibold">{selectedQuestion ? 'Update Question' : 'Add Question'}</h2>
              <button onClick={() => setShowEditModal(false)} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <AddQuestion 
                subjects={subjects} 
                questionToEdit={selectedQuestion}
                onClose={() => {
                  setShowEditModal(false);
                  setSelectedQuestion(null);
                }}
                onUpdate={() => {
                  refreshQuestions();
                  setShowEditModal(false);
                  setSelectedQuestion(null);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}