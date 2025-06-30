import CollegeControlHome from './CollegeControlHome';
import { MdSchool, MdViewList } from 'react-icons/md';
import { FaUniversity } from 'react-icons/fa';

export default function ExamPortalHome() {
  return (
    <div className="md:ml-64 min-h-screen w-full md:w-[calc(100%-16rem)] px-4 md:px-8 py-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl md:text-4xl font-semibold text-gray-900 mb-8 flex items-center gap-3">
          <MdSchool className="text-[#1d77bc]" />
          Exam Portal Administration
        </h1>

        <div className="flex flex-wrap gap-4 mb-8">
          <button className="bg-[#1d77bc] text-white px-6 py-2.5 rounded-lg hover:bg-[#1d77bc]/90 transition-colors duration-200 flex items-center gap-2">
            <FaUniversity />
            College Control
          </button>
          <button className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center gap-2">
            <MdViewList />
            View Requests
          </button>
        </div>

        <CollegeControlHome />
      </div>
    </div>
  );
}