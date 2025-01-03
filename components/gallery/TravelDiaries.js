import Image from "next/image";

export default function TravelDiaries(){
    return(
        <section className="p-4 bg-gray-100">
            <h2 className="mt-12 text-3xl sm:text-4xl md:text-5xl font-extrabold mb-2 sm:mb-4 md:mb-6 text-center text-gray-800 tracking-tight">Travel Diaries</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 h-auto sm:h-[400px] md:h-[500px] lg:h-[600px] max-w-6xl mx-auto">
                <div className="col-span-1 sm:col-span-2 row-span-1 sm:row-span-2 relative rounded-xl overflow-hidden min-h-[200px]">
                    <img
                        src="/course-photo/foundationStudentsCourse.jpg"
                        alt="Travel scene 1"
                        className="object-cover hover:scale-105 transition-transform duration-300 w-full h-full absolute"
                    />
                </div>
                <div className="col-span-1 sm:col-span-2 relative rounded-xl overflow-hidden min-h-[200px]">
                    <img
                        src="/course-photo/neetStudents.jpg"
                        alt="Travel scene 2"
                        className="object-cover hover:scale-105 transition-transform duration-300 w-full h-full absolute"
                    />
                </div>
                <div className="relative rounded-xl overflow-hidden min-h-[200px]">
                    <img
                        src="/course-photo/jeeStudents.jpg"
                        alt="Travel scene 3"
                        className="object-cover hover:scale-105 transition-transform duration-300 w-full h-full absolute"
                    />
                </div>
                <div className="relative rounded-xl overflow-hidden min-h-[200px]">
                    <img
                        src="/course-photo/cetStudents.jpg"
                        alt="Travel scene 4"
                        className="object-cover hover:scale-105 transition-transform duration-300 w-full h-full absolute"
                    />
                </div>
            </div>
        </section>
    )
}