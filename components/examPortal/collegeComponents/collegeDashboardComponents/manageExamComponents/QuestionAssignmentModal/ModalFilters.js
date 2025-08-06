import React from 'react';
import { getTopics } from '../../../../../../utils/examUtils/subject_Details';

export default function ModalFilters({ exam, filters, handleFilterChange }) {
  // Get topics based on current filters
  const topics = getTopics(exam?.stream, filters.subject, filters.standard);

  return (
    <div className="p-4 h-full">
      <div className="flex items-center space-x-2 mb-4">
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        <span className="text-base font-semibold text-gray-800">Filters</span>
      </div>

      <div className="space-y-4">
        {/* Stream Label */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Stream</label>
          <div className="w-full px-3 py-2 text-sm bg-gray-100 border border-gray-200 rounded-lg text-gray-700 font-medium">
            {exam?.stream || "Not specified"}
          </div>
        </div>

        {/* Subject Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
          <select
            value={filters.subject}
            onChange={(e) => handleFilterChange("subject", e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="">All Subjects</option>
            {exam?.examSubject?.map((subject) => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
        </div>

        {/* Standard - Read Only */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Standard</label>
          <div className="w-full px-3 py-2 text-sm bg-gray-100 border border-gray-200 rounded-lg text-gray-700 font-medium">
            {exam?.standard ? `${exam.standard}th` : "Not specified"}
          </div>
        </div>

        {/* Topic Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
          <select
            value={filters.topic}
            onChange={(e) => handleFilterChange("topic", e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
            disabled={!filters.stream || !filters.subject || !filters.standard}
          >
            <option value="">All Topics</option>
            {Object.entries(topics || {}).sort(([a], [b]) => a.localeCompare(b)).map(([topic, id]) => (
              <option key={id} value={id}>
                {topic}
              </option>
            ))}
          </select>
        </div>

        {/* Difficulty Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
          <select
            value={filters.difficultyLevel}
            onChange={(e) => handleFilterChange("difficultyLevel", e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="">All Levels</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        {/* Section Filter - only show for JEE stream which has Section A and Section B */}
        {filters.stream === "JEE" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Section</label>
            <select
              value={filters.section}
              onChange={(e) => handleFilterChange("section", e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">All Sections</option>
              <option value="Section A">Section A</option>
              <option value="Section B">Section B</option>
            </select>
          </div>
        )}

        {/* Question Type Filter - show different options based on exam stream */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
          <select
            value={filters.questionType}
            onChange={(e) => handleFilterChange("questionType", e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="">All Types</option>
            <option value="MCSA">MCSA</option>
            <option value="MCMA">MCMA</option>
            {/* Numerical questions are primarily for JEE */}
            {filters.stream === "JEE" && (
              <option value="numerical">Numerical</option>
            )}
          </select>
        </div>

        {/* Marks Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Marks</label>
          <select
            value={filters.marks}
            onChange={(e) => handleFilterChange("marks", e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="">All Marks</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
          </select>
        </div>
      </div>
    </div>
  );
}