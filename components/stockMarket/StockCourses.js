export default function StockCourses() {
    const courses = [
        {
            id: 1,
            title: "Price Action",
            description: "Learn the fundamentals of stock market investing and master the art of reading price movements. This course covers key concepts and strategies for successful trading.",
            duration: "4 weeks",
            price: "$99",
            icon: "📈",
            difficulty: "Beginner"
        },
        {
            id: 2,
            title: "RSI",
            description: "Master chart patterns and technical indicators, with a focus on the Relative Strength Index (RSI). Learn how to use this powerful tool to identify overbought and oversold conditions.",
            duration: "6 weeks",
            price: "$149",
            icon: "📉",
            difficulty: "Intermediate"
        },
        {
            id: 3,
            title: "Options Trading",
            description: "Explore complex trading techniques and risk management strategies in the world of options. Gain insights into advanced concepts like Greeks, volatility, and multi-leg strategies.",
            duration: "8 weeks",
            price: "$199",
            icon: "💰",
            difficulty: "Advanced"
        }
    ]

    return (
        <div className="max-w-7xl mx-auto px-8 py-20 bg-gray-100">
            <h1 className="text-5xl font-bold text-center mb-16 text-gray-800">Courses</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {courses.map((course) => (
                    <div key={course.id} className="bg-white rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl border-t-4 border-[#106FB7]">
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-6">
                                <div className="text-6xl bg-gray-100 p-4 rounded-full">{course.icon}</div>
                                <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                                    course.difficulty === "Beginner" ? "bg-green-100 text-green-800" :
                                    course.difficulty === "Intermediate" ? "bg-yellow-100 text-yellow-800" :
                                    "bg-red-100 text-red-800"
                                }`}>
                                    {course.difficulty}
                                </span>
                            </div>
                            <h2 className="text-2xl font-bold mb-4">{course.title}</h2>
                            <p className="text-gray-600 text-base mb-6">{course.description}</p>
                            <div className="flex justify-between items-center text-base text-gray-500 mb-6">
                                <span className="flex items-center bg-gray-100 px-4 py-2 rounded-full">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    <span>{course.duration}</span>
                                </span>
                                <span className="font-bold text-[#106FB7] text-xl bg-blue-50 px-4 py-2 rounded-full">{course.price}</span>
                            </div>
                            <button className="w-full bg-gradient-to-r from-[#fe9852] to-[#ef5a2a] hover:from-[#ee672d] hover:to-[#f47f33] text-white font-bold py-4 px-6 rounded-xl transition duration-300 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-[#f47f33] focus:ring-opacity-50 flex items-center justify-center text-xl">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                Enroll Now
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}