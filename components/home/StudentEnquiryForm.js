function StudentEnquiryForm() {
    return (
        <>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-center mb-6 md:mb-10 text-gray-800 leading-tight mt-8 animate-fade-in-down">Student Enquiry Form</h2>
            <div className="p-4 sm:p-6 md:p-10 rounded-xl shadow-2xl max-w-3xl mx-auto my-4 sm:my-8 md:my-16 bg-white">
                <form className="space-y-4 sm:space-y-6 md:space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div className="group">
                            <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-1 sm:mb-2 group-hover:text-[#106fb8] transition-colors duration-200">Full Name</label>
                            <input type="text" id="fullName" name="fullName" required className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-[#106fb8] focus:ring-2 focus:ring-[#106fb8] focus:ring-opacity-50 transition duration-200 ease-in-out text-sm py-3 sm:py-3 px-3 sm:px-4 bg-gray-50 hover:bg-white group-hover:border-[#106fb8]" />
                        </div>
                        <div className="group">
                            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1 sm:mb-2 group-hover:text-[#106fb8] transition-colors duration-200">Email</label>
                            <input type="email" id="email" name="email" required className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-[#106fb8] focus:ring-2 focus:ring-[#106fb8] focus:ring-opacity-50 transition duration-200 ease-in-out text-sm py-3 sm:py-3 px-3 sm:px-4 bg-gray-50 hover:bg-white group-hover:border-[#106fb8]" />
                        </div>
                        <div className="group">
                            <label htmlFor="mobile" className="block text-sm font-semibold text-gray-700 mb-1 sm:mb-2 group-hover:text-[#106fb8] transition-colors duration-200">Mobile Number</label>
                            <input type="tel" id="mobile" name="mobile" required className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-[#106fb8] focus:ring-2 focus:ring-[#106fb8] focus:ring-opacity-50 transition duration-200 ease-in-out text-sm py-3 sm:py-3 px-3 sm:px-4 bg-gray-50 hover:bg-white group-hover:border-[#106fb8]" />
                        </div>
                        <div className="group">
                            <label htmlFor="stream" className="block text-sm font-semibold text-gray-700 mb-1 sm:mb-2 group-hover:text-[#106fb8] transition-colors duration-200">Stream</label>
                            <select id="stream" name="stream" required className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-[#106fb8] focus:ring-2 focus:ring-[#106fb8] focus:ring-opacity-50 transition duration-200 ease-in-out text-sm py-3 sm:py-3 px-3 sm:px-4 bg-gray-50 hover:bg-white appearance-none group-hover:border-[#106fb8]">
                                <option value="">Select a stream</option>
                                <option value="science">Science</option>
                                <option value="commerce">Commerce</option>
                                <option value="arts">Arts</option>
                            </select>
                        </div>
                        <div className="group">
                            <label htmlFor="class" className="block text-sm font-semibold text-gray-700 mb-1 sm:mb-2 group-hover:text-[#106fb8] transition-colors duration-200">Class</label>
                            <select id="class" name="class" required className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-[#106fb8] focus:ring-2 focus:ring-[#106fb8] focus:ring-opacity-50 transition duration-200 ease-in-out text-sm py-3 sm:py-3 px-3 sm:px-4 bg-gray-50 hover:bg-white appearance-none group-hover:border-[#106fb8]">
                                <option value="">Select a class</option>
                                <option value="8">8th</option>
                                <option value="9">9th</option>
                                <option value="10">10th</option>
                                <option value="11">11th</option>
                                <option value="12">12th</option>
                            </select>
                        </div>
                    </div>
                    <div className="group">
                        <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-1 sm:mb-2 group-hover:text-[#106fb8] transition-colors duration-200">Message</label>
                        <textarea id="message" name="message" rows="4" required className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-[#106fb8] focus:ring-2 focus:ring-[#106fb8] focus:ring-opacity-50 transition duration-200 ease-in-out text-sm py-3 sm:py-3 px-3 sm:px-4 bg-gray-50 hover:bg-white resize-none group-hover:border-[#106fb8]"></textarea>
                    </div>
                    <button type="submit" className="w-full bg-[#106fb8] text-white py-3 sm:py-4 px-4 sm:px-6 rounded-lg hover:bg-[#0e5d9e] focus:outline-none focus:ring-4 focus:ring-[#106fb8] focus:ring-opacity-50 transition duration-300 ease-in-out text-sm sm:text-base font-bold shadow-md hover:shadow-lg transform hover:scale-105">
                        Send Enquiry
                    </button>
                </form>
            </div>
        </>
    )
}
export default StudentEnquiryForm