"use client"
import { useState } from "react";
export default function TravelDiaries(){
    const [showMore, setShowMore] = useState(false)

    return(
        <section className="p-4 bg-gray-100">
            <h2 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-extrabold mb-2 sm:mb-4 md:mb-6 text-center text-gray-800 tracking-tight">Travel Diaries</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[200px] sm:auto-rows-[250px] md:auto-rows-[300px]">
                <div className="col-span-1 sm:col-span-2 row-span-2 rounded-xl overflow-hidden">
                    <img src="/course-photo/foundationStudents.jpg" alt="Featured travel moment" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"/>
                </div>
                {(showMore || window.innerWidth >= 640) && (
                    <>
                        <div className="rounded-xl overflow-hidden">
                            <img src="/course-photo/neetStudents.jpg" alt="Travel spot 1" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"/>
                        </div>
                        <div className="rounded-xl overflow-hidden">
                            <img src="/course-photo/cetStudents.jpg" alt="Travel spot 2" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"/>
                        </div>
                        <div className="rounded-xl overflow-hidden col-span-1 sm:col-span-2">
                            <img src="/course-photo/jeeStudents.jpg" alt="Travel spot 3" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"/>
                        </div>
                    </>
                )}
            </div>
            {window.innerWidth < 640 && !showMore && (
                <button 
                    onClick={() => setShowMore(true)}
                    className="mt-4 px-6 py-2 bg-[#1d77bc] text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Show More Images
                </button>
            )}
        </section>
    )
}