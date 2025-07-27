import { useState, useEffect } from "react"
import { getAllSubjectsAcrossProducts, addExistingSubjectToProduct } from "../../../../server_actions/actions/adminActions"

export default function SharedSubjectSelector({ product, onSubjectAdded }) {
    const [allSubjects, setAllSubjects] = useState([])
    const [filteredSubjects, setFilteredSubjects] = useState([])
    const [searchTerm, setSearchTerm] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [isAdding, setIsAdding] = useState(false)

    useEffect(() => {
        if (showModal) {
            fetchAllSubjects()
        }
    }, [showModal])

    useEffect(() => {
        if (searchTerm) {
            const filtered = allSubjects.filter(subject => 
                subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                subject.subjectCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                subject.productName.toLowerCase().includes(searchTerm.toLowerCase())
            )
            setFilteredSubjects(filtered)
        } else {
            setFilteredSubjects(allSubjects)
        }
    }, [searchTerm, allSubjects])

    const fetchAllSubjects = async () => {
        setIsLoading(true)
        const result = await getAllSubjectsAcrossProducts(product._id)
        if (result.success) {
            setAllSubjects(result.subjects)
        } else {
            alert("Error fetching subjects")
        }
        setIsLoading(false)
    }

    const handleAddSubject = async (subjectId) => {
        setIsAdding(true)
        const result = await addExistingSubjectToProduct({
            subjectId: subjectId,
            productId: product._id
        })
        
        if (result.success) {
            const chaptersInfo = result.chaptersCount ? ` with ${result.chaptersCount} chapters` : ""
            alert(`Subject added successfully${chaptersInfo}`)
            setShowModal(false)
            
            // Add a small delay to ensure database operations are completed
            setTimeout(() => {
                onSubjectAdded() // Refresh the parent component
            }, 500)
        } else {
            alert(result.message || "Error adding subject")
        }
        setIsAdding(false)
    }

    return (
        <>
            <button 
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center gap-2"
                onClick={() => setShowModal(true)}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Existing Subject
            </button>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Add Existing Subject</h3>
                            <button 
                                className="text-gray-500 hover:text-gray-700"
                                onClick={() => setShowModal(false)}
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="Search subjects by name, code, or course..."
                                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {isLoading ? (
                            <div className="text-center py-4">Loading subjects...</div>
                        ) : (
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {filteredSubjects.length === 0 ? (
                                    <div className="text-center py-4 text-gray-500">
                                        {searchTerm ? "No subjects found matching your search" : "No subjects available from other courses"}
                                    </div>
                                ) : (
                                    filteredSubjects.map((subject) => (
                                        <div key={subject._id} className="border rounded p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <img 
                                                    src={subject.image} 
                                                    alt={subject.name} 
                                                    className="w-12 h-12 object-cover rounded"
                                                />
                                                <div>
                                                    <h4 className="font-semibold">{subject.name}</h4>
                                                    <p className="text-sm text-gray-600">{subject.description}</p>
                                                    <p className="text-xs text-gray-500">
                                                        Code: {subject.subjectCode} | From: {subject.productName}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
                                                onClick={() => handleAddSubject(subject._id)}
                                                disabled={isAdding}
                                            >
                                                {isAdding ? "Adding..." : "Add"}
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        <div className="mt-6 flex justify-end">
                            <button 
                                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                                onClick={() => setShowModal(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}