"use client"
import { CldUploadButton } from 'next-cloudinary';
import { useState, useEffect } from 'react';
import { addExercise, showExercise, deleteExercise } from '../../../../../server_actions/actions/adminActions';

export default function ChapterExercise({chapter}){
    const [uploadPreset, setUploadPreset] = useState();
    const [uploadUrl, setUploadUrl] = useState("");
    const [exerciseName, setExerciseName] = useState("");
    const [exercises, setExercises] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function fetchExercises() {
        const response = await showExercise(chapter._id);
        setExercises(response.exercises);
    }

    useEffect(() => {
        setUploadPreset(process.env.NEXT_PUBLIC_CLOUDINARY_PRESET_NAME);
        setExerciseName("");
        setUploadUrl("");
        fetchExercises();
    }, [chapter._id])

    const handlepdfUploaded = (result) => {
        if (result?.info?.secure_url) {
            setUploadUrl(result.info.secure_url);
        }else{
            console.error("Unexpected result structure:", result);
        }
    }

    const handleSubmit = async () => {
       setIsSubmitting(true);
       const details ={
        chapterId: chapter._id,
        pdfUrl: uploadUrl,
        exerciseName: exerciseName
       }
       try {
           const response = await addExercise(details);
           if(response.success){
               alert( response.message )
               setUploadUrl("");
               setExerciseName("");
               fetchExercises();
           }else{
               alert( response.message || "Error adding exercise" )
           }
       } finally {
           setIsSubmitting(false);
       }
    }

    const handleDelete = async(exerciseId) => {
        const confirmDelete = confirm("Are you sure you want to delete this exercise?");
        if (confirmDelete) {
            const details = {
                exerciseId: exerciseId,
                chapterId: chapter._id
            }
            const response = await deleteExercise(details);
            if(response.success){
                alert( response.message )
                fetchExercises();
            }else{
                alert( response.message || "Error deleting exercise" )
            }
        }
    }
    
    return(
        <div className="min-h-screen bg-gray-50 p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-8">Chapter Exercises</h2>
                
                {uploadUrl && (
                    <div className="mb-8 bg-blue-50 p-4 rounded-xl">
                        <p className="text-sm text-blue-600 mb-2">PDF uploaded successfully</p>
                        <a 
                            href={uploadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-5 rounded-lg transition-all duration-200 shadow-sm hover:shadow"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm6.293-7.707a1 1 0 011.414 0L12 10.586V4a1 1 0 112 0v6.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            Preview PDF
                        </a>
                    </div>
                )}

                {uploadPreset ? (
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                            <input
                                type="text"
                                value={exerciseName}
                                onChange={(e) => setExerciseName(e.target.value)}
                                placeholder="Enter exercise name"
                                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                            />
                            <CldUploadButton
                                uploadPreset={uploadPreset}
                                options={{
                                    maxFiles: 1,
                                    resourceType: "raw",
                                    allowedFormats: ["pdf"]
                                }}
                                onSuccess={handlepdfUploaded}
                                onError={(error) => console.error("Upload failed:", error)}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-5 rounded-lg transition-all duration-200 shadow-sm hover:shadow flex items-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                                Upload PDF
                            </CldUploadButton>
                            <button
                                onClick={handleSubmit}
                                disabled={!uploadUrl || !exerciseName || isSubmitting}
                                className={`${!uploadUrl || !exerciseName || isSubmitting ? 'bg-gray-300 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'} text-white font-medium py-2.5 px-5 rounded-lg transition-all duration-200 shadow-sm hover:shadow flex items-center justify-center min-w-[100px]`}
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-gray-600 p-6 bg-gray-50 rounded-xl text-center border border-gray-200">
                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p>Loading upload button... (Check if NEXT_PUBLIC_CLOUDINARY_PRESET_NAME is set)</p>
                    </div>
                )}

                <div className="mt-12">
                    <h3 className="text-xl font-semibold text-gray-800 mb-6">Uploaded Exercises</h3>
                    {exercises.length > 0 ? (
                        <div className="grid gap-4 sm:grid-cols-2">
                            {exercises.map((exercise, index) => (
                                <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow duration-200">
                                    <h4 className="font-semibold text-gray-800 mb-3">{exercise.exerciseName}</h4>
                                    <div className="flex items-center justify-between">
                                        <a 
                                            href={exercise.pdfUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm6.293-7.707a1 1 0 011.414 0L12 10.586V4a1 1 0 112 0v6.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                            View PDF
                                        </a>
                                        <button
                                            onClick={() => handleDelete(exercise._id)}
                                            className="text-red-600 hover:text-red-700 font-medium"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-gray-600">No exercises uploaded yet.</p>
                        </div>
                    )}
                </div>
        </div>
    )
}