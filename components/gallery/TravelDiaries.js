"use client"
import { useState, useEffect } from "react";
import Image from "next/image";

export default function TravelDiaries(){
    return(
        <section className="p-4 bg-gray-100">
            <h2 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-extrabold mb-2 sm:mb-4 md:mb-6 text-center text-gray-800 tracking-tight">Travel Diaries</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[200px] sm:auto-rows-[250px] md:auto-rows-[300px]">
                <div className="col-span-1 sm:col-span-2 row-span-2 rounded-xl overflow-hidden relative">
                    <Image src="/course-photo/foundationStudentsCourse.jpg" alt="Featured travel moment" fill className="object-cover hover:scale-105 transition-transform duration-300"/>
                </div>
                <div className="rounded-xl overflow-hidden relative">
                    <Image src="/course-photo/neetStudents.jpg" alt="Travel spot 1" fill className="object-cover hover:scale-105 transition-transform duration-300"/>
                </div>
                <div className="rounded-xl overflow-hidden relative">
                    <Image src="/course-photo/cetStudents.jpg" alt="Travel spot 2" fill className="object-cover hover:scale-105 transition-transform duration-300"/>
                </div>
                <div className="rounded-xl overflow-hidden col-span-1 sm:col-span-2 relative">
                    <Image src="/course-photo/jeeStudents.jpg" alt="Travel spot 3" fill className="object-cover hover:scale-105 transition-transform duration-300"/>
                </div>
            </div>
        </section>
    )
}