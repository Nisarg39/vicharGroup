export default function StudentDashboard() {
    const handleLogout = () => {
        localStorage.removeItem('token')
        window.location.href = '/login'
    }

    return (
        <section className="min-h-screen w-full flex flex-col gap-6 p-8 mt-16">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Student Dashboard</h1>
                <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                >
                    Logout
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Current Courses</h2>
                    <ul className="space-y-2">
                        <li>No courses enrolled yet</li>
                    </ul>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Upcoming Assignments</h2>
                    <ul className="space-y-2">
                        <li>No pending assignments</li>
                    </ul>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Recent Grades</h2>
                    <ul className="space-y-2">
                        <li>No grades available</li>
                    </ul>
                </div>
            </div>
        </section>
    )
}