import { useState, useEffect } from "react"
import { addSubject, showSubjects, updateSubject } from "../../../../server_actions/actions/adminActions"
import SubjectDetails from "./SubjectDetails"
import SharedSubjectSelector from "./SharedSubjectSelector"

export default function CourseDetails({product, setProductSelected}){
    const [subjectName, setSubjectName] = useState("")
    const [subjectDescription, setSubjectDescription] = useState("")
    const [imageUrl, setImageUrl] = useState("")
    const [subjectCode, setSubjectCode] = useState("")
    const [subjects, setSubjects] = useState([])
    const [editingSubject, setEditingSubject] = useState(null)
    const [isSaving, setIsSaving] = useState(false)
    const [selectedSubject, setSelectedSubject] = useState(null)
    
    useEffect(() => {
        fetchSubjects()
    }, [])

    const fetchSubjects = async () => {
        const result = await showSubjects(product._id)
        if(result.success) {
            setSubjects(result.subjects)
        }else{
            alert("Error in fetching subjects")
        }
    }
    
    const handleAddSubject = async() => {
        if (!subjectCode.trim()) {
            alert("Subject code is required")
            return
        }
        if (!subjectName.trim()) {
            alert("Subject name is required")
            return
        }
        if (!subjectDescription.trim()) {
            alert("Subject description is required")
            return
        }
        if (!imageUrl.trim()) {
            alert("Image URL is required")
            return
        }

        const details={
            name: subjectName,
            description: subjectDescription,
            image: imageUrl,
            productId: product._id,
            subjectCode: subjectCode
        }
        const addSubjectDetails = await addSubject(details)
        if(addSubjectDetails.success){
            alert("subject added")
            setSubjectName("")
            setSubjectDescription("")
            setImageUrl("")
            setSubjectCode("")
            fetchSubjects()
        }else{
            alert("There was a problem - subject not added")
        }
    }

    const handleSaveSubject = async() => {
        setIsSaving(true)
        const updatedCode = document.getElementById('editSubjectCode').value
        const updatedName = document.getElementById('editSubjectName').value
        const updatedDescription = document.getElementById('editSubjectDescription').value
        const updatedImage = document.getElementById('editSubjectImage').value
        
        const details = {
            id: editingSubject,
            subjectCode: updatedCode,
            name: updatedName,
            description: updatedDescription,
            image: updatedImage,
        }

        const updateSubjectDetails = await updateSubject(details)
        if(updateSubjectDetails.success){
            alert("Subject updated successfully")
            fetchSubjects()
        }else{
            alert("Error in updating subject")
        }
        setIsSaving(false)
        setEditingSubject(null)
    }
    
    return(
        <div className="h-full w-full">
            <div className="p-4 border rounded-lg shadow">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold">Course Details</h2>
                    <button 
                        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 flex items-center gap-2"
                        onClick={() => setProductSelected({})}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                        Back
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    <img src={product.image} alt={product.name} className="w-24 h-24 object-cover rounded"/>
                    <h3 className="text-2xl font-semibold">{product.name}</h3>
                </div>
                <h4 className="text-md font-medium mt-4 mb-2">Fill this form to add subject</h4>
                <div className="flex items-center gap-2 mt-4">
                    <input 
                        type="text" 
                        placeholder="Subject code" 
                        className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={subjectCode}
                        onChange={(e) => setSubjectCode(e.target.value)}
                    />
                    <input 
                        type="text" 
                        placeholder="Subject name" 
                        className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={subjectName}
                        onChange={(e) => setSubjectName(e.target.value)}
                    />
                    <input 
                        type="text" 
                        placeholder="Subject description" 
                        className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
                        value={subjectDescription}
                        onChange={(e) => setSubjectDescription(e.target.value)}
                    />
                    <input 
                        type="text" 
                        placeholder="Image URL" 
                        className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                    />
                    <button 
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2"
                        onClick={handleAddSubject}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Add New Subject
                    </button>
                    <SharedSubjectSelector 
                        product={product} 
                        onSubjectAdded={fetchSubjects}
                    />
                </div>
            </div>
            <div className="mt-8 p-4 border rounded-lg shadow">
                <h2 className="text-2xl font-bold mb-4">Subjects</h2>
                <div className="grid grid-cols-1 gap-4">
                    {subjects.map((subject) => (
                        <div key={subject._id}>
                            <div className="p-4 border rounded-lg cursor-pointer" onClick={() => setSelectedSubject(selectedSubject === subject ? null : subject)}>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <img src={subject.image} alt={subject.name} className="w-16 h-16 object-cover rounded"/>
                                        <div>
                                            <h3 className="text-lg font-semibold">{subject.name}</h3>
                                            <p className="text-gray-600">{subject.description}</p>
                                            <p className="text-sm text-gray-500">Code: {subject.subjectCode}</p>
                                            <p className="text-sm text-gray-500">Chapters: {subject.chapters.length}</p>
                                            <p className="text-xs text-blue-500 italic mt-1">Click here to see more details</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setEditingSubject(subject._id)
                                            }}
                                        >
                                            Edit
                                        </button>
                                    </div>
                                </div>
                                {editingSubject === subject._id && (
                                    <div className="space-y-4 mt-4 border-t pt-4">
                                        <input 
                                            type="text" 
                                            defaultValue={subject.subjectCode}
                                            className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                                            placeholder="Subject code"
                                            id="editSubjectCode"
                                        />
                                        <input 
                                            type="text" 
                                            defaultValue={subject.name}
                                            className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                                            placeholder="Subject name"
                                            id="editSubjectName"
                                        />
                                        <input 
                                            type="text" 
                                            defaultValue={subject.description}
                                            className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                                            placeholder="Subject description"
                                            id="editSubjectDescription"
                                        />
                                        <input 
                                            type="text" 
                                            defaultValue={subject.image}
                                            className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                                            placeholder="Image URL"
                                            id="editSubjectImage"
                                        />
                                        <div className="flex gap-2">
                                            <button 
                                                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-green-300"
                                                onClick={handleSaveSubject}
                                                disabled={isSaving}
                                            >
                                                {isSaving ? 'Saving...' : 'Save'}
                                            </button>
                                            <button 
                                                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                                                onClick={() => setEditingSubject(null)}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                            {selectedSubject && selectedSubject._id === subject._id && (
                                <div className="mt-2">
                                    <SubjectDetails subject={selectedSubject} setSubjects={setSubjects} productType={product.type}  />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}