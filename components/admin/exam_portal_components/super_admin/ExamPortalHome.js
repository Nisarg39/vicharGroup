import { useState } from 'react';
import CollegeControlHome from './CollegeControlHome';
import { MdSchool } from 'react-icons/md';
import { FaUniversity, FaQuestion, FaTasks } from 'react-icons/fa';
import PdfSmartCropTool from './PdfSmartCropTool';
import { FaCrop } from 'react-icons/fa';
import { MdCalculate, MdPlaylistAdd } from 'react-icons/md';
import QuestionsControlHome from './questionControls/QuestionsControlHome';
import DefaultNegativeMarkingRules from './DefaultNegativeMarkingRules';
import QuestionSelectionScheme from './QuestionSelectionScheme';

export default function ExamPortalHome() {
  const [activeComponent, setActiveComponent] = useState('collegeControl');

  return (
    <div className="md:ml-64 min-h-screen w-full md:w-[calc(100%-16rem)] px-4 md:px-8 py-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl md:text-4xl font-semibold text-gray-900 mb-8 flex items-center gap-3">
          <MdSchool className="text-[#1d77bc]" />
          Exam Portal Administration
        </h1>

        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-1 overflow-x-auto scrollbar-hide">
            <button 
              className={`${
                activeComponent === 'collegeControl' 
                  ? 'border-[#1d77bc] text-[#1d77bc] bg-blue-50/50' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
              } whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm flex items-center gap-2 min-w-fit transition-all duration-200 rounded-t-lg`}
              onClick={() => setActiveComponent('collegeControl')}
            >
              <FaUniversity className="text-base" />
              <span className="hidden sm:inline">College Control</span>
              <span className="sm:hidden">Colleges</span>
            </button>

            <button 
              className={`${
                activeComponent === 'questionsControl' 
                  ? 'border-[#2c9652] text-[#2c9652] bg-green-50/50' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
              } whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm flex items-center gap-2 min-w-fit transition-all duration-200 rounded-t-lg`}
              onClick={() => setActiveComponent('questionsControl')}
            >
              <FaTasks className="text-base" />
              <span className="hidden sm:inline">Questions Control</span>
              <span className="sm:hidden">Questions</span>
            </button>
            
            <button 
              className={`${
                activeComponent === 'smartCropTool' 
                  ? 'border-[#9c27b0] text-[#9c27b0] bg-purple-50/50' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
              } whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm flex items-center gap-2 min-w-fit transition-all duration-200 rounded-t-lg`}
              onClick={() => setActiveComponent('smartCropTool')}
            >
              <FaCrop className="text-base" />
              <span className="hidden sm:inline">Smart Crop Tool</span>
              <span className="sm:hidden">Crop</span>
            </button>

            <button 
              className={`${
                activeComponent === 'negativeMarkingRules' 
                  ? 'border-[#f44336] text-[#f44336] bg-red-50/50' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
              } whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm flex items-center gap-2 min-w-fit transition-all duration-200 rounded-t-lg`}
              onClick={() => setActiveComponent('negativeMarkingRules')}
            >
              <MdCalculate className="text-base" />
              <span className="hidden sm:inline">Default Negative Marking</span>
              <span className="sm:hidden">Marking</span>
            </button>

            <button 
              className={`${
                activeComponent === 'questionSelectionScheme' 
                  ? 'border-[#9c27b0] text-[#9c27b0] bg-purple-50/50' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
              } whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm flex items-center gap-2 min-w-fit transition-all duration-200 rounded-t-lg`}
              onClick={() => setActiveComponent('questionSelectionScheme')}
            >
              <MdPlaylistAdd className="text-base" />
              <span className="hidden sm:inline">Question Selection Scheme</span>
              <span className="sm:hidden">Selection</span>
            </button>
          </nav>
        </div>

        {activeComponent === 'collegeControl' && <CollegeControlHome />}
        {activeComponent === 'questionsControl' && <QuestionsControlHome />}
        {activeComponent === 'smartCropTool' && <PdfSmartCropTool />}
        {activeComponent === 'negativeMarkingRules' && <DefaultNegativeMarkingRules onBack={() => setActiveComponent('collegeControl')} />}
        {activeComponent === 'questionSelectionScheme' && <QuestionSelectionScheme />}
      </div>
    </div>
  );
}