import { useState } from "react";
import { addDpp, updateDpp, deleteDpp } from "../../../../../server_actions/actions/adminActions";
import { useAdminAccess } from "../../../../../hooks/useAdminAccess";
import DppQuestion from "./DppQuestion";
import DppQuestionsList from "./DppQuestionsList";

export default function Dpp({chapter, productType}){
    const { isAdmin, isLoading } = useAdminAccess()
    const [serialNumber, setSerialNumber] = useState('')
    const [name, setName] = useState('')
    const [dppCode, setDppCode] = useState('')
    const [activeDropdown, setActiveDropdown] = useState(null)
    const [editingDpp, setEditingDpp] = useState(null)
    const [editSerialNumber, setEditSerialNumber] = useState('')
    const [editName, setEditName] = useState('')
    const [editDppCode, setEditDppCode] = useState('')
    const [dpps, setDpps] = useState(chapter.dpps)
    const [expandedQuestionDpp, setExpandedQuestionDpp] = useState(null)
    const [expandedDpp, setExpandedDpp] = useState(null)

    console.log(productType)
    const handleAddDpp = async() => {
        if (!serialNumber.trim()) {
            alert('Serial Number is required')
            return
        }
        if (!name.trim()) {
            alert('Name is required')
            return
        }
        if (!dppCode.trim()) {
            alert('DPP Code is required')
            return
        }

        const details = {
            serialNumber,
            name,
            dppCode,
            chapterId: chapter._id
        }
        const response = await addDpp(details)
        if(response.success){
            alert(response.message)
            setSerialNumber('')
            setName('')
            setDppCode('')
            if(!dpps) {
                setDpps([response.dpp])
            }
            else{
                setDpps([...dpps, response.dpp])
            }
        } else {
            alert(response.message)
        }
    }

    const handleEdit = (dpp) => {
        setEditingDpp(dpp)
        setEditSerialNumber(dpp.serialNumber)
        setEditName(dpp.name)
        setEditDppCode(dpp.dppCode)
        setActiveDropdown(null) 
    }

    const handleSave = async() => {

        const details = {
            serialNumber: editSerialNumber,
            name: editName,
            dppCode: editDppCode,
            _id: editingDpp._id
        }
        const response = await updateDpp(details)
        if(response.success){
            alert(response.message)
            const updatedDpps = dpps.map(dpp => 
                dpp._id === editingDpp._id ? 
                {...dpp, serialNumber: editSerialNumber, name: editName, dppCode: editDppCode} : 
                dpp
            )
            setDpps(updatedDpps)
        } else {
            alert(response.message)
        }
        setEditingDpp(null)
    }

    const toggleDppQuestions = (dpp) => {
        // Close the question form if it's open
        setExpandedQuestionDpp(null)
        
        // Toggle the questions list view
        setExpandedDpp(expandedDpp === dpp._id ? null : dpp._id)
        setActiveDropdown(null)
    }

    const handleAddQuestions = (dpp) => {
        // Close the questions list view if it's open
        setExpandedDpp(null)
        
        // Open the add question form
        setExpandedQuestionDpp(dpp)
        setActiveDropdown(null)
    }

    const handleDelete = async(dppId) => {
        // Add confirmation dialog
        const confirmDelete = window.confirm("Are you sure you want to delete this DPP? This action cannot be undone.")
        
        if (!confirmDelete) {
            setActiveDropdown(null)
            return
        }
        
        const details = {
            dppId: dppId,
            chapterId: chapter._id
        }
        const response = await deleteDpp(details)
        if(response.success){
            alert(response.message)
            const updatedDpps = dpps.filter(dpp => dpp._id !== dppId)
            setDpps(updatedDpps)
        } else {
            alert(response.message)
        }
        setActiveDropdown(null)
    }
    const addedQuestion = (dppQuestion) => {
        console.log('Added Question:', dppQuestion)
        // Here you can update the dpp with the new question
        setDpps((prevDpps) => {
            return prevDpps.map((dpp) => {
                if (dpp._id === expandedQuestionDpp._id) {
                    return {
                        ...dpp,
                        dppQuestions: [...dpp.dppQuestions, dppQuestion],
                    };
                }
                return dpp;
            });
        });
    }

    const closeQuestionForm = () => {
        setExpandedQuestionDpp(null);
    }

    return(
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">{productType === "course" ? "Add Daily Practice Problems" : "Add Master The Concept Question"}</h1>
            <div className="flex items-center space-x-4">
                <div className="flex flex-col flex-1">
                    <label className="text-sm font-medium text-gray-700 mb-1">Serial Number</label>
                    <input 
                        type="text" 
                        placeholder="Enter serial number" 
                        value={serialNumber}
                        onChange={(e) => setSerialNumber(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="flex flex-col flex-1">
                    <label className="text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input 
                        type="text" 
                        placeholder="Enter name" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="flex flex-col flex-1">
                    <label className="text-sm font-medium text-gray-700 mb-1">{productType === "course" ? "DPP Code" : "MTC Code"}</label>
                    <input 
                        type="text" 
                        placeholder={productType === "course" ? "Enter DPP Code" : "Enter MTC Code"}
                        value={dppCode}
                        onChange={(e) => setDppCode(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <button 
                    onClick={handleAddDpp}
                    className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 font-medium mt-6 flex items-center"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    {productType === "course" ? "Add DPP" : "Add MTC"}
                </button>
            </div>

            <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">{productType === "course" ? "Existing DPPs" : "Existing MTCs"}</h2>
                <table className="min-w-full bg-white border border-gray-300">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="py-2 px-4 border-b text-left">Serial Number</th>
                            <th className="py-2 px-4 border-b text-left">Name</th>
                            <th className="py-2 px-4 border-b text-left">{productType === "course" ? "DPP Code" : "MTC Code"}</th>
                            <th className="py-2 px-4 border-b text-left">Questions</th>
                            <th className="py-2 px-4 border-b text-left">Options</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dpps?.map((dpp, index) => (
                            <>
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="py-2 px-4 border-b">
                                        {editingDpp === dpp ? (
                                            <input
                                                type="text"
                                                value={editSerialNumber}
                                                onChange={(e) => setEditSerialNumber(e.target.value)}
                                                className="w-full px-2 py-1 border rounded"
                                            />
                                        ) : dpp.serialNumber}
                                    </td>
                                    <td className="py-2 px-4 border-b">
                                        {editingDpp === dpp ? (
                                            <input
                                                type="text"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className="w-full px-2 py-1 border rounded"
                                            />
                                        ) : dpp.name}
                                    </td>
                                    <td className="py-2 px-4 border-b">
                                        {editingDpp === dpp ? (
                                            <input
                                                type="text"
                                                value={editDppCode}
                                                onChange={(e) => setEditDppCode(e.target.value)}
                                                className="w-full px-2 py-1 border rounded"
                                            />
                                        ) : dpp.dppCode}
                                    </td>
                                    <td className="py-2 px-4 border-b">
                                        {dpp.dppQuestions?.length || 0} Questions
                                    </td>
                                    <td className="py-2 px-4 border-b relative">
                                        {editingDpp === dpp ? (
                                            <button
                                                onClick={handleSave}
                                                className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                                            >
                                                Save
                                            </button>
                                        ) : (
                                            <>
                                                <button 
                                                    onClick={() => setActiveDropdown(activeDropdown === index ? null : index)}
                                                    className="p-1 hover:bg-gray-100 rounded-full"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                                    </svg>
                                                </button>
                                                {activeDropdown === index && (
                                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                                                        <div className="py-1">
                                                            <button 
                                                                onClick={() => handleEdit(dpp)}
                                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button 
                                                                onClick={() => handleAddQuestions(dpp)}
                                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                            >
                                                                Add Questions
                                                            </button>
                                                            <button 
                                                                onClick={() => toggleDppQuestions(dpp)}
                                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                            >
                                                                {expandedDpp === dpp._id ? 'Hide Questions' : 'View Questions'}
                                                            </button>
                                                            {!isLoading && isAdmin && (
                                                                <button 
                                                                    onClick={() => handleDelete(dpp._id)}
                                                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                                                >
                                                                    Delete
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </td>
                                </tr>
                                {expandedDpp === dpp._id && (
                                    <tr>
                                        <td colSpan="5" className="p-4 border-b">
                                            <DppQuestionsList dpp={dpp}/>
                                        </td>
                                    </tr>
                                )}
                                {expandedQuestionDpp && expandedQuestionDpp._id === dpp._id && (
                                    <tr>
                                        <td colSpan="5" className="p-4 border-b">
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <div className="flex justify-between items-center mb-4">
                                                    <h2 className="text-xl font-bold">{productType === "course" ? "Add Question to DPP" : "Add Question to MTC"}</h2>
                                                    <button 
                                                        onClick={closeQuestionForm}
                                                        className="text-gray-500 hover:text-gray-700"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </div>
                                                <DppQuestion dpp={dpp} addedQuestion={addedQuestion}/>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}