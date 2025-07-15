import React from 'react';

export default function QuestionSelectionStats({
  showSelectedQuestions,
  setShowSelectedQuestions,
  selectedQuestions,
  questions,
  handleSelectAll,
  handleQuestionToggle,
  getSelectedQuestionDetails
}) {
  return (
    <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200/60">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSelectedQuestions(!showSelectedQuestions)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 cursor-pointer ${
                showSelectedQuestions 
                  ? "bg-blue-200 hover:bg-blue-300" 
                  : "bg-blue-100 hover:bg-blue-200"
              }`}
            >
              <div className="p-1 bg-blue-500 rounded-full">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-sm text-blue-700 font-medium">
                Selected: <span className="font-bold text-blue-800">{selectedQuestions.length}</span> questions
              </span>
              <div className={`p-1 rounded-full transition-colors ${
                showSelectedQuestions ? "bg-blue-600" : "bg-blue-500"
              }`}>
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={
                    showSelectedQuestions 
                      ? "M4 6h16M4 10h16M4 14h16M4 18h16" 
                      : "M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  } />
                </svg>
              </div>
              <span className="text-xs text-blue-600 font-medium">
                {showSelectedQuestions ? "Show All" : "Sort Selected"}
              </span>
            </button>
            
            {/* Clear selected filter button */}
            {showSelectedQuestions && (
              <button
                onClick={() => setShowSelectedQuestions(false)}
                className="flex items-center space-x-1 px-2 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                title="Turn off selected filter"
              >
                <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="text-xs text-gray-600 font-medium">Clear Filter</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <div className="p-1 bg-green-500 rounded-full">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-sm text-green-700 font-medium">
              Total Marks: <span className="font-bold text-green-800">
                {selectedQuestions.reduce((total, questionId) => {
                  const question = questions.find((q) => q._id === questionId);
                  return total + (question?.marks || 4);
                }, 0)}
              </span>
            </span>
          </div>

          {questions.length > 0 && (
            <div className="flex items-center space-x-2">
              <div className="p-1 bg-purple-500 rounded-full">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-sm text-purple-700 font-medium">
                Available: <span className="font-bold text-purple-800">{questions.length}</span>
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {questions.length > 0 && (
            <div className="text-xs text-gray-500 bg-white px-2 py-1 rounded-md border">
              {Math.round((selectedQuestions.length / questions.length) * 100)}% selected
            </div>
          )}

          <button
            onClick={handleSelectAll}
            className="inline-flex items-center space-x-1 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-colors duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={selectedQuestions.length === questions.length ? "M6 18L18 6M6 6l12 12" : "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"}
              />
            </svg>
            <span>{selectedQuestions.length === questions.length ? "Deselect All" : "Select All"}</span>
          </button>
        </div>
      </div>

      {/* Sorting indicator */}
      {showSelectedQuestions && (
        <div className="mt-3 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
            <span className="text-sm text-blue-700 font-medium">
              Questions sorted: Selected questions appear first
            </span>
          </div>
        </div>
      )}
    </div>
  );
}