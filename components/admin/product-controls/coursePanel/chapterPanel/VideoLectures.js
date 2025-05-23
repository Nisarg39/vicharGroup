import { useState, useEffect } from "react"
import { addLecture, showLectures, updateLecture, showTeachers, deleteLecture } from "../../../../../server_actions/actions/adminActions"

export default function VideoLectures({chapter}){
    const [serialNumber, setSerialNumber] = useState('')
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [videoUrl, setVideoUrl] = useState('')
    const [lectures, setLectures] = useState([])
    const [editingId, setEditingId] = useState(null)
    const [isSaving, setIsSaving] = useState(false)
    const [teachers, setTeachers] = useState([])
    const [selectedTeacher, setSelectedTeacher] = useState('')

    useEffect(() => {
        const fetchLectures = async() => {
            const response = await showLectures({chapterId: chapter._id})
            if(response.success){
                setLectures(response.chapter.lectures)
            }else{
                alert(response.message)
            }
        }
        const fetchTeachers = async() => {
            const response = await showTeachers()
            if(response.success){
                setTeachers(response.teachers)
            }else{
                alert(response.message)
            }
        }
        fetchLectures()
        fetchTeachers()
    }, [])

    const handleAddLecture = async() => {
        const details = {
            serialNumber,
            title,
            description,
            videoUrl,
            teacher: selectedTeacher,
            chapterId: chapter._id
        }
        const response = await addLecture(details)
        if(response.success){
            alert(response.message)
            setSerialNumber('')
            setTitle('')
            setDescription('')
            setVideoUrl('')
            setSelectedTeacher('')
            const lectureResponse = await showLectures({chapterId: chapter._id})
            if(lectureResponse.success){
                setLectures(lectureResponse.chapter.lectures)
            }
        }else{
            alert(response.message)
        }
    }

    const handleEdit = (lecture) => {
        setEditingId(lecture._id)
    }

    const handleSaveEdit = async (lecture) => {
        setIsSaving(true)
        const details = {
            lectureId: lecture._id,
            serialNumber: lecture.serialNumber,
            title: lecture.title,
            description: lecture.description,
            videoUrl: lecture.videoUrl,
            teacher: selectedTeacher,
        }
        const response = await updateLecture(details)
        if(response.success){
            alert(response.message)
            const lectureResponse = await showLectures({chapterId: chapter._id})
            if(lectureResponse.success){
                setLectures(lectureResponse.chapter.lectures)
            }
        }else{
            alert(response.message)
        }
        setIsSaving(false)
        setEditingId(null)
    }

    const handleDelete = async(lectureId) => {
        const details = {
            lectureId: lectureId,
            chapterId: chapter._id
        }
        
        // Confirmation dialog can be added here
        if(confirm("Are you sure you want to delete this lecture?")) {
            const response = await deleteLecture(details)
            if(response.success){
                alert(response.message)
                const lectureResponse = await showLectures({chapterId: chapter._id})
                if(lectureResponse.success){
                    setLectures(lectureResponse.chapter.lectures)
                }
            }else{
                alert(response.message)
            }
        }
    }

    return(
        <div>
            <table className="w-full h-full border-collapse">
                <thead>
                    <tr>
                        <th className="border p-2">Serial Number</th>
                        <th className="border p-2">Title</th>
                        <th className="border p-2">Description</th>
                        <th className="border p-2">Video URL</th>
                        <th className="border p-2">Teacher</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="border p-2">
                            <input 
                                type="number" 
                                className="w-full p-1 border rounded"
                                placeholder="Enter serial number"
                                value={serialNumber}
                                onChange={(e) => setSerialNumber(e.target.value)}
                            />
                        </td>
                        <td className="border p-2">
                            <input 
                                type="text" 
                                className="w-full p-1 border rounded"
                                placeholder="Enter title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </td>
                        <td className="border p-2">
                            <input 
                                type="text" 
                                className="w-full p-1 border rounded"
                                placeholder="Enter description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </td>
                        <td className="border p-2">
                            <input 
                                type="text" 
                                className="w-full p-1 border rounded"
                                placeholder="Enter video URL"
                                value={videoUrl}
                                onChange={(e) => setVideoUrl(e.target.value)}
                            />
                        </td>
                        <td className="border p-2">
                            <select
                                className="w-full p-1 border rounded"
                                value={selectedTeacher}
                                onChange={(e) => setSelectedTeacher(e.target.value)}
                            >
                                <option value="">Select Teacher</option>
                                {teachers.map((teacher) => (
                                    <option key={teacher._id} value={teacher._id} className="flex items-center gap-2">
                                        {teacher.image && <img src={teacher.image} alt={teacher.name} className="w-6 h-6 rounded-full inline mr-2" />}
                                        {teacher.name}
                                    </option>
                                ))}
                            </select>
                        </td>
                    </tr>
                </tbody>
            </table>
            <button 
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center gap-2"
                onClick={handleAddLecture}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Lecture
            </button>
            <table className="w-full h-full border-collapse mt-8">
                <thead>
                    <tr>
                        <th className="border p-2">Serial Number</th>
                        <th className="border p-2">Title</th>
                        <th className="border p-2">Description</th>
                        <th className="border p-2">Video URL</th>
                        <th className="border p-2">Teacher</th>
                        <th className="border p-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {lectures.map((lecture, index) => (
                        <tr key={index}>
                            <td className="border p-2">
                                {editingId === lecture._id ? (
                                    <input 
                                        type="number"
                                        className="w-full p-1 border rounded"
                                        value={lecture.serialNumber}
                                        onChange={(e) => {
                                            const updatedLectures = [...lectures]
                                            updatedLectures[index].serialNumber = e.target.value
                                            setLectures(updatedLectures)
                                        }}
                                    />
                                ) : lecture.serialNumber}
                            </td>
                            <td className="border p-2">
                                {editingId === lecture._id ? (
                                    <input 
                                        type="text"
                                        className="w-full p-1 border rounded"
                                        value={lecture.title}
                                        onChange={(e) => {
                                            const updatedLectures = [...lectures]
                                            updatedLectures[index].title = e.target.value
                                            setLectures(updatedLectures)
                                        }}
                                    />
                                ) : lecture.title}
                            </td>
                            <td className="border p-2">
                                {editingId === lecture._id ? (
                                    <input 
                                        type="text"
                                        className="w-full p-1 border rounded"
                                        value={lecture.description}
                                        onChange={(e) => {
                                            const updatedLectures = [...lectures]
                                            updatedLectures[index].description = e.target.value
                                            setLectures(updatedLectures)
                                        }}
                                    />
                                ) : lecture.description}
                            </td>
                            <td className="border p-2">
                                {editingId === lecture._id ? (
                                    <input 
                                        type="text"
                                        className="w-full p-1 border rounded"
                                        value={lecture.videoUrl}
                                        onChange={(e) => {
                                            const updatedLectures = [...lectures]
                                            updatedLectures[index].videoUrl = e.target.value
                                            setLectures(updatedLectures)
                                        }}
                                    />
                                ) : lecture.videoUrl}
                            </td>
                            <td className="border p-2">
                                {editingId === lecture._id ? (
                                    <select
                                    className="w-full p-1 border rounded"
                                    value={selectedTeacher}
                                    onChange={(e) => setSelectedTeacher(e.target.value)}
                                >
                                    <option value="">Select Teacher</option>
                                    {teachers.map((teacher) => (
                                        <option key={teacher._id} value={teacher._id} className="flex items-center gap-2">
                                            {teacher.image && <img src={teacher.image} alt={teacher.name} className="w-6 h-6 rounded-full inline mr-2" />}
                                            {teacher.name}
                                        </option>
                                    ))}
                                </select>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        {lecture.teacher && lecture.teacher.imageUrl && (
                                            <img 
                                                src={lecture.teacher.imageUrl} 
                                                alt={lecture.teacher.name}
                                                className="w-6 h-6 rounded-full"
                                            />
                                        )}
                                        {lecture.teacher ? lecture.teacher.name : 'No teacher assigned'}
                                    </div>
                                )}
                            </td>
                            <td className="border p-2 flex gap-2">
                                {editingId === lecture._id ? (
                                    <button 
                                        className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 disabled:bg-green-300"
                                        onClick={() => handleSaveEdit(lecture)}
                                        disabled={isSaving}
                                    >
                                        {isSaving ? 'Saving...' : 'Save'}
                                    </button>
                                ) : (
                                    <>
                                        <button 
                                            className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                                            onClick={() => handleEdit(lecture)}
                                        >
                                            Edit
                                        </button>
                                        <button 
                                            className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                                            onClick={() => handleDelete(lecture._id)}
                                        >
                                            Delete
                                        </button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}