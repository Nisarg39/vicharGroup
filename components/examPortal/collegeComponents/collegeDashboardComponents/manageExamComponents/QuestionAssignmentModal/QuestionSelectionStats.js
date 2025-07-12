import React from 'react';

// Add the grouping function
const groupQuestionsBySubject = (questions) => {
  return questions.reduce((acc, question) => {
    const subject = question.subject || 'Uncategorized';
    if (!acc[subject]) {
      acc[subject] = [];
    }
    acc[subject].push(question);
    return acc;
  }, {});
};

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
          <button
            onClick={() => setShowSelectedQuestions(!showSelectedQuestions)}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors duration-200 cursor-pointer"
          >
            <div className="p-1 bg-blue-500 rounded-full">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-sm text-blue-700 font-medium">
              Selected: <span className="font-bold text-blue-800">{selectedQuestions.length}</span> questions
            </span>
            <svg
              className={`w-4 h-4 text-blue-600 transition-transform duration-200 ${showSelectedQuestions ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

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

      {/* Selected Questions Preview */}
      {showSelectedQuestions && selectedQuestions.length > 0 && (
        <div className="mt-4 p-4 bg-white rounded-lg border border-blue-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-900">Selected Questions Preview</h4>
            <button onClick={() => setShowSelectedQuestions(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {Object.entries(groupQuestionsBySubject(getSelectedQuestionDetails())).map(([subject, questions]) => (
              <div key={subject} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h5 className="text-sm font-medium text-gray-800 bg-gray-100 px-3 py-1 rounded-full">
                    {subject} ({questions.length})
                  </h5>
                  <span className="text-xs text-gray-500">
                    Total Marks: {questions.reduce((sum, q) => sum + (q.marks || 0), 0)}
                  </span>
                </div>
                
                {questions.map((question) => (
                  <div key={question._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
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
                      </div>
                      <div className="text-xs text-gray-600 truncate" dangerouslySetInnerHTML={{__html: question.question.substring(0, 100) + "..."}} />
                      <div className="text-xs text-gray-500 mt-1">{question.topic}</div>
                    </div>

                    <button
                      onClick={() => handleQuestionToggle(question._id)}
                      className="ml-3 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      title="Remove from selection"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {selectedQuestions.length > getSelectedQuestionDetails().length && (
            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-700">
                <span className="font-medium">{selectedQuestions.length - getSelectedQuestionDetails().length}</span> selected questions are not visible in current page/filters.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}