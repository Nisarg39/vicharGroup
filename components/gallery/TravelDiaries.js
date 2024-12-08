import Image from "next/image";

export default function TravelDiaries(){
    return(
        <section className="p-4 bg-gray-100">
            <h2 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-extrabold mb-2 sm:mb-4 md:mb-6 text-center text-gray-800 tracking-tight">Travel Diaries</h2>
            <div className="grid grid-cols-4 grid-rows-3 gap-4 h-[600px] max-w-6xl mx-auto">
                <div className="col-span-2 row-span-2 relative rounded-xl overflow-hidden">
                    <Image
                        src="/course-photo/foundationStudentsCourse.jpg"
                        alt="Travel scene 1"
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-300"
                    />
                </div>
                <div className="col-span-2 relative rounded-xl overflow-hidden">
                    <Image
                        src="/course-photo/neetStudents.jpg"
                        alt="Travel scene 2"
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-300"
                    />
                </div>
                <div className="relative rounded-xl overflow-hidden">
                    <Image
                        src="/course-photo/jeeStudents.jpg"
                        alt="Travel scene 3"
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-300"
                    />
                </div>
                <div className="relative rounded-xl overflow-hidden">
                    <Image
                        src="/course-photo/cetStudents.jpg"
                        alt="Travel scene 4"
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-300"
                    />
                </div>
                <div className="relative rounded-xl overflow-hidden">
                    <Image
                        src="/course-photo/dummyNeetStudents.jpg"
                        alt="Travel scene 5"
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-300"
                    />
                </div>
                <div className="relative rounded-xl overflow-hidden">
                    <Image
                        src="/course-photo/studentsPicnic.jpeg"
                        alt="Travel scene 6"
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-300"
                    />
                </div>
                <div className="relative rounded-xl overflow-hidden">
                    <Image
                        src="/course-photo/purpleTstudents.jpg"
                        alt="Travel scene 7"
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-300"
                    />
                </div>
                <div className="relative rounded-xl overflow-hidden">
                    <Image
                        src="/course-photo/blackTstudents.jpg"
                        alt="Travel scene 8"
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-300"
                    />
                </div>
            </div>
        </section>
    )
}