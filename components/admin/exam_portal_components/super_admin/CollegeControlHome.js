"use client";
import { useState } from 'react';
import AddCollege from './AddCollege';
import CollegeTable from './CollegeTable';

export default function CollegeControlHome() {
  const [colleges, setColleges] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddCollege = (newCollege) => {
    setColleges([...colleges, newCollege]);
    setShowAddForm(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">College Management</h1>
        <button 
          onClick={() => setShowAddForm(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Add New College
        </button>
      </div>

      {showAddForm ? (
        <AddCollege 
          onAddCollege={handleAddCollege}
          showAddForm={showAddForm}
          setShowAddForm={setShowAddForm}
        />
      ) : (
        <CollegeTable colleges={colleges} />
      )}
    </div>
  );
}