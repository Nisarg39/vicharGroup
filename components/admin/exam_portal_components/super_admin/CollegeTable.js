import { useState } from 'react';
import CollegeDetails from './CollegeDetails';
import { deleteCollege } from '../../../../server_actions/actions/adminActions';

export default function CollegeTable({ 
  colleges, 
  onCollegeSelect, 
  selectedCollege,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  itemsPerPage = 10,
  totalItems = 0,
  onCollegeUpdate,
  onDeleteCollege,
}) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const handleDelete = (e, collegeId) => {
    e.stopPropagation(); // Prevent row selection
    if (window.confirm('Are you sure you want to delete this college? This action cannot be undone.')) {
      onDeleteCollege(collegeId);
    }
  };

  // console.log(colleges[0].createdAt)

  return (
    <div className="w-full space-y-6">
      <div className="w-full bg-white rounded-xl shadow-lg overflow-hidden">
        <table className="w-full table-auto">
          <thead className="bg-gradient-to-r from-[#1d77bc] to-[#4da3e4] text-white">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">College Code</th>
              <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Logo</th>
              <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">College Name</th>
              <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Location</th>
              <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Contact</th>
              <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Added On</th>
              <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {colleges.map((college) => (
              <>
                <tr 
                  key={college._id}
                  onClick={() => onCollegeSelect(selectedCollege?._id === college._id ? null : college)}
                  className={`cursor-pointer transition-colors duration-200 
                    ${selectedCollege?._id === college._id 
                      ? 'bg-blue-50 hover:bg-blue-100' 
                      : 'hover:bg-gray-50'
                    }`}
                >
                  <td className="px-6 py-5 text-sm">{college.collegeCode}</td>
                  <td className="px-6 py-5">
                    {college.collegeLogo ? (
                      <img 
                        src={college.collegeLogo} 
                        alt={`${college.collegeName} logo`}
                        className="w-12 h-12 object-cover rounded-full ring-2 ring-gray-200 transition-transform hover:scale-110"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 text-xl font-semibold">
                          {college.collegeName.charAt(0)}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-5 text-sm font-medium">{college.collegeName}</td>
                  <td className="px-6 py-5 text-sm">{college.collegeLocation}</td>
                  <td className="px-6 py-5 text-sm">{college.collegeContact}</td>
                  <td className="px-6 py-5 text-sm">
                    {new Date(college.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </td>
                  <td className="px-6 py-5 space-x-3">
                    <button 
                      onClick={(e) => handleDelete(e, college._id)}
                      className="px-3 py-1 text-sm text-red-600 hover:text-red-800 font-medium rounded-full hover:bg-red-50 transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
                {selectedCollege?._id === college._id && (
                  <tr className="bg-blue-50">
                    <td colSpan="7" className="px-6 py-4 w-full">
                      <CollegeDetails 
                        college={college} 
                        onClose={() => onCollegeSelect(null)} 
                        onUpdate={(updatedCollege) => {
                          onCollegeUpdate(updatedCollege);
                          onCollegeSelect(updatedCollege);
                        }}
                      />
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
        <div className="flex flex-1 justify-between sm:hidden">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`relative inline-flex items-center rounded-md px-4 py-2 text-sm font-medium ${
              currentPage === 1 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Previous
          </button>
          <span className="mx-4 flex items-center text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`relative ml-3 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium ${
              currentPage === totalPages 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{startItem}</span> to{' '}
              <span className="font-medium">{endItem}</span> of{' '}
              <span className="font-medium">{totalItems}</span> results
            </p>
          </div>
          <div>
            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
              <button
                onClick={() => onPageChange(1)}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-2 py-2 text-sm font-medium ${
                  currentPage === 1 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                First
              </button>
              { Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  const delta = 2;
                  return page === 1 || 
                         page === totalPages || 
                         (page >= currentPage - delta && page <= currentPage + delta);
                })
                .map((page, index, array) => {
                  const showEllipsis = index > 0 && page - array[index - 1] > 1;
                  return (
                    <div key={page} className="flex items-center">
                      {showEllipsis && <span className="px-2 py-2">...</span>}
                      <button
                        onClick={() => onPageChange(page)}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${
                          page === currentPage
                            ? 'z-10 bg-blue-500 text-white'
                            : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    </div>
                  );
                })}
              <button
                onClick={() => onPageChange(totalPages)}
                disabled={currentPage === totalPages}
                className={`relative inline-inline items-center px-2 py-2 text-sm font-medium ${
                  currentPage === totalPages 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                Last
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}