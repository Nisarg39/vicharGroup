import Image from "next/image";

export default function TravelDiaries(){
    return(
        <section className="p-4 bg-gray-100">
            <h2 className="mt-12 text-3xl sm:text-4xl md:text-5xl font-extrabold mb-2 sm:mb-4 md:mb-6 text-center text-gray-800 tracking-tight">Travel Diaries</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 h-auto sm:h-[400px] md:h-[500px] lg:h-[600px] max-w-6xl mx-auto">
                <div className="col-span-1 sm:col-span-2 row-span-1 sm:row-span-2 relative rounded-xl overflow-hidden min-h-[200px]">
                    <Image
                        src="/course-photo/foundationStudentsCourse.jpg"
                        alt="Travel scene 1"
                        fill
                        unoptimized
                        className="object-cover hover:scale-105 transition-transform duration-300"
                    />
                </div>
                <div className="col-span-1 sm:col-span-2 relative rounded-xl overflow-hidden min-h-[200px]">
                    <Image
                        src="/course-photo/neetStudents.jpg"
                        alt="Travel scene 2"
                        fill
                        unoptimized
                        className="object-cover hover:scale-105 transition-transform duration-300"
                    />
                </div>
                <div className="relative rounded-xl overflow-hidden min-h-[200px]">
                    <Image
                        src="/course-photo/jeeStudents.jpg"
                        alt="Travel scene 3"
                        fill
                        unoptimized
                        className="object-cover hover:scale-105 transition-transform duration-300"
                    />
                </div>
                <div className="relative rounded-xl overflow-hidden min-h-[200px]">
                    <Image
                        src="/course-photo/cetStudents.jpg"
                        alt="Travel scene 4"
                        fill
                        unoptimized
                        className="object-cover hover:scale-105 transition-transform duration-300"
                    />
                </div>
                <div className="relative rounded-xl overflow-hidden min-h-[200px]">
                    <Image
                        src="/course-photo/dummyNeetStudents.jpg"
                        alt="Travel scene 5"
                        fill
                        unoptimized
                        className="object-cover hover:scale-105 transition-transform duration-300"
                    />
                </div>
                <div className="relative rounded-xl overflow-hidden min-h-[200px]">
                    <Image
                        src="/course-photo/studentsPicnic.jpeg"
                        alt="Travel scene 6"
                        fill    
                        unoptimized
                        className="object-cover hover:scale-105 transition-transform duration-300"
                    />
                </div>
                <div className="relative rounded-xl overflow-hidden min-h-[200px]">
                    <Image
                        src="/course-photo/purpleTstudents.jpg"
                        alt="Travel scene 7"
                        fill
                        unoptimized
                        className="object-cover hover:scale-105 transition-transform duration-300"
                    />
                </div>
                <div className="relative rounded-xl overflow-hidden min-h-[200px]">
                    <Image
                        src="/course-photo/blackTstudents.jpg"
                        alt="Travel scene 8"
                        fill
                        unoptimized
                        className="object-cover hover:scale-105 transition-transform duration-300"
                    />
                </div>
            </div>
        </section>
    )
}