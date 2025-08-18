import React from 'react';

// Helper to get difficulty counts per subject
function getSubjectDifficultyCounts(questions) {
  const counts = {};
  questions.forEach(q => {
    if (!q.subject) return;
    if (!counts[q.subject]) {
      counts[q.subject] = { Easy: 0, Medium: 0, Hard: 0 };
    }
    const diff = q.difficultyLevel || 'Easy';
    if (counts[q.subject][diff] !== undefined) {
      counts[q.subject][diff] += 1;
    }
  });
  return counts;
}

// Helper to get section counts for JEE exams
function getSectionCounts(questions) {
  const counts = { sectionA: 0, sectionB: 0 };
  questions.forEach(q => {
    if (q.section === 1) {
      counts.sectionA += 1;
    } else if (q.section === 2) {
      counts.sectionB += 1;
    }
  });
  return counts;
}

// For all questions in DB, we need the full question list for current filters
// If you only have counts, you can't break down by difficulty. So we use the 'questions' prop for the current page.
// If you want all questions for all pages, you need to fetch them all.
// For now, we'll show the breakdown for the current page only for 'All Questions in DB'.
export function SubjectStatsBar({ allDbCounts, assignedCounts, allSubjects }) {
  return (
    <div className="w-full overflow-x-auto py-1 bg-white border-b border-gray-100">
      <div className="flex flex-row items-center gap-3 min-w-0 flex-1 overflow-x-auto">
        {allSubjects.map(subject => (
          <div key={subject} className="flex flex-col items-center min-w-[120px]">
            <div className="font-semibold text-xs text-gray-700 truncate max-w-[100px]">{subject}</div>
            <div className="flex flex-row items-center gap-1 text-[11px] mt-0.5">
              {/* All in DB: Easy/Medium/Hard */}
              <span className="inline-block px-1.5 py-0.5 rounded-full bg-green-100 text-green-800 border border-green-200 font-bold">
                {allDbCounts[subject]?.Easy || 0}
              </span>
              <span className="inline-block px-1.5 py-0.5 rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200 font-bold">
                {allDbCounts[subject]?.Medium || 0}
              </span>
              <span className="inline-block px-1.5 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200 font-bold">
                {allDbCounts[subject]?.Hard || 0}
              </span>
              <span className="mx-1 text-gray-400">|</span>
              {/* Assigned: Easy/Medium/Hard */}
              <span className="inline-block px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200 font-bold">
                {assignedCounts[subject]?.Easy || 0}
              </span>
              <span className="inline-block px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200 font-bold">
                {assignedCounts[subject]?.Medium || 0}
              </span>
              <span className="inline-block px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200 font-bold">
                {assignedCounts[subject]?.Hard || 0}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ModalFooter({
  selectedQuestions,
  questions,
  onClose,
  handleAssignQuestions,
  assigning,
  setSelectedQuestions,
  totalQuestionsPerSubject = {},
  allSelectedQuestions = [],
  showSelectedQuestions,
  setShowSelectedQuestions,
  handleSelectAll,
  handleQuestionToggle,
  getSelectedQuestionDetails,
  examSubjects = [],
  calculateTotalMarks,
  examStream,
  exam = null,
  // Scheme-related props
  selectedScheme = null,
  schemeValidation = null,
  schemeMode = false,
}) {
  // For all questions in DB, we need the full question list for current filters
  // Assigned difficulty breakdown
  const assignedCounts = getSubjectDifficultyCounts(allSelectedQuestions);
  
  // Section counts for JEE exams
  const sectionCounts = getSectionCounts(allSelectedQuestions);
  const isJEEExam = examStream === 'JEE' || exam?.stream === 'JEE';

  return (
    <div className="bg-white border-t border-gray-200 shadow-lg">
      <div className="p-2 md:p-3 flex flex-col gap-2">
        {/* 1. Question selection stats at the top (inlined) */}
        <div>
          <div className="px-0 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200/60">
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
                      {calculateTotalMarks ? 
                        calculateTotalMarks(selectedQuestions, allSelectedQuestions, examStream) : 
                        selectedQuestions.reduce((total, questionId) => {
                          const question = allSelectedQuestions.find((q) => q._id === questionId);
                          return total + (question?.marks || 4);
                        }, 0)
                      }
                    </span>
                  </span>
                </div>

                {/* Section counts for JEE exams */}
                {isJEEExam && selectedQuestions.length > 0 && (
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="p-1 bg-blue-500 rounded-full">
                        <span className="w-3 h-3 text-white text-xs font-bold flex items-center justify-center">A</span>
                      </div>
                      <span className="text-sm text-blue-700 font-medium">
                        Section A: <span className="font-bold text-blue-800">{sectionCounts.sectionA}</span>
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="p-1 bg-indigo-500 rounded-full">
                        <span className="w-3 h-3 text-white text-xs font-bold flex items-center justify-center">B</span>
                      </div>
                      <span className="text-sm text-indigo-700 font-medium">
                        Section B: <span className="font-bold text-indigo-800">{sectionCounts.sectionB}</span>
                      </span>
                    </div>
                  </div>
                )}

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
        {/* Divider */}
        <div className="border-t border-gray-100 my-1" />
        {/* Subject stats for all exam subjects */}
        <div className="flex flex-row items-center gap-8 min-w-0 flex-1 overflow-x-auto mb-1">
          {/* Subject stats for all exam subjects */}
          <div className="flex flex-row items-center gap-3">
            {examSubjects.map(subject => (
              <div key={subject} className="flex flex-col items-center min-w-[100px]">
                <div className="font-semibold text-xs text-gray-700 truncate max-w-[80px]">{subject}</div>
                <div className="flex flex-row items-center gap-1 text-[11px] mt-0.5">
                  {/* All in DB: total */}
                  <span className="inline-block px-1.5 py-0.5 rounded-full bg-green-100 text-green-800 border border-green-200 font-bold" title="All questions in DB" aria-label="All in DB">
                    {totalQuestionsPerSubject[subject] || 0}
                  </span>
                  <span className="mx-1 text-gray-400">|</span>
                  {/* Assigned: Easy/Medium/Hard with color-coded badges */}
                  <span className="inline-block px-1.5 py-0.5 rounded-full bg-green-100 text-green-800 border border-green-200 font-bold" title="Assigned Easy" aria-label="Assigned Easy">
                    {assignedCounts[subject]?.Easy || 0}
                  </span>
                  <span className="inline-block px-1.5 py-0.5 rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200 font-bold" title="Assigned Medium" aria-label="Assigned Medium">
                    {assignedCounts[subject]?.Medium || 0}
                  </span>
                  <span className="inline-block px-1.5 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200 font-bold" title="Assigned Hard" aria-label="Assigned Hard">
                    {assignedCounts[subject]?.Hard || 0}
                  </span>
                </div>
              </div>
            ))}
          </div>
          {/* Legend for badge colors, aligned right */}
          <div className="flex flex-row items-center gap-4 ml-auto text-xs text-gray-500">
            <span className="inline-flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-full bg-green-100 border border-green-200 mr-1"></span> All in DB
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-full bg-green-100 border border-green-200 mr-1"></span> Assigned Easy
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-full bg-yellow-100 border border-yellow-200 mr-1"></span> Assigned Medium
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-full bg-red-100 border border-red-200 mr-1"></span> Assigned Hard
            </span>
          </div>
        </div>
        {/* Divider */}
        <div className="border-t border-gray-100 my-1" />

        {/* Scheme Validation Status */}
        {selectedScheme && schemeValidation && (
          <div className="px-2 py-2 bg-gray-50 border border-gray-200 rounded-lg mb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className={`p-1 rounded-full ${schemeValidation.isCompliant ? 'bg-green-500' : 'bg-red-500'}`}>
                    {schemeValidation.isCompliant ? (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-sm font-medium ${schemeValidation.isCompliant ? 'text-green-800' : 'text-red-800'}`}>
                    {selectedScheme.schemeName}: {schemeValidation.isCompliant ? 'Compliant' : 'Non-Compliant'}
                  </span>
                </div>
                <div className="text-xs text-gray-600">
                  {schemeValidation.totalValidation.selected} / {schemeValidation.totalValidation.required} questions
                </div>
              </div>
              {!schemeValidation.isCompliant && (
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-red-600 font-medium">
                    {schemeValidation.subjectValidation.filter(sv => !sv.isCompliant).length} subjects need adjustment
                  </span>
                </div>
              )}
            </div>
            {!schemeValidation.isCompliant && (
              <div className="mt-2 text-xs text-red-700 bg-red-50 p-2 rounded border border-red-200">
                <div className="font-medium mb-1">Issues found:</div>
                {schemeValidation.subjectValidation
                  .filter(sv => !sv.isCompliant)
                  .slice(0, 2) // Show only first 2 issues to save space
                  .map((sv, index) => (
                    <div key={index}>• {sv.subject}: {sv.errors[0]}</div>
                  ))}
                {schemeValidation.subjectValidation.filter(sv => !sv.isCompliant).length > 2 && (
                  <div>• ...and {schemeValidation.subjectValidation.filter(sv => !sv.isCompliant).length - 2} more issues</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 3 & 4. QuickStatsBar and Action Buttons in a single row */}
        <div className="flex flex-row items-center gap-4 w-full overflow-x-auto">
          <QuickStatsBar selectedQuestions={selectedQuestions} questions={questions} />
          <div className="flex flex-wrap items-center gap-2 ml-auto">
            {/* Clear Selection Button */}
            {selectedQuestions.length > 0 && (
              <button
                onClick={() => setSelectedQuestions([])}
                className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 transition-colors duration-200"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear All
              </button>
            )}
            <button
              onClick={onClose}
              className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors duration-200"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel
            </button>
            <button
              onClick={handleAssignQuestions}
              disabled={selectedQuestions.length === 0 || assigning}
              className="inline-flex items-center justify-center px-4 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
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
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Assign {selectedQuestions.length} Question{selectedQuestions.length !== 1 ? "s" : ""}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickStatsBar({ selectedQuestions, questions }) {
  if (!selectedQuestions.length) return null;

  return (
    <div className=" border-gray-100">
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