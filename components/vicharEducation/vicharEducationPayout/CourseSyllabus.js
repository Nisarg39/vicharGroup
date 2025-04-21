import Image from "next/image"
import { useState } from "react"

export default function CourseSyllabus({ subjectsArray }) {
    const [activeTab, setActiveTab] = useState(0)

    console.log(subjectsArray);

    return (
        <div className="w-full bg-white p-2">
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6 text-start">Course Syllabus</h1>
            
            <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-6 md:mb-8">
                <div className="w-full max-w-3xl bg-gray-100 rounded-xl p-2 md:p-3">
                    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 md:gap-3">
                        {subjectsArray.map((subject, index) => (
                            <button
                                key={index}
                                className={`relative flex flex-col items-center p-2 md:p-3 rounded-lg transition-all duration-300 ${
                                    activeTab === index 
                                    ? 'bg-gradient-to-br from-[#1d77bc] to-[#155c91] text-white shadow-lg transform scale-105' 
                                    : 'bg-white text-gray-700 hover:bg-gray-100 hover:shadow-md'
                                }`}
                                onClick={() => setActiveTab(index)}
                            >
                                {subject.image && (
                                    <div className={`relative w-10 h-10 md:w-12 md:h-12 mb-2 rounded-full overflow-hidden ${activeTab === index ? 'ring-4 ring-[#1d77bc]/30' : 'ring-2 ring-gray-200'}`}>
                                        <Image 
                                            src={subject.image} 
                                            alt={subject.name} 
                                            fill
                                            sizes="(max-width: 48px) 100vw, 48px"
                                            className="object-cover"
                                        />
                                    </div>
                                )}
                                <span className={`text-sm md:text-base font-semibold text-center ${activeTab === index ? 'text-white' : 'text-gray-800'}`}>
                                    {subject.name}
                                </span>
                                <div className={`mt-1 px-2 md:px-3 py-0.5 rounded-full text-xs font-medium ${
                                    activeTab === index 
                                    ? 'bg-white/20 text-white' 
                                    : 'bg-[#1d77bc]/10 text-[#1d77bc]'
                                }`}>
                                    {subject.chapters.length} chapters
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:gap-4">
                {subjectsArray[activeTab] && subjectsArray[activeTab].chapters.map((chapter, index) => (
                    <div key={index} className="flex items-center bg-gray-100 from-gray-50 to-white rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 p-2 border border-gray-100 hover:border-gray-600 group">
                        <div className="relative w-10 h-10 md:w-16 md:h-16 flex-shrink-0 bg-white rounded-lg p-2 shadow-sm group-hover:shadow-md transition-all duration-300">
                            <Image 
                                src={chapter.image} 
                                alt={chapter.chapterName} 
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 25vw"
                                className="object-contain p-1 group-hover:scale-105 transition-transform duration-300"
                            />
                        </div>
                        <div className="ml-2 md:ml-4 flex-grow">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs md:text-base font-semibold text-gray-800 mb-1 group-hover:text-gray-600 transition-colors duration-300 flex items-center">
                                    <span className="text-sm md:text-lg font-bold mr-2 text-gray-600">Ch {index + 1} : </span>
                                    {chapter.chapterName}
                                </h3>
                                <div className="flex gap-2">
                                    {chapter.lectures && (
                                        <span className="text-xs font-medium text-gray-600 bg-white px-2.5 py-1 rounded-full shadow-md border border-gray-200 transform hover:translate-y-[-1px] transition-transform duration-200">
                                            {chapter.lectures.length} Lectures
                                        </span>
                                    )}
                                    {chapter.dpps && (
                                        <span className="text-xs font-medium text-gray-600 bg-white px-2.5 py-1 rounded-full shadow-md border border-gray-200 transform hover:translate-y-[-1px] transition-transform duration-200">
                                            {chapter.dpps.length} DPPs
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}