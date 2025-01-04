export default function TravelStories(){
    return(
        <div>
            <h2 className="text-5xl font-bold text-center mt-8 mb-8">Travel Diaries</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 min-h-[400px] md:min-h-[600px] xl:min-h-[800px]">
                <div className="col-span-1 sm:col-span-2 lg:col-span-2 row-span-1 sm:row-span-2 relative overflow-hidden rounded-xl">
                    <img 
                        src="/course-photo/foundationStudentsCourse.jpg" 
                        alt="Travel Story 1"
                        className="w-full h-[250px] sm:h-[400px] md:h-[500px] lg:h-full object-cover"
                    />
                </div>
                <div className="relative overflow-hidden rounded-xl">
                    <img 
                        src="/course-photo/neetStudents.jpg" 
                        alt="Travel Story 2"
                        className="w-full h-[200px] sm:h-[250px] md:h-[300px] lg:h-full object-cover"
                    />
                </div>
                <div className="relative overflow-hidden rounded-xl">
                    <img 
                        src="/course-photo/jeeStudents.jpg" 
                        alt="Travel Story 3"
                        className="w-full h-[200px] sm:h-[250px] md:h-[300px] lg:h-full object-cover"
                    />
                </div>
                <div className="relative overflow-hidden rounded-xl">
                    <img 
                        src="/course-photo/cetStudents.jpg" 
                        alt="Travel Story 4"
                        className="w-full h-[200px] sm:h-[250px] md:h-[300px] lg:h-full object-cover"
                    />
                </div>
            </div>
        </div>
    )
}