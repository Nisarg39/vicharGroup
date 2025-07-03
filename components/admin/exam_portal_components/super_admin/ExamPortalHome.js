import { useState } from 'react';
import CollegeControlHome from './CollegeControlHome';
import { MdSchool } from 'react-icons/md';
import { FaUniversity } from 'react-icons/fa';
import PdfSmartCropTool from './PdfSmartCropTool';
import { FaCrop } from 'react-icons/fa';

export default function ExamPortalHome() {
  const [activeComponent, setActiveComponent] = useState('collegeControl');

  return (
    <div className="md:ml-64 min-h-screen w-full md:w-[calc(100%-16rem)] px-4 md:px-8 py-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl md:text-4xl font-semibold text-gray-900 mb-8 flex items-center gap-3">
          <MdSchool className="text-[#1d77bc]" />
          Exam Portal Administration
        </h1>

        <div className="flex flex-wrap gap-4 mb-8">
          <button 
            className={`${activeComponent === 'collegeControl' ? 'bg-[#1d77bc]' : 'bg-[#1d77bc]/80'} text-white px-6 py-2.5 rounded-lg hover:bg-[#1d77bc]/90 transition-colors duration-200 flex items-center gap-2`}
            onClick={() => setActiveComponent('collegeControl')}
          >
            <FaUniversity />
            College Control
          </button>
          
          <button 
            className={`${activeComponent === 'smartCropTool' ? 'bg-[#1d77bc]' : 'bg-[#1d77bc]/80'} text-white px-6 py-2.5 rounded-lg hover:bg-[#1d77bc]/90 transition-colors duration-200 flex items-center gap-2`}
            onClick={() => setActiveComponent('smartCropTool')}
          >
            <FaCrop />
            Smart Crop Tool
          </button>
        </div>

        {activeComponent === 'collegeControl' && <CollegeControlHome />}
        {activeComponent === 'smartCropTool' && <PdfSmartCropTool />}
      </div>
    </div>
  );
}