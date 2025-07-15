import React from 'react';

export default function ModalHeader({ exam, onClose }) {
  return (
    <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/95 to-indigo-600/95"></div>
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-12 h-12 bg-white rounded-full translate-x-6 -translate-y-6"></div>
        <div className="absolute bottom-0 left-1/4 w-8 h-8 bg-white/50 rounded-full"></div>
      </div>

      {/* Content */}
      <div className="relative flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-1 bg-white/15 rounded-lg backdrop-blur-sm">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Assign Questions</h2>
            <div className="flex items-center space-x-2">
              <span className="text-blue-100 text-sm font-medium">{exam?.examName}</span>
              <span className="text-blue-200 text-xs">
                • {exam?.stream} • {exam?.examSubject?.[0]} • {exam?.standard}th
              </span>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="group p-1.5 text-white/80 hover:text-white transition-all duration-200 hover:bg-white/10 rounded-lg"
          aria-label="Close modal"
        >
          <svg className="w-4 h-4 transform group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}