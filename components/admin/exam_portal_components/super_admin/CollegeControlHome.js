"use client";
import { useState, useEffect, useCallback } from 'react';
import AddCollege from './AddCollege';
import CollegeTable from './CollegeTable';
import { showCollegeList, deleteCollege, searchCollege } from '../../../../server_actions/actions/adminActions';
import { FaUniversity, FaPlus, FaSpinner } from 'react-icons/fa';

export default function CollegeControlHome() {
  const [colleges, setColleges] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalColleges, setTotalColleges] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchColleges = async () => {
    const response = await showCollegeList(currentPage, itemsPerPage);
    if (response.success) {
      setColleges(response.colleges);
      setTotalPages(response.pagination.totalPages);
      setTotalColleges(response.totalLength);
    }
  };

  const debouncedSearch = useCallback((value) => {
    // Clear any existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set new timeout
    const timeoutId = setTimeout(async () => {
      if (value.trim() === '') {
        fetchColleges();
        return;
      }

      setIsLoading(true);
      const response = await searchCollege(value, currentPage, itemsPerPage);
      if (response.success) {
        setColleges(response.colleges);
        setTotalPages(response.pagination.totalPages);
        setTotalColleges(response.totalLength);
      }
      setIsLoading(false);
    }, 500); // 500ms delay

    setSearchTimeout(timeoutId);
  }, [currentPage, itemsPerPage]);

  const handleSearch = (value) => {
    setSearchTerm(value);
    debouncedSearch(value);
  };

  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      fetchColleges();
    } else {
      handleSearch(searchTerm);
    }
  }, [currentPage]);

  const handleAddCollege = async () => {
    await fetchColleges();
    setShowAddForm(false);
  };

  const handleCollegeSelect = (college) => {
    setSelectedCollege(college);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleCollegeUpdate = (updatedCollege) => {
    setColleges(prevColleges => 
      prevColleges.map(college => 
        college._id === updatedCollege._id ? updatedCollege : college
      )
    );
  };

  const handleDeleteCollege = async (collegeId) => {
    const response = await deleteCollege(collegeId);
    
    if (response.success) {
      // If we're on a page that would be empty after deletion, go to previous page
      const remainingItemsOnPage = colleges.length - 1;
      if (remainingItemsOnPage === 0 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      } else {
        // Otherwise just refresh the current page
        fetchColleges();
      }
      
      // If the deleted college was selected, clear the selection
      if (selectedCollege?._id === collegeId) {
        setSelectedCollege(null);
      }
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="bg-[#1d77bc] text-white p-4 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-200 max-w-[200px]">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Registered Colleges</h3>
            <FaUniversity className="text-xl opacity-80" />
          </div>
          <p className="text-2xl font-bold mt-1">{totalColleges}</p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <FaUniversity className="text-2xl text-gray-800" />
          <h1 className="text-2xl font-bold text-gray-800">College Management</h1>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <FaPlus className="text-sm" />
          Add New College
        </button>
      </div>

      <div className="mb-6 relative">
        <input
          type="text"
          placeholder="Search colleges by name..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <FaSpinner className="animate-spin text-blue-500" />
          </div>
        )}
      </div>

      {showAddForm ? (
        <AddCollege 
          onAddCollege={handleAddCollege}
          setShowAddForm={setShowAddForm}
        />
      ) : (
        <CollegeTable 
          colleges={colleges} 
          isLoading={isLoading}
          onCollegeSelect={handleCollegeSelect}
          selectedCollege={selectedCollege}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          itemsPerPage={itemsPerPage}
          totalItems={totalColleges}
          onCollegeUpdate={handleCollegeUpdate}
          onDeleteCollege={handleDeleteCollege}
        />
      )}
    </div>
  );
}