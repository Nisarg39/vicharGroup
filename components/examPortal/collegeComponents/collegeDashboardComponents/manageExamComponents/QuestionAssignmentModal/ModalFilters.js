import React from 'react';
import { getTopics } from '../../../../../../utils/examUtils/subject_Details';

export default function ModalFilters({ exam, filters, handleFilterChange }) {
  // Get topics based on current filters
  const topics = getTopics(exam?.stream, filters.subject, filters.standard);

  return (
    <div className="p-4 bg-gray-50/80 border-b border-gray-200">
      <div className="flex items-center space-x-2 mb-3">
        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        <span className="text-sm font-medium text-gray-700">Filters</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
        {/* Stream Label */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Stream</label>
          <div className="w-full px-2 py-1.5 text-sm bg-gray-100 border border-gray-200 rounded-lg text-gray-700 font-medium">
            {exam?.stream || "Not specified"}
          </div>
        </div>

        {/* Subject Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Subject</label>
          <select
            value={filters.subject}
            onChange={(e) => handleFilterChange("subject", e.target.value)}
            className="w-full px-2 py-1.5 text-sm bg-white border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All</option>
            {exam?.examSubject?.map((subject) => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
        </div>

        {/* Standard Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Standard</label>
          <select
            value={filters.standard}
            onChange={(e) => handleFilterChange("standard", e.target.value)}
            className="w-full px-2 py-1.5 text-sm bg-white border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All</option>
            <option value="11">11th</option>
            <option value="12">12th</option>
          </select>
        </div>

        {/* Difficulty Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Difficulty</label>
          <select
            value={filters.difficultyLevel}
            onChange={(e) => handleFilterChange("difficultyLevel", e.target.value)}
            className="w-full px-2 py-1.5 text-sm bg-white border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        {/* Topic Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Topic</label>
          <select
            value={filters.topic}
            onChange={(e) => handleFilterChange("topic", e.target.value)}
            className="w-full px-2 py-1.5 text-sm bg-white border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            disabled={!filters.stream || !filters.subject || !filters.standard}
          >
            <option value="">All</option>
            {Object.entries(topics || {}).sort(([a], [b]) => a.localeCompare(b)).map(([topic, id]) => (
              <option key={id} value={id}>
                {topic}
              </option>
            ))}
          </select>
        </div>

        {/* Section Filter - only show for JEE stream */}
        {filters.stream === "JEE" && (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Section</label>
            <select
              value={filters.section}
              onChange={(e) => handleFilterChange("section", e.target.value)}
              className="w-full px-2 py-1.5 text-sm bg-white border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All</option>
              <option value="Section A">Section A</option>
              <option value="Section B">Section B</option>
            </select>
          </div>
        )}

        {/* Question Type Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
          <select
            value={filters.questionType}
            onChange={(e) => handleFilterChange("questionType", e.target.value)}
            className="w-full px-2 py-1.5 text-sm bg-white border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All</option>
            <option value="MCSA">MCSA</option>
            <option value="MCMA">MCMA</option>
            <option value="numerical">Numerical</option>
          </select>
        </div>

        {/* Marks Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Marks</label>
          <select
            value={filters.marks}
            onChange={(e) => handleFilterChange("marks", e.target.value)}
            className="w-full px-2 py-1.5 text-sm bg-white border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All</option>
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