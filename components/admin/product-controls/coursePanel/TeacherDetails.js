"use client"
import ImageUpload from "../../../common/ImageUpload"
import { addTeacher, showTeachers } from "../../../../server_actions/actions/adminActions";
import { useEffect, useState } from "react";
import LoadingSpinner from "../../../common/LoadingSpinner";

export default function TeacherDetails() {

    const [teacherName, setTeacherName] = useState("");
    const [teacherImage, setTeacherImage] = useState("");
    const [teacherBio, setTeacherBio] = useState("");
    const [teachers, setTeachers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    async function fetchTeachers() {
        const response = await showTeachers();
        setTeachers(response.teachers);
        setIsLoading(false);
    }

    useEffect(() => {
        fetchTeachers();
    }, [])

    const handleImageUploaded = (url) => {
        setTeacherImage(url);
    }

    const handleSubmit = async () => {
        const details = {
            name: teacherName,
            imageUrl: teacherImage,
            bio: teacherBio
        }
        const response = await addTeacher(details)
        if(response.success) {
            alert(response.message)
            setTeacherName("")
            setTeacherImage("")
            setTeacherBio("")
            fetchTeachers()
        }else{
            alert(response.message)
        }
    }


    const isFormValid = teacherName && teacherImage && teacherBio;

    return(
        <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-lg shadow-md p-4">
                    <h2 className="text-2xl font-bold mb-4 text-gray-800">Teacher Details</h2>
                    <div className="space-y-3">
                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700 mb-1">Teacher Name</label>
                            <input 
                                type="text" 
                                placeholder="Enter teacher's full name" 
                                value={teacherName}
                                onChange={(e) => setTeacherName(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700 mb-1">Teacher Bio</label>
                            <textarea 
                                placeholder="Write a brief description about the teacher" 
                                value={teacherBio}
                                onChange={(e) => setTeacherBio(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors min-h-[100px]"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700 mb-1">Teacher Photo</label>
                            <ImageUpload onImageUploaded={(url) => handleImageUploaded(url, "teacher")} />
                            {teacherImage && (
                                <div className="mt-2">
                                    <img 
                                        src={teacherImage} 
                                        alt="Teacher" 
                                        className="w-32 h-32 object-cover rounded-full border border-gray-200" 
                                    />
                                </div>
                            )}
                        </div>
                        <div className="mt-4">
                            <button 
                                onClick={handleSubmit}
                                disabled={!isFormValid}
                                className={`w-full py-2 px-4 rounded-md text-white font-medium transition-colors ${
                                    isFormValid 
                                        ? 'bg-blue-600 hover:bg-blue-700' 
                                        : 'bg-gray-400 cursor-not-allowed'
                                }`}
                            >
                                Save Teacher Details
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-4">
                    <h2 className="text-2xl font-bold mb-4 text-gray-800">Teachers List</h2>
                    <div className="space-y-4">
                        {isLoading ? (
                            <LoadingSpinner />
                        ) : teachers.length === 0 ? (
                            <p className="text-gray-500 text-center">No teachers added yet</p>
                        ) : (
                            teachers.map((teacher, index) => (
                                <div key={index} className="bg-gray-50 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center space-x-4">
                                        <img 
                                            src={teacher.imageUrl} 
                                            alt={teacher.name} 
                                            className="w-20 h-20 object-cover rounded-full border-2 border-gray-200 flex-shrink-0"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-semibold text-gray-800 truncate">{teacher.name}</h3>
                                            <p className="text-gray-600 text-sm mt-1 line-clamp-3">{teacher.bio}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
