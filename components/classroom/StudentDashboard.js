export default function StudentDashboard() {
    return (
        <section className="min-h-screen w-full flex flex-col gap-6 p-8">
            <h1 className="text-3xl font-bold">Student Dashboard</h1>
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