import CollegeControlHome from './CollegeControlHome';
export default function ExamPortalHome() {
  const stats = {
    totalColleges: 24,
    activeExams: 12,
    pendingRequests: 5,
    totalStudents: 15000
  }

  return (
    <div className="md:ml-64 min-h-screen w-full md:w-[calc(100%-16rem)] px-4 md:px-8 py-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl md:text-4xl font-semibold text-gray-900 mb-8">Exam Portal Administration</h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#1d77bc] text-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-200">
            <h3 className="text-lg font-medium">Registered Colleges</h3>
            <p className="text-3xl font-bold mt-2">{stats.totalColleges}</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-200">
            <h3 className="text-lg font-medium text-gray-700">Active Exams</h3>
            <p className="text-3xl font-bold text-[#1d77bc] mt-2">{stats.activeExams}</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-200">
            <h3 className="text-lg font-medium text-gray-700">Pending Requests</h3>
            <p className="text-3xl font-bold text-[#1d77bc] mt-2">{stats.pendingRequests}</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-200">
            <h3 className="text-lg font-medium text-gray-700">Total Students</h3>
            <p className="text-3xl font-bold text-[#1d77bc] mt-2">{stats.totalStudents}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-8">
          <button className="bg-[#1d77bc] text-white px-6 py-2.5 rounded-lg hover:bg-[#1d77bc]/90 transition-colors duration-200">
            College Control          </button>
          <button className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-lg hover:bg-gray-200 transition-colors duration-200">
            View Requests
          </button>
        </div>

        <CollegeControlHome />
      </div>
    </div>
  );
}