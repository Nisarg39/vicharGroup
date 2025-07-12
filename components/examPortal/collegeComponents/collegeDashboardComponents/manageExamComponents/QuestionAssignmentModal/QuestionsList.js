import React from 'react';

export default function QuestionsList({
  loading,
  questions,
  selectedQuestions,
  handleQuestionToggle,
  pagination,
  setPagination,
  handlePageChange
}) {
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
            <div className="space-y-4 pb-4">
              {questions.map((question) => (
                <div
                  key={question._id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                    selectedQuestions.includes(question._id)
                      ? "border-blue-500 bg-blue-50 shadow-sm"
                      : "border-gray-200 hover:border-gray-300 bg-white hover:shadow-sm"
                  }`}
                  onClick={() => handleQuestionToggle(question._id)}
                >
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedQuestions.includes(question._id)}
                      onChange={() => handleQuestionToggle(question._id)}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
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
                        </div>
                        <div className="text-xs text-gray-500 font-medium">{question.topic}</div>
                      </div>

                      <div
                        className="text-sm text-gray-700 mb-3 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: question.question }}
                      />

                      {question.options && question.options.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                          {question.options.map((option, index) => (
                            <div key={index} className="flex items-start space-x-2">
                              <span className="font-medium text-gray-500 mt-0.5">
                                {String.fromCharCode(65 + index)}.
                              </span>
                              <span
                                className="leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: option }}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
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