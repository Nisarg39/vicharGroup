"use client"
import { motion } from "framer-motion"
export default function TravelStories(){
    return(
        <div className="bg-gradient-to-b from-white to-gray-50 py-16">
            <div className="container mx-auto px-4">
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-12 text-gray-900 tracking-tight">Our Travel Stories</h2>
                <div className="overflow-x-auto md:overflow-x-visible">
                    <motion.div className="flex flex-row md:flex-row gap-6 p-6 min-h-[300px] md:min-h-[400px] xl:min-h-[500px] min-w-max md:min-w-0">
                        <motion.div 
                            className="relative overflow-hidden rounded-2xl shadow-lg w-[300px] md:w-auto group"
                            style={{ flex: 1 }}
                            whileHover={{ flex: 2 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                        >
                            <motion.img 
                                src="/course-photo/foundationStudentsCourse.jpg" 
                                alt="Success Story 1"
                                className="w-full h-[200px] sm:h-[300px] md:h-[350px] lg:h-full object-cover brightness-95 group-hover:brightness-100"
                                whileHover={{ scale: 1.05 }}
                                transition={{ duration: 0.4 }}
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                                <h3 className="text-white text-xl font-semibold">United We Are</h3>
                            </div>
                        </motion.div>
                        <motion.div 
                            className="relative overflow-hidden rounded-2xl shadow-lg w-[300px] md:w-auto group"
                            style={{ flex: 1 }}
                            whileHover={{ flex: 2 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                        >
                            <motion.img 
                                src="/neet-students/neetStudents.png" 
                                alt="Success Story 2"
                                className="w-full h-[200px] sm:h-[300px] md:h-[350px] lg:h-full object-cover brightness-95 group-hover:brightness-100"
                                whileHover={{ scale: 1.05 }}
                                transition={{ duration: 0.4 }}
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                                <h3 className="text-white text-xl font-semibold">NEET Success</h3>
                            </div>
                        </motion.div>
                        <motion.div 
                            className="relative overflow-hidden rounded-2xl shadow-lg w-[300px] md:w-auto group"
                            style={{ flex: 1 }}
                            whileHover={{ flex: 2 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                        >
                            <motion.img 
                                src="/jee-students/jeeStudents.png" 
                                alt="Success Story 3"
                                className="w-full h-[200px] sm:h-[300px] md:h-[350px] lg:h-full object-cover brightness-95 group-hover:brightness-100"
                                whileHover={{ scale: 1.05 }}
                                transition={{ duration: 0.4 }}
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                                <h3 className="text-white text-xl font-semibold">JEE Excellence</h3>
                            </div>
                        </motion.div>
                        <motion.div 
                            className="relative overflow-hidden rounded-2xl shadow-lg w-[300px] md:w-auto group"
                            style={{ flex: 1 }}
                            whileHover={{ flex: 2 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                        >
                            <motion.img 
                                src="/cet-students/cetStudents.png" 
                                alt="Success Story 4"
                                className="w-full h-[200px] sm:h-[300px] md:h-[350px] lg:h-full object-cover brightness-95 group-hover:brightness-100"
                                whileHover={{ scale: 1.05 }}
                                transition={{ duration: 0.4 }}
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                                <h3 className="text-white text-xl font-semibold">CET Champions</h3>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}