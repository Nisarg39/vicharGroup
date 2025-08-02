import React, { useState } from 'react';

// Utility to count by subject for assigned questions
function getSubjectCounts(questions) {
  const counts = {};
  questions.forEach(q => {
    if (q.subject) {
      counts[q.subject] = (counts[q.subject] || 0) + 1;
    }
  });
  return counts;
}

export default function QuestionsList({
  loading,
  questions,
  selectedQuestions,
  handleQuestionToggle,
  pagination,
  setPagination,
  handlePageChange,
  allSelectedQuestions = [], // Array of all selected question objects
  totalQuestionsPerSubject = {}, // Object: { subject: count } for all questions in DB (for current filters)
  showSelectedQuestions = false // Whether to show selected questions from other pages
}) {
  const [expandedQuestionId, setExpandedQuestionId] = useState(null);

  const toggleQuestionDetails = (questionId) => {
    setExpandedQuestionId(expandedQuestionId === questionId ? null : questionId);
  };

  // Assigned questions count by subject
  const assignedSubjectCounts = getSubjectCounts(allSelectedQuestions);

  return (
    <div className="w-full bg-white rounded-xl shadow-lg overflow-hidden flex flex-col h-[calc(100vh-120px)] min-h-[600px]">
      {/* Questions list container */}
      <div className="flex-1 overflow-y-auto px-4 min-h-[400px] max-h-[calc(100vh-200px)]">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : questions.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-40 text-center">
            <div className="p-3 bg-gray-100 rounded-full mb-3">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-sm text-gray-600">No questions found with current filters</p>
          </div>
        ) : (
          <>
            {/* Show selected questions that are not in current view - only when showSelectedQuestions is enabled */}
            {showSelectedQuestions && allSelectedQuestions.length > 0 && (
              <>
                {(() => {
                  // Get selected questions that are not in the current page
                  const currentPageQuestionIds = questions.map(q => q._id);
                  const hiddenSelectedQuestions = allSelectedQuestions.filter(
                    q => !currentPageQuestionIds.includes(q._id)
                  );
                  
                  if (hiddenSelectedQuestions.length === 0) return null;
                  
                  return (
                    <div className="mb-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm font-medium text-blue-800">
                            Selected Questions from Other Pages ({hiddenSelectedQuestions.length})
                          </span>
                        </div>
                        <p className="text-xs text-blue-600">
                          These questions are selected but not visible due to current filters or pagination.
                        </p>
                      </div>
                      
                      <div className="space-y-4 mb-4">
                        {hiddenSelectedQuestions.map((question) => {
                          const isExpanded = expandedQuestionId === question._id;
                          return (
                            <div key={`hidden-${question._id}`} className="bg-blue-50 rounded-lg p-4 hover:bg-blue-100 transition-colors">
                              {/* Compact View */}
                              <div 
                                className="flex items-center justify-between cursor-pointer"
                                onClick={() => toggleQuestionDetails(question._id)}
                              >
                                <div className="flex items-center gap-4">
                                  <input
                                    type="checkbox"
                                    checked={true}
                                    onChange={(e) => {
                                      e.stopPropagation();
                                      handleQuestionToggle(question._id);
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                  />
                                  
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
                                  <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                                    Marks: {question.marks}
                                  </span>
                                  <svg 
                                    className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                  </svg>
                                </div>
                              </div>

                              {/* Expanded Details */}
                              {isExpanded && (
                                <div className="mt-4 border-t pt-4">
                                  <div className="bg-white rounded-xl shadow-sm p-4">
                                    <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                                      <div className="bg-white rounded-lg p-3 shadow-sm">
                                        <div className="text-sm font-medium text-gray-700 mb-2">Question</div>
                                        <div dangerouslySetInnerHTML={{ __html: question.question }} />
                                      </div>
                                      
                                      {question.options && question.options.length > 0 && (
                                        <div className="grid grid-cols-2 gap-3">
                                          {question.options.map((option, i) => (
                                            <div key={i} className="bg-white rounded-lg p-3 shadow-sm">
                                              <div className="flex items-center gap-2 mb-2">
                                                <span className={`w-6 h-6 rounded-full ${option === question.answer ? 'bg-green-500' : 'bg-[#1d77bc]'} text-white flex items-center justify-center text-sm`}>
                                                  {String.fromCharCode(65 + i)}
                                                </span>
                                              </div>
                                              <div dangerouslySetInnerHTML={{ __html: option }} />
                                            </div>
                                          ))}
                                        </div>
                                      )}

                                      <div className="bg-white rounded-lg p-3 shadow-sm">
                                        <div className="text-sm font-medium text-green-700 mb-2">
                                          {question.isMultipleAnswer ? 'Correct Answers' : 'Correct Answer'}
                                        </div>
                                        {question.isMultipleAnswer ? (
                                          <div className="flex gap-2">
                                            {question.multipleAnswer && question.multipleAnswer.map((ans, idx) => (
                                              <span key={idx} className="bg-green-100 text-green-800 px-2 py-1 rounded">
                                                Option {ans}
                                              </span>
                                            ))}
                                          </div>
                                        ) : (
                                          <div dangerouslySetInnerHTML={{ __html: question.answer || question.correctAnswer || question.correctOption || question.correct_answer }} />
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </>
            )}

            {/* Current Page Questions */}
            <div className="space-y-4">
              {questions.map((question) => {
                const isExpanded = expandedQuestionId === question._id;
                const isSelected = selectedQuestions.includes(question._id);
                return (
                  <div key={question._id} className={`${isSelected ? 'bg-blue-50' : 'bg-gray-50'} rounded-lg p-4 hover:bg-gray-100 transition-colors`}>
                    {/* Compact View */}
                    <div 
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => toggleQuestionDetails(question._id)}
                    >
                      <div className="flex items-center gap-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleQuestionToggle(question._id);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        
                        <span className={`${isSelected ? 'bg-blue-100 text-blue-800' : 'bg-blue-100 text-blue-800'} text-xs font-medium px-2.5 py-0.5 rounded`}>
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
                          className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="mt-4 border-t pt-4">
                        <div className="bg-white rounded-xl shadow-sm p-4">
                          <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                            <div className="bg-white rounded-lg p-3 shadow-sm">
                              <div className="text-sm font-medium text-gray-700 mb-2">Question</div>
                              <div dangerouslySetInnerHTML={{ __html: question.question }} />
                            </div>
                            
                            {question.options && question.options.length > 0 && (
                              <div className="grid grid-cols-2 gap-3">
                                {question.options.map((option, i) => (
                                  <div key={i} className="bg-white rounded-lg p-3 shadow-sm">
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className={`w-6 h-6 rounded-full ${option === question.answer ? 'bg-green-500' : 'bg-[#1d77bc]'} text-white flex items-center justify-center text-sm`}>
                                        {String.fromCharCode(65 + i)}
                                      </span>
                                    </div>
                                    <div dangerouslySetInnerHTML={{ __html: option }} />
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className="bg-white rounded-lg p-3 shadow-sm">
                              <div className="text-sm font-medium text-green-700 mb-2">
                                {question.isMultipleAnswer ? 'Correct Answers' : 'Correct Answer'}
                              </div>
                              {question.isMultipleAnswer ? (
                                <div className="flex gap-2">
                                  {question.multipleAnswer && question.multipleAnswer.map((ans, idx) => (
                                    <span key={idx} className="bg-green-100 text-green-800 px-2 py-1 rounded">
                                      Option {ans}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <div dangerouslySetInnerHTML={{ __html: question.answer || question.correctAnswer || question.correctOption || question.correct_answer }} />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
      
      {/* Pagination - Always visible at bottom */}
      {pagination.totalPages > 1 && (
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
                        ? 'bg-blue-600 text-white' 
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
      )}
    </div>
  );
}