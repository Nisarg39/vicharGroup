import { useState } from "react"
import { addChapter, updateChapter, deleteChapter } from "../../../../server_actions/actions/adminActions"
import VideoLectures from "./chapterPanel/VideoLectures"
import Dpp from "./chapterPanel/Dpp"
import ChapterExercise from "./chapterPanel/ChapterExercise"

export default function SubjectDetiails({subject, setSubjects, productType}){
    const [subjectDetails, setSubjectDetails] = useState(subject)
    const [serialNumber, setSerialNumber] = useState('')
    const [chapterName, setChapterName] = useState('')
    const [imageUrl, setImageUrl] = useState('')
    const [editingChapter, setEditingChapter] = useState(null)
    const [editSerialNumber, setEditSerialNumber] = useState('')
    const [editChapterName, setEditChapterName] = useState('')
    const [editImageUrl, setEditImageUrl] = useState('')
    const [isSaving, setIsSaving] = useState(false)
    const [isAddingChapter, setIsAddingChapter] = useState(false)
    const [expandedChapter, setExpandedChapter] = useState(null)
    const [selectedComponent, setSelectedComponent] = useState('video')

    const handleAddChapter = async() => {
        if (!serialNumber || !chapterName || !imageUrl) {
            alert("Please fill all fields")
            return
        }
        setIsAddingChapter(true)
        const details = {
            serialNumber,
            chapterName,
            image: imageUrl,
            subjectId: subjectDetails._id,
        }
        const response = await addChapter(details)
        if(response.success){
            alert("Chapter added successfully")
            setSubjectDetails(prev => ({
                ...prev,
                chapters: [...prev.chapters, response.chapter]
            }))
            setSerialNumber('')
            setChapterName('')
            setImageUrl('')
        }else{
            alert("Error in adding chapter")
        }
        setIsAddingChapter(false)
    }

    const handleEdit = (chapter) => {
        setEditingChapter(chapter._id)
        setEditSerialNumber(chapter.serialNumber)
        setEditChapterName(chapter.chapterName)
        setEditImageUrl(chapter.image)
    }

    const handleSave = async(chapterId) => {
        if (!editSerialNumber || !editChapterName || !editImageUrl) {
            alert("Please fill all fields")
            return
        }
        setIsSaving(true)
        const details  = {
            id: chapterId,
            serialNumber: editSerialNumber,
            chapterName: editChapterName,
            image: editImageUrl
        }
        const response = await updateChapter(details)
        if(response.success){
            alert("Chapter updated successfully")
            setSubjectDetails(prev => ({
                ...prev,
                chapters: prev.chapters.map(chapter => 
                    chapter._id === chapterId ? {
                        ...chapter,
                        serialNumber: editSerialNumber,
                        chapterName: editChapterName,
                        image: editImageUrl
                    } : chapter
                )
            }))
        }else{
            alert("Error in updating chapter")
        }
        setIsSaving(false)
        setEditingChapter(null)
    }

    const toggleExpand = (chapterId) => {
        if (expandedChapter === chapterId) {
            setExpandedChapter(null)
            setSelectedComponent('video')
        } else {
            setExpandedChapter(chapterId)
            setSelectedComponent('video')
        }
    }

    const handleDelete = async(chapterId) => {
        if(confirm("Are you sure you want to delete this chapter?")){
            const response = await deleteChapter(chapterId)
            if(response.success){
                alert(response.message)
                setSubjectDetails(prev => ({
                    ...prev,
                    chapters: prev.chapters.filter(chapter => chapter._id !== chapterId)
                }))
            }else{
                alert(response.message)
            }
        }
    }

    return(
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
            <div className="flex gap-4">
                <input
                    type="number"
                    placeholder="Serial Number"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    className="p-2 border border-gray-300 rounded-lg w-32"
                />
                <input
                    type="text"
                    placeholder="Chapter Name"
                    value={chapterName}
                    onChange={(e) => setChapterName(e.target.value)}
                    className="p-2 border border-gray-300 rounded-lg flex-1"
                />
                <input
                    type="url"
                    placeholder="Image URL"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="p-2 border border-gray-300 rounded-lg flex-1"
                />
                <button
                    onClick={handleAddChapter}
                    disabled={isAddingChapter}
                    className={`${isAddingChapter ? 'bg-blue-300' : 'bg-blue-500 hover:bg-blue-600'} text-white px-4 py-2 rounded-lg whitespace-nowrap flex items-center gap-2`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    {isAddingChapter ? 'Adding Chapter...' : 'Add Chapter'}
                </button>
            </div>
            <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">{subjectDetails.chapters.length} Chapters</h2>
                {subjectDetails.chapters && subjectDetails.chapters.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                        {subjectDetails.chapters.map((chapter) => (
                            <div key={chapter._id} className="border border-gray-200 rounded-lg">
                                {editingChapter === chapter._id ? (
                                    <div className="flex gap-2 p-4">
                                        <input
                                            type="number"
                                            value={editSerialNumber}
                                            onChange={(e) => setEditSerialNumber(e.target.value)}
                                            className="p-2 border border-gray-300 rounded-lg w-20"
                                        />
                                        <input
                                            type="text"
                                            value={editChapterName}
                                            onChange={(e) => setEditChapterName(e.target.value)}
                                            className="p-2 border border-gray-300 rounded-lg flex-1"
                                        />
                                        <input
                                            type="url"
                                            value={editImageUrl}
                                            onChange={(e) => setEditImageUrl(e.target.value)}
                                            className="p-2 border border-gray-300 rounded-lg w-64"
                                        />
                                        <button
                                            onClick={() => handleSave(chapter._id)}
                                            disabled={isSaving}
                                            className={`${isSaving ? 'bg-green-300' : 'bg-green-500 hover:bg-green-600'} text-white px-3 py-1 rounded-lg`}
                                        >
                                            {isSaving ? 'Saving...' : 'Save'}
                                        </button>
                                        <button
                                            onClick={() => setEditingChapter(null)}
                                            disabled={isSaving}
                                            className="bg-gray-500 text-white px-3 py-1 rounded-lg hover:bg-gray-600"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-4 p-4">
                                            <span className="font-medium text-gray-600">#{chapter.serialNumber}</span>
                                            <img 
                                                src={chapter.image} 
                                                alt={chapter.chapterName} 
                                                className="h-12 w-12 object-cover rounded-lg"
                                            />
                                            <span className="font-medium">{chapter.chapterName}</span>
                                            <div className="ml-auto flex gap-2">
                                                <button
                                                    onClick={() => handleEdit(chapter)}
                                                    className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(chapter._id)}
                                                    className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => toggleExpand(chapter._id)}
                                            className="text-sm text-blue-500 hover:text-blue-600 pb-2 px-4 text-left"
                                        >
                                            Click here to know more
                                        </button>

                                        {expandedChapter === chapter._id && productType === 'course' && (
                                            <div className="p-4 border-t">
                                                <div className="flex gap-4 mb-4">
                                                    <button 
                                                        onClick={() => setSelectedComponent('video')}
                                                        className={`px-4 py-2 rounded-full flex items-center gap-2 ${selectedComponent === 'video' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                                                        </svg>
                                                        Video Lectures
                                                    </button>
                                                    <button 
                                                        onClick={() => setSelectedComponent('dpp')}
                                                        className={`px-4 py-2 rounded-full flex items-center gap-2 ${selectedComponent === 'dpp' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                                            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                                                        </svg>
                                                        DPP
                                                    </button>
                                                    <button 
                                                        onClick={() => setSelectedComponent('exercise')}
                                                        className={`px-4 py-2 rounded-full flex items-center gap-2 ${selectedComponent === 'exercise' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                            <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                                                            <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                                                        </svg>
                                                        Exercise
                                                    </button>
                                                </div>
                                                {selectedComponent === 'video' && <VideoLectures chapter={chapter} />}
                                                {selectedComponent === 'dpp' && <Dpp chapter={chapter} productType={productType}/>}
                                                {selectedComponent === 'exercise' && <ChapterExercise chapter={chapter} />}
                                            </div>
                                        )}

                                        {expandedChapter === chapter._id && productType === 'mtc' && (
                                            <div className="p-4 border-t">
                                                <Dpp chapter={chapter} productType={productType} />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500">No chapters available</p>
                )}
            </div>
        </div>
    )
}