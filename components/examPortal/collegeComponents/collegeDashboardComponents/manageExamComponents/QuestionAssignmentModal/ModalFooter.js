import React from 'react';

export default function ModalFooter({
  selectedQuestions,
  questions,
  onClose,
  handleAssignQuestions,
  assigning,
  setSelectedQuestions
}) {
  return (
    <div className="bg-white border-t border-gray-200 shadow-lg">
      <div className="p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Selection Summary */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-blue-100 rounded-full">
                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-700">
                <span className="font-bold text-blue-600">{selectedQuestions.length}</span> questions selected
              </span>
            </div>

            {selectedQuestions.length > 0 && (
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-green-100 rounded-full">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  Total: <span className="font-bold text-green-600">
                    {selectedQuestions.reduce((total, questionId) => {
                      const question = questions.find((q) => q._id === questionId);
                      return total + (question?.marks || 4);
                    }, 0)}
                  </span> marks
                </span>
              </div>
            )}

            {/* Progress indicator */}
            {questions.length > 0 && selectedQuestions.length > 0 && (
              <div className="hidden md:flex items-center space-x-2">
                <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
                    style={{
                      width: `${Math.min((selectedQuestions.length / questions.length) * 100, 100)}%`,
                    }}
                  ></div>
                </div>
                <span className="text-xs text-gray-500 font-medium">
                  {Math.round((selectedQuestions.length / questions.length) * 100)}%
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            {/* Clear Selection Button */}
            {selectedQuestions.length > 0 && (
              <button
                onClick={() => setSelectedQuestions([])}
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 transition-colors duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear All
              </button>
            )}

            {/* Cancel Button */}
            <button
              onClick={onClose}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel
            </button>

            {/* Assign Questions Button */}
            <button
              onClick={handleAssignQuestions}
              disabled={selectedQuestions.length === 0 || assigning}
              className="inline-flex items-center justify-center px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
            >
              {assigning ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Assigning...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Assign {selectedQuestions.length} Question{selectedQuestions.length !== 1 ? "s" : ""}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <QuickStatsBar selectedQuestions={selectedQuestions} questions={questions} />
      </div>
    </div>
  );
}

function QuickStatsBar({ selectedQuestions, questions }) {
  if (!selectedQuestions.length) return null;

  return (
    <div className="mt-4 pt-4 border-t border-gray-100">
      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
        <DifficultyStats selectedQuestions={selectedQuestions} questions={questions} />
        <QuestionTypeStats selectedQuestions={selectedQuestions} questions={questions} />
      </div>
    </div>
  );
}

function DifficultyStats({ selectedQuestions, questions }) {
  return (
    <>
      <div className="flex items-center space-x-1">
        <span className="w-2 h-2 bg-green-400 rounded-full"></span>
        <span>
          Easy: {selectedQuestions.filter(id => {
            const q = questions.find(question => question._id === id);
            return q?.difficultyLevel === "Easy";
          }).length}
        </span>
      </div>
      <div className="flex items-center space-x-1">
        <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
        <span>
          Medium: {selectedQuestions.filter(id => {
            const q = questions.find(question => question._id === id);
            return q?.difficultyLevel === "Medium";
          }).length}
        </span>
      </div>
      <div className="flex items-center space-x-1">
        <span className="w-2 h-2 bg-red-400 rounded-full"></span>
        <span>
          Hard: {selectedQuestions.filter(id => {
            const q = questions.find(question => question._id === id);
            return q?.difficultyLevel === "Hard";
          }).length}
        </span>
      </div>
    </>
  );
}

function QuestionTypeStats({ selectedQuestions, questions }) {
  return (
    <div className="hidden sm:flex items-center space-x-4 ml-4 pl-4 border-l border-gray-200">
      <div className="flex items-center space-x-1">
        <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
        <span>
          MCSA: {selectedQuestions.filter(id => {
            const q = questions.find(question => question._id === id);
            return q?.questionType === "MCSA";
          }).length}
        </span>
      </div>
      <div className="flex items-center space-x-1">
        <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
        <span>
          MCMA: {selectedQuestions.filter(id => {
            const q = questions.find(question => question._id === id);
            return q?.questionType === "MCMA";
          }).length}
        </span>
      </div>
      <div className="flex items-center space-x-1">
        <span className="w-2 h-2 bg-indigo-400 rounded-full"></span>
        <span>
          Numerical: {selectedQuestions.filter(id => {
            const q = questions.find(question => question._id === id);
            return q?.questionType === "numerical";
          }).length}
        </span>
      </div>
    </div>
  );
}