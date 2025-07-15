import React, { useState } from 'react';

export default function QuestionsList({
  loading,
  questions,
  selectedQuestions,
  handleQuestionToggle,
  pagination,
  setPagination,
  handlePageChange,
  allSelectedQuestions = [], // Array of all selected question objects
  showSelectedQuestions = false // Whether to show selected questions from other pages
}) {
  const [expandedQuestions, setExpandedQuestions] = useState(new Set());

  const toggleExpanded = (questionId) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(questionId)) {
      newExpanded.delete(questionId);
    } else {
      newExpanded.add(questionId);
    }
    setExpandedQuestions(newExpanded);
  };
  return (
    <div className="flex flex-col flex-1 overflow-hidden h-full">
      {/* Questions list container */}
      <div className="flex-1 overflow-y-auto max-h-[calc(100vh-200px)]">
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
                      
                      <div className="space-y-2 mb-4">
                        {hiddenSelectedQuestions.map((question) => {
                          const isExpanded = expandedQuestions.has(question._id);
                          return (
                            <div
                              key={`hidden-${question._id}`}
                              className="border border-blue-300 bg-blue-50 rounded-lg transition-all duration-200 shadow-sm"
                            >
                              {/* Compact Header for Hidden Selected Questions */}
                              <div 
                                className="flex items-center justify-between p-3 cursor-pointer hover:bg-blue-100 transition-colors"
                                onClick={() => toggleExpanded(question._id)}
                              >
                                <div className="flex items-center space-x-3 flex-1">
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
                                  
                                  <div className="flex items-center space-x-2 flex-1">
                                    <span className="text-sm font-medium text-blue-900">Q{question.questionNumber}</span>
                                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                                      question.difficultyLevel === "Easy" ? "bg-green-100 text-green-800" :
                                      question.difficultyLevel === "Medium" ? "bg-yellow-100 text-yellow-800" :
                                      "bg-red-100 text-red-800"
                                    }`}>
                                      {question.difficultyLevel}
                                    </span>
                                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                                      {question.marks} marks
                                    </span>
                                    {question.questionType && (
                                      <span className="text-xs text-purple-700 bg-purple-100 px-2 py-1 rounded-full">
                                        {question.questionType}
                                      </span>
                                    )}
                                    
                                    {/* Question Preview */}
                                    <div className="flex-1 min-w-0">
                                      <div 
                                        className="text-sm text-blue-800 overflow-hidden"
                                        style={{
                                          display: '-webkit-box',
                                          WebkitLineClamp: 2,
                                          WebkitBoxOrient: 'vertical',
                                          maxHeight: '2.5rem'
                                        }}
                                        dangerouslySetInnerHTML={{ __html: question.question }}
                                      />
                                    </div>
                                    
                                    <span className="text-xs text-blue-600 font-medium">{question.topic}</span>
                                  </div>
                                </div>
                                
                                {/* Visual Indicator */}
                                <div className="ml-3 p-1">
                                  <svg 
                                    className={`w-4 h-4 text-blue-500 transition-transform duration-200 ${
                                      isExpanded ? 'rotate-180' : ''
                                    }`} 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </div>
                              </div>

                              {/* Expanded Content for Hidden Questions */}
                              {isExpanded && (
                                <div className="px-3 pb-3 border-t border-blue-200">
                                  <div className="pt-3">
                                    {/* Full Question */}
                                    <div className="mb-4">
                                      <h4 className="text-sm font-medium text-blue-900 mb-2">Question:</h4>
                                      <div
                                        className="text-sm text-blue-800 leading-relaxed"
                                        dangerouslySetInnerHTML={{ __html: question.question }}
                                      />
                                    </div>

                                    {/* Options */}
                                    {question.options && question.options.length > 0 && (
                                      <div className="mb-4">
                                        <h4 className="text-sm font-medium text-blue-900 mb-2">Options:</h4>
                                        <div className="grid grid-cols-1 gap-2">
                                          {question.options.map((option, index) => (
                                            <div key={index} className="flex items-start space-x-2 p-2 bg-blue-100 rounded">
                                              <span className="font-medium text-blue-700 mt-0.5 min-w-[20px]">
                                                {String.fromCharCode(65 + index)}.
                                              </span>
                                              <span
                                                className="text-sm text-blue-800 leading-relaxed"
                                                dangerouslySetInnerHTML={{ __html: option }}
                                              />
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Correct Answer */}
                                    {(question.correctAnswer || question.answer || question.correctOption || question.correct_answer) && (
                                      <div className="mb-4">
                                        <h4 className="text-sm font-medium text-blue-900 mb-2">Correct Answer:</h4>
                                        <div className="p-3 bg-green-50 border border-green-200 rounded">
                                          {question.options && ['A', 'B', 'C', 'D'].includes(question.correctAnswer || question.answer || question.correctOption || question.correct_answer) ? (
                                            <div className="text-sm text-green-800">
                                              <strong>{question.correctAnswer || question.answer || question.correctOption || question.correct_answer}:</strong>{' '}
                                              <span dangerouslySetInnerHTML={{ 
                                                __html: question.options[['A', 'B', 'C', 'D'].indexOf(question.correctAnswer || question.answer || question.correctOption || question.correct_answer)] 
                                              }} />
                                            </div>
                                          ) : (
                                            <span className="text-sm font-medium text-green-800">
                                              {question.correctAnswer || question.answer || question.correctOption || question.correct_answer}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    )}

                                    {/* Explanation */}
                                    {question.explanation && (
                                      <div>
                                        <h4 className="text-sm font-medium text-blue-900 mb-2">Explanation:</h4>
                                        <div 
                                          className="text-sm text-blue-800 leading-relaxed p-2 bg-blue-100 border border-blue-300 rounded"
                                          dangerouslySetInnerHTML={{ __html: question.explanation }}
                                        />
                                      </div>
                                    )}
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
            <div className="space-y-2 pb-4">
              {questions.map((question) => {
                const isExpanded = expandedQuestions.has(question._id);
                return (
                  <div
                    key={question._id}
                    className={`border rounded-lg transition-all duration-200 ${
                      selectedQuestions.includes(question._id)
                        ? "border-gray-200 bg-blue-50 shadow-sm"
                        : "border-gray-200 hover:border-gray-300 bg-white hover:shadow-sm"
                    }`}
                  >
                    {/* Compact Header - Always Visible */}
                    <div 
                      className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => toggleExpanded(question._id)}
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        <input
                          type="checkbox"
                          checked={selectedQuestions.includes(question._id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleQuestionToggle(question._id);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        
                        <div className="flex items-center space-x-2 flex-1">
                          <span className="text-sm font-medium text-gray-900">Q{question.questionNumber}</span>
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                            question.difficultyLevel === "Easy" ? "bg-green-100 text-green-800" :
                            question.difficultyLevel === "Medium" ? "bg-yellow-100 text-yellow-800" :
                            "bg-red-100 text-red-800"
                          }`}>
                            {question.difficultyLevel}
                          </span>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            {question.marks} marks
                          </span>
                          {question.questionType && (
                            <span className="text-xs text-purple-700 bg-purple-100 px-2 py-1 rounded-full">
                              {question.questionType}
                            </span>
                          )}
                          
                          {/* Full Question in Contracted Mode */}
                          <div className="flex-1 min-w-0">
                            <div 
                              className="text-sm text-gray-700 overflow-hidden"
                              style={{
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                maxHeight: '2.5rem'
                              }}
                              dangerouslySetInnerHTML={{ __html: question.question }}
                            />
                          </div>
                          
                          <span className="text-xs text-gray-500 font-medium">{question.topic}</span>
                        </div>
                      </div>
                      
                      {/* Visual Indicator for Expand/Collapse */}
                      <div className="ml-3 p-1">
                        <svg 
                          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                            isExpanded ? 'rotate-180' : ''
                          }`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="px-3 pb-3 border-t border-gray-100">
                        <div className="pt-3">
                          {/* Full Question */}
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Question:</h4>
                            <div
                              className="text-sm text-gray-700 leading-relaxed"
                              dangerouslySetInnerHTML={{ __html: question.question }}
                            />
                          </div>

                          {/* Options */}
                          {question.options && question.options.length > 0 && (
                            <div className="mb-4">
                              <h4 className="text-sm font-medium text-gray-900 mb-2">Options:</h4>
                              <div className="grid grid-cols-1 gap-2">
                                {question.options.map((option, index) => (
                                  <div key={index} className="flex items-start space-x-2 p-2 bg-gray-50 rounded">
                                    <span className="font-medium text-gray-600 mt-0.5 min-w-[20px]">
                                      {String.fromCharCode(65 + index)}.
                                    </span>
                                    <span
                                      className="text-sm text-gray-700 leading-relaxed"
                                      dangerouslySetInnerHTML={{ __html: option }}
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Correct Answer */}
                          {(question.correctAnswer || question.answer || question.correctOption || question.correct_answer) && (
                            <div className="mb-4">
                              <h4 className="text-sm font-medium text-gray-900 mb-2">Correct Answer:</h4>
                              <div className="p-3 bg-green-50 border border-green-200 rounded">
                                {/* Show option with its value if it's a letter option */}
                                {question.options && ['A', 'B', 'C', 'D'].includes(question.correctAnswer || question.answer || question.correctOption || question.correct_answer) ? (
                                  <div className="text-sm text-green-800">
                                    <strong>{question.correctAnswer || question.answer || question.correctOption || question.correct_answer}:</strong>{' '}
                                    <span dangerouslySetInnerHTML={{ 
                                      __html: question.options[['A', 'B', 'C', 'D'].indexOf(question.correctAnswer || question.answer || question.correctOption || question.correct_answer)] 
                                    }} />
                                  </div>
                                ) : (
                                  <span className="text-sm font-medium text-green-800">
                                    {question.correctAnswer || question.answer || question.correctOption || question.correct_answer}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Debug info - remove this once you confirm the correct field name */}
                          {!question.correctAnswer && !question.answer && !question.correctOption && !question.correct_answer && (
                            <div className="mb-4">
                              <h4 className="text-sm font-medium text-gray-900 mb-2">Available Answer Fields (Debug):</h4>
                              <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                                {Object.keys(question).filter(key => key.toLowerCase().includes('answer') || key.toLowerCase().includes('correct')).map(key => (
                                  <div key={key}>{key}: {question[key]}</div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Explanation (if available) */}
                          {question.explanation && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 mb-2">Explanation:</h4>
                              <div 
                                className="text-sm text-gray-700 leading-relaxed p-2 bg-blue-50 border border-blue-200 rounded"
                                dangerouslySetInnerHTML={{ __html: question.explanation }}
                              />
                            </div>
                          )}
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
        <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
          <div className="flex items-center">
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{(pagination.currentPage - 1) * pagination.questionsPerPage + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(pagination.currentPage * pagination.questionsPerPage, pagination.totalQuestions)}
              </span>{' '}
              of <span className="font-medium">{pagination.totalQuestions}</span> questions
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            
            {/* Page Numbers */}
            <div className="hidden md:flex space-x-1">
              {(() => {
                const pageNumbers = [];
                const totalPages = pagination.totalPages;
                const currentPage = pagination.currentPage;
                
                // Always show first page
                pageNumbers.push(1);
                
                // Calculate range around current page
                let start = Math.max(2, currentPage - 2);
                let end = Math.min(totalPages - 1, currentPage + 2);
                
                // Add ellipsis after first page if needed
                if (start > 2) {
                  pageNumbers.push('...');
                }
                
                // Add pages around current page
                for (let i = start; i <= end; i++) {
                  pageNumbers.push(i);
                }
                
                // Add ellipsis before last page if needed
                if (end < totalPages - 1) {
                  pageNumbers.push('...');
                }
                
                // Always show last page if more than 1 page
                if (totalPages > 1) {
                  pageNumbers.push(totalPages);
                }
                
                return pageNumbers.map((pageNum, index) => 
                  pageNum === '...' ? (
                    <span key={`ellipsis-${index}`} className="px-3 py-1">...</span>
                  ) : (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1 text-sm font-medium rounded-md ${
                        pagination.currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                );
              })()}
            </div>
            
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}