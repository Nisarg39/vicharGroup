"use client"
import { motion } from "framer-motion"
export default function TravelStories(){
    return(
        <div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mt-8 mb-8">Travel Diaries</h2>
            <div className="overflow-x-auto md:overflow-x-visible">
                <motion.div className="flex flex-row md:flex-row gap-4 p-4 min-h-[300px] md:min-h-[400px] xl:min-h-[500px] min-w-max md:min-w-0">
                    <motion.div 
                        className="relative overflow-hidden rounded-xl w-[300px] md:w-auto"
                        style={{ flex: 1 }}
                        whileHover={{ flex: 2 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                    >
                        <motion.img 
                            src="/course-photo/foundationStudentsCourse.jpg" 
                            alt="Travel Story 1"
                            className="w-full h-[200px] sm:h-[300px] md:h-[350px] lg:h-full object-cover"
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.3 }}
                        />
                    </motion.div>
                    <motion.div 
                        className="relative overflow-hidden rounded-xl w-[300px] md:w-auto"
                        style={{ flex: 1 }}
                        whileHover={{ flex: 2 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                    >
                        <motion.img 
                            src="/course-photo/neetStudents.jpeg" 
                            alt="Travel Story 2"
                            className="w-full h-[200px] sm:h-[300px] md:h-[350px] lg:h-full object-cover"
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.3 }}
                        />
                    </motion.div>
                    <motion.div 
                        className="relative overflow-hidden rounded-xl w-[300px] md:w-auto"
                        style={{ flex: 1 }}
                        whileHover={{ flex: 2 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                    >
                        <motion.img 
                            src="/course-photo/jeeStudents.jpeg" 
                            alt="Travel Story 3"
                            className="w-full h-[200px] sm:h-[300px] md:h-[350px] lg:h-full object-cover"
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.3 }}
                        />
                    </motion.div>
                    <motion.div 
                        className="relative overflow-hidden rounded-xl w-[300px] md:w-auto"
                        style={{ flex: 1 }}
                        whileHover={{ flex: 2 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                    >
                        <motion.img 
                            src="/course-photo/cetStudents.jpeg" 
                            alt="Travel Story 4"
                            className="w-full h-[200px] sm:h-[300px] md:h-[350px] lg:h-full object-cover"
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.3 }}
                        />
                    </motion.div>
                </motion.div>
            </div>
        </div>
    )
}