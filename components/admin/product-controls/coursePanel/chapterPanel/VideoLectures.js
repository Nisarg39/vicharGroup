import React,{ useState, useEffect } from "react"
import { addLecture, showLectures, updateLecture, showTeachers, deleteLecture } from "../../../../../server_actions/actions/adminActions"
import LatexToolbar from './LatexToolbar'
import 'katex/dist/katex.min.css'
import { InlineMath } from 'react-katex'
import Select from 'react-select'
import { handleLatexConversion } from '../../../../../utils/latexConversion'

const customStyles = {
    option: (provided, state) => ({
        ...provided,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px'
    }),
    control: (provided) => ({
        ...provided,
        minHeight: '42px',
        padding: '2px'
    }),
    menu: (provided) => ({
        ...provided,
        zIndex: 9999
    }),
    singleValue: (provided) => ({
        ...provided,
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    })
}

const formatOptionLabel = ({ value, label, imageUrl }) => (
    <div className="flex items-center gap-2">
        {imageUrl && (
            <img 
                src={imageUrl} 
                alt={label} 
                className="w-6 h-6 rounded-full"
            />
        )}
        <span>{label}</span>
    </div>
)

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
    const [activeField, setActiveField] = useState(null)
    const [teacherOptions, setTeacherOptions] = useState([])

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
                // Transform teachers data into the format React-Select expects
                const options = response.teachers.map(teacher => ({
                    value: teacher._id,
                    label: teacher.name,
                    imageUrl: teacher.imageUrl
                }))
                setTeacherOptions(options)
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

    const handleExpressionSelect = (expression, field) => {
        if (field === 'title') {
            setTitle(prev => prev + expression)
        } else if (field === 'description') {
            setDescription(prev => prev + expression)
        } else if (field === 'editTitle') {
            const updatedLectures = [...lectures]
            const lectureIndex = lectures.findIndex(l => l._id === editingId)
            updatedLectures[lectureIndex].title += expression
            setLectures(updatedLectures)
        } else if (field === 'editDescription') {
            const updatedLectures = [...lectures]
            const lectureIndex = lectures.findIndex(l => l._id === editingId)
            updatedLectures[lectureIndex].description += expression
            setLectures(updatedLectures)
        }
    }

    const renderFormattedContent = (content) => {
        if (!content) return null
        
        // First split by new lines
        const lines = content.split('\n')
        
        return lines.map((line, lineIndex) => {
            // Split each line by special characters
            const parts = line.split(/(\$[^$]*\$|\*\*[^*]*\*\*|\*[^*]*\*)/g)
            
            const renderedLine = parts.map((part, index) => {
                if (part.startsWith('$') && part.endsWith('$')) {
                    const latex = part.slice(1, -1)
                    try {
                        return <InlineMath key={`${lineIndex}-${index}`} math={latex} />
                    } catch (error) {
                        return <span key={`${lineIndex}-${index}`}>{part}</span>
                    }
                } else if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={`${lineIndex}-${index}`}>{part.slice(2, -2)}</strong>
                } else if (part.startsWith('*') && part.endsWith('*')) {
                    return <em key={`${lineIndex}-${index}`}>{part.slice(1, -1)}</em>
                }
                return <span key={`${lineIndex}-${index}`}>{part}</span>
            })

            // Return each line with a line break
            return (
                <React.Fragment key={lineIndex}>
                    {renderedLine}
                    {lineIndex < lines.length - 1 && <br />}
                </React.Fragment>
            )
        })
    }

    return(
        <div>
            {activeField && (
                <LatexToolbar 
                    onSelectExpression={handleExpressionSelect}
                    targetField={activeField}
                />
            )}
            <div className="w-full mb-4">
                <div className="flex gap-4 mb-4">
                    <div className="w-1/6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number</label>
                        <input 
                            type="number" 
                            className="w-full p-2 border rounded"
                            placeholder="Enter serial number"
                            value={serialNumber}
                            onChange={(e) => setSerialNumber(e.target.value)}
                        />
                    </div>
                    <div className="w-5/6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <div className="relative">
                            <input 
                                type="text" 
                                className="w-full p-2 border rounded"
                                placeholder="Enter title"
                                value={title}
                                onChange={(e) => setTitle(handleLatexConversion(e.target.value))}
                                onFocus={() => setActiveField('title')}
                            />
                            <div className="mt-2 text-sm text-gray-600">
                                {renderFormattedContent(title)}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <div className="relative">
                        <textarea 
                            className="w-full p-2 border rounded resize-y min-h-[100px]"
                            placeholder="Enter description"
                            value={description}
                            onChange={(e) => setDescription(handleLatexConversion(e.target.value))}
                            onFocus={() => setActiveField('description')}
                        />
                        <div className="mt-2 text-sm text-gray-600">
                            {renderFormattedContent(description)}
                        </div>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="w-1/2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Video URL</label>
                        <input 
                            type="text" 
                            className="w-full p-2 border rounded"
                            placeholder="Enter video URL"
                            value={videoUrl}
                            onChange={(e) => setVideoUrl(e.target.value)}
                        />
                    </div>
                    <div className="w-1/2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Teacher</label>
                        <Select
                            styles={customStyles}
                            formatOptionLabel={formatOptionLabel}
                            options={teacherOptions}
                            value={teacherOptions.find(option => option.value === selectedTeacher)}
                            onChange={(option) => setSelectedTeacher(option.value)}
                            className="w-full"
                            placeholder="Select Teacher"
                            isClearable
                        />
                    </div>
                </div>
            </div>
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
                                    <div className="relative">
                                        <input 
                                            type="text"
                                            className="w-full p-1 border rounded"
                                            value={lecture.title}
                                            onChange={(e) => {
                                                const updatedLectures = [...lectures]
                                                updatedLectures[index].title = handleLatexConversion(e.target.value)
                                                setLectures(updatedLectures)
                                            }}
                                            onFocus={() => setActiveField('editTitle')}
                                        />
                                        <div className="mt-2 text-sm text-gray-600">
                                            {renderFormattedContent(lecture.title)}
                                        </div>
                                    </div>
                                ) : (
                                    <div>{renderFormattedContent(lecture.title)}</div>
                                )}
                            </td>
                            <td className="border p-2">
                                {editingId === lecture._id ? (
                                    <div className="relative">
                                        <input 
                                            type="text"
                                            className="w-full p-1 border rounded"
                                            value={lecture.description}
                                            onChange={(e) => {
                                                const updatedLectures = [...lectures]
                                                updatedLectures[index].description = handleLatexConversion(e.target.value)
                                                setLectures(updatedLectures)
                                            }}
                                            onFocus={() => setActiveField('editDescription')}
                                        />
                                        <div className="mt-2 text-sm text-gray-600">
                                            {renderFormattedContent(lecture.description)}
                                        </div>
                                    </div>
                                ) : (
                                    <div>{renderFormattedContent(lecture.description)}</div>
                                )}
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
                                    <Select
                                        styles={customStyles}
                                        formatOptionLabel={formatOptionLabel}
                                        options={teacherOptions}
                                        value={teacherOptions.find(option => option.value === selectedTeacher)}
                                        onChange={(option) => setSelectedTeacher(option.value)}
                                        className="w-full"
                                        placeholder="Select Teacher"
                                        isClearable
                                    />
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