import React from 'react';

export default function SchemePanel({
  availableSchemes,
  selectedScheme,
  setSelectedScheme,
  schemeValidation,
  onApplyScheme,
  applyingScheme,
  showSchemePanel,
  onToggleSchemeMode
}) {
  if (!showSchemePanel) return null;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-500 rounded-full">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Question Selection Schemes</h3>
            <p className="text-sm text-gray-600">Apply predefined question patterns for consistent exam creation</p>
          </div>
        </div>
        <button
          onClick={onToggleSchemeMode}
          className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Close
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scheme Selection */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Available Schemes
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {availableSchemes.length > 0 ? (
                availableSchemes.map((scheme) => (
                  <div
                    key={scheme._id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors duration-200 ${
                      selectedScheme?._id === scheme._id
                        ? 'border-blue-500 bg-blue-50 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedScheme(scheme)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{scheme.schemeName}</h4>
                        <p className="text-sm text-gray-600 mt-1">{scheme.description || 'No description'}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>Total Questions: {scheme.totalSchemeQuestions}</span>
                          <span>Subjects: {scheme.subjectRules?.length || 0}</span>
                          {scheme.usageStats?.timesUsed > 0 && (
                            <span>Used: {scheme.usageStats.timesUsed} times</span>
                          )}
                        </div>
                      </div>
                      {selectedScheme?._id === scheme._id && (
                        <div className="p-1 bg-blue-500 rounded-full">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p>No schemes available for this exam type</p>
                </div>
              )}
            </div>
          </div>

          {selectedScheme && (
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={onApplyScheme}
                disabled={applyingScheme}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {applyingScheme ? 'Applying Scheme...' : `Apply ${selectedScheme.schemeName}`}
              </button>
            </div>
          )}
        </div>

        {/* Scheme Details & Validation */}
        <div className="space-y-4">
          {selectedScheme && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Scheme Breakdown</h4>
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="grid grid-cols-1 gap-2 text-xs">
                  {selectedScheme.subjectRules?.map((rule, index) => (
                    <div key={index} className="flex justify-between items-center py-1 border-b border-gray-100 last:border-b-0">
                      <span className="font-medium">{rule.subject}</span>
                      <div className="flex space-x-2 text-gray-600">
                        <span>Total: {rule.totalQuestions}</span>
                        <span className="text-gray-400">|</span>
                        <span>11th: {rule.standard11Questions}</span>
                        <span>12th: {rule.standard12Questions}</span>
                        <span className="text-gray-400">|</span>
                        <span className="text-green-600">E:{rule.difficultyDistribution?.easy || 0}</span>
                        <span className="text-yellow-600">M:{rule.difficultyDistribution?.medium || 0}</span>
                        <span className="text-red-600">H:{rule.difficultyDistribution?.hard || 0}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {schemeValidation && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Compliance Status</h4>
              <div className={`border rounded-lg p-3 ${
                schemeValidation.isCompliant 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-red-200 bg-red-50'
              }`}>
                <div className="flex items-center space-x-2 mb-2">
                  {schemeValidation.isCompliant ? (
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  )}
                  <span className={`font-medium ${schemeValidation.isCompliant ? 'text-green-800' : 'text-red-800'}`}>
                    {schemeValidation.isCompliant ? 'Scheme Compliant' : 'Scheme Violations Found'}
                  </span>
                </div>
                
                <div className="text-xs space-y-1">
                  <div className="flex justify-between">
                    <span>Total Selected:</span>
                    <span className={schemeValidation.totalValidation.difference === 0 ? 'text-green-600' : 'text-red-600'}>
                      {schemeValidation.totalValidation.selected} / {schemeValidation.totalValidation.required}
                    </span>
                  </div>
                  
                  {!schemeValidation.isCompliant && (
                    <div className="mt-2 space-y-1">
                      {schemeValidation.subjectValidation
                        .filter(sv => !sv.isCompliant)
                        .map((sv, index) => (
                          <div key={index} className="text-red-700">
                            <strong>{sv.subject}:</strong> {sv.errors.join(', ')}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}