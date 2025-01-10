export default function AdminStats() {
  return (
    <div className="p-6 ml-64 mt-16">
      <h1 className="text-2xl font-bold mb-6">Dashboard Statistics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500">JEE Students</h3>
          <p className="text-3xl font-semibold">450</p>
          <span className="text-green-500 text-sm">+15% from last month</span>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500">NEET Students</h3>
          <p className="text-3xl font-semibold">380</p>
          <span className="text-blue-500 text-sm">32 new enrollments</span>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500">MHT-CET Students</h3>
          <p className="text-3xl font-semibold">275</p>
          <span className="text-green-500 text-sm">+12% from last month</span>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500">Foundation Students</h3>
          <p className="text-3xl font-semibold">129</p>
          <span className="text-yellow-500 text-sm">Growing steadily</span>
        </div>
      </div>

      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <div>
              <p className="font-medium">New JEE Enrollment</p>
              <p className="text-sm text-gray-500">Rahul Sharma</p>
            </div>
            <span className="text-sm text-gray-500">2 minutes ago</span>
          </div>
          <div className="flex items-center justify-between border-b pb-2">
            <div>
              <p className="font-medium">NEET Test Completed</p>
              <p className="text-sm text-gray-500">Batch A - Mock Test 3</p>
            </div>
            <span className="text-sm text-gray-500">15 minutes ago</span>
          </div>
          <div className="flex items-center justify-between border-b pb-2">
            <div>
              <p className="font-medium">MHT-CET Workshop</p>
              <p className="text-sm text-gray-500">50 students attended</p>
            </div>
            <span className="text-sm text-gray-500">1 hour ago</span>
          </div>
        </div>
      </div>
    </div>
  );
}