export default function JeeInfo(){
    return(
        <div className="bg-gray-200">
            <section className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <p className="mb-4 text-base sm:text-lg text-gray-700">
                    <strong className="text-black">The National Testing Agency (NTA)</strong> will administer the JEE Main exam in two sessions: January and April. Understanding the JEE Main exam pattern is crucial for successful preparation. The exam will be held in two shifts, morning and evening. The overall JEE Main paper pattern remains consistent for both sessions, though there are slight differences in the exam pattern for Paper.
                </p>
                <p className="text-base sm:text-lg text-gray-700">
                    <strong className="text-black">The JEE Main exam pattern</strong> provides essential details such as test duration, marking scheme, subjects, total marks, and other relevant aspects. The exam will consist of total 75 questions carrying a total of 300 marks, each topic comprises 20 multiple-choice questions (MCQs) and 5 numerical value questions (NVQs).
                </p>
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mt-8 mb-4 text-black">Detailed JEE Main Exam Pattern</h2>
                <table className="w-full mt-8 border-collapse border border-gray-300 shadow-lg rounded-lg overflow-hidden">
                    <thead>
                        <tr className="bg-[#1d77bc] text-white">
                            <th className="border border-gray-300 px-4 py-3 text-left">Topic</th>
                            <th className="border border-gray-300 px-4 py-3 text-left">Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="bg-gray-100 hover:bg-gray-200 transition-colors duration-200">
                            <td className="border border-gray-300 px-4 py-3 font-semibold text-black">Exam Mode</td>
                            <td className="border border-gray-300 px-4 py-3 text-gray-700">Computer-based (Online)</td>
                        </tr>
                        <tr className="bg-white hover:bg-gray-100 transition-colors duration-200">
                            <td className="border border-gray-300 px-4 py-3 font-semibold text-black">Subjects</td>
                            <td className="border border-gray-300 px-4 py-3 text-gray-700">Physics, Chemistry, Mathematics</td>
                        </tr>
                        <tr className="bg-gray-100 hover:bg-gray-200 transition-colors duration-200">
                            <td className="border border-gray-300 px-4 py-3 font-semibold text-black">Duration of Exam</td>
                            <td className="border border-gray-300 px-4 py-3 text-gray-700">180 Minutes</td>
                        </tr>
                        <tr className="bg-white hover:bg-gray-100 transition-colors duration-200">
                            <td className="border border-gray-300 px-4 py-3 font-semibold text-black">Type of Questions</td>
                            <td className="border border-gray-300 px-4 py-3 text-gray-700">MCQ: 4 options with only 1 correct option.<br/>Numerical Value Questions whose answers need to be filled in as a numerical value.</td>
                        </tr>
                        <tr className="bg-gray-100 hover:bg-gray-200 transition-colors duration-200">
                            <td className="border border-gray-300 px-4 py-3 font-semibold text-black">Sections A (MCQ)</td>
                            <td className="border border-gray-300 px-4 py-3 text-gray-700">Physics: 20<br/>Chemistry: 20<br/>Mathematics: 20</td>
                        </tr>
                        <tr className="bg-white hover:bg-gray-100 transition-colors duration-200">
                            <td className="border border-gray-300 px-4 py-3 font-semibold text-black">Sections B (Numerical Value)</td>
                            <td className="border border-gray-300 px-4 py-3 text-gray-700">Physics: 5<br/>Chemistry: 5<br/>Mathematics: 5</td>
                        </tr>
                        <tr className="bg-gray-100 hover:bg-gray-200 transition-colors duration-200">
                            <td className="border border-gray-300 px-4 py-3 font-semibold text-black">Number of Questions</td>
                            <td className="border border-gray-300 px-4 py-3 text-gray-700">75 (25 questions from each subject)</td>
                        </tr>
                        <tr className="bg-white hover:bg-gray-100 transition-colors duration-200">
                            <td className="border border-gray-300 px-4 py-3 font-semibold text-black">Total Marks</td>
                            <td className="border border-gray-300 px-4 py-3 text-gray-700">300 (100 marks for each subject)</td>
                        </tr>
                        <tr className="bg-gray-100 hover:bg-gray-200 transition-colors duration-200">
                            <td className="border border-gray-300 px-4 py-3 font-semibold text-black">Question Types</td>
                            <td className="border border-gray-300 px-4 py-3 text-gray-700">MCQs and Numerical Value Questions</td>
                        </tr>
                        <tr className="bg-white hover:bg-gray-100 transition-colors duration-200">
                            <td className="border border-gray-300 px-4 py-3 font-semibold text-black">Negative Marking</td>
                            <td className="border border-gray-300 px-4 py-3 text-gray-700">No Negative marking for unattempted questions and mark for review questions</td>
                        </tr>
                        <tr className="bg-gray-100 hover:bg-gray-200 transition-colors duration-200">
                            <td className="border border-gray-300 px-4 py-3 font-semibold text-black">Medium of Exam</td>
                            <td className="border border-gray-300 px-4 py-3 text-gray-700">English, Hindi, and other regional languages</td>
                        </tr>
                    </tbody>
                </table>
                <div className="mt-8 text-gray-700">
                    <h3 className="text-lg font-semibold mb-2 text-black">JEE Exam Date:</h3>
                    <p className="mb-4">The JEE exam date will be conducted in two sessions:</p>
                    <ul className="list-disc list-inside mb-4">
                        <li>Session 1: Every year in the month of January</li>
                        <li>Session 2: Every year in the month of April</li>
                    </ul>
                    <p className="mb-4">Also, make sure you have all the necessary JEE Main and advanced resources to stay ahead.</p>
                    <p className="mb-2">
                        <strong className="text-black">Jee Main:</strong> <a href="https://jeemain.nta.nic.in" className="text-blue-600 hover:underline">https://jeemain.nta.nic.in</a>
                    </p>
                    <p>
                        <strong className="text-black">Jee Advanced:</strong> <a href="https://jeeadv.ac.in/" className="text-blue-600 hover:underline">https://jeeadv.ac.in/</a>
                    </p>
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mt-8 text-black">JEE Main Exam Pattern: </h2>
                <h2 className="text-lg sm:text-xl md:text-2xl lg:text-xl mb-4 text-black">(Subject-wise distribution of mark)</h2>
                <h3 className="text-lg sm:text-lg md:text-md lg:text-lg mt-4 mb-2 text-gray-700">Here's a detailed breakdown of the subject-wise distribution of marks in the JEE Main exam pattern:</h3>
                <div className="overflow-x-auto">
                    <table className="w-full mt-8 border-collapse border border-gray-300 shadow-lg rounded-lg overflow-hidden">
                        <thead>
                            <tr className="bg-[#1d77bc] text-white">
                                <th className="border border-gray-300 px-4 py-3 text-left">Subject</th>
                                <th className="border border-gray-300 px-4 py-3 text-left">Number of MCQ's</th>
                                <th className="border border-gray-300 px-4 py-3 text-left">Number of NVQ</th>
                                <th className="border border-gray-300 px-4 py-3 text-left">Total Marks</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="bg-gray-100 hover:bg-gray-200 transition-colors duration-200">
                                <td className="border border-gray-300 px-4 py-3 font-semibold text-black">Physics</td>
                                <td className="border border-gray-300 px-4 py-3 text-gray-700">20</td>
                                <td className="border border-gray-300 px-4 py-3 text-gray-700">5</td>
                                <td className="border border-gray-300 px-4 py-3 text-gray-700">100</td>
                            </tr>
                            <tr className="bg-white hover:bg-gray-100 transition-colors duration-200">
                                <td className="border border-gray-300 px-4 py-3 font-semibold text-black">Chemistry</td>
                                <td className="border border-gray-300 px-4 py-3 text-gray-700">20</td>
                                <td className="border border-gray-300 px-4 py-3 text-gray-700">5</td>
                                <td className="border border-gray-300 px-4 py-3 text-gray-700">100</td>
                            </tr>
                            <tr className="bg-gray-100 hover:bg-gray-200 transition-colors duration-200">
                                <td className="border border-gray-300 px-4 py-3 font-semibold text-black">Mathematics</td>
                                <td className="border border-gray-300 px-4 py-3 text-gray-700">20</td>
                                <td className="border border-gray-300 px-4 py-3 text-gray-700">5</td>
                                <td className="border border-gray-300 px-4 py-3 text-gray-700">100</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className="mt-8 text-gray-700">
                    <h3 className="text-lg font-semibold mb-2 text-black">Marking Scheme:</h3>
                    <ul className="list-disc list-inside mb-4">
                        <li>For MCQs and NVQs, four marks are for each correct answer and one mark is deducted for each incorrect answer.</li>
                        <li>No mark (Zero) for Unanswered / Marked for Review</li>
                    </ul>
                </div>
            </section>
        </div>
    )
}