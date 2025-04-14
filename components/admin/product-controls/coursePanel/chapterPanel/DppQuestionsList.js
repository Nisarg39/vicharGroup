import { useState } from "react"
import DppQuestionUpdate from "./DppQuestionUpdate"

export default function DppQuestionsList({ dpp}) {
    const [editingIndex, setEditingIndex] = useState(null)

    const handleEdit = (index) => {
        setEditingIndex(index === editingIndex ? null : index)
    }

    const updateQuestion = (updatedQuestion) => {
        const updatedDppQuestions = dpp.dppQuestions.map((question, index) => {
            if (index === editingIndex) {
                return { ...question, ...updatedQuestion }
            }
            return question
        })
        dpp.dppQuestions = updatedDppQuestions
        setEditingIndex(null)
    }
    return(
        <div className="space-y-6 p-6 bg-gray-50">
            {dpp.dppQuestions.map((question, index) => (
                <div key={index} className="bg-white shadow-md rounded-lg p-6 transition-all duration-200 hover:shadow-lg">
                    <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">Question {index + 1}</span>
                                <span className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full">
                                    {question.answerMultiple?.length > 0 ? 'Multiple Choice' : question.answerObjective ? 'Objective' : question.answerNumeric ? 'Numeric' : 'Not Specified'}
                                </span>
                            </div>
                            <p className="text-gray-800 text-lg mb-4">{question.question}</p>
                            
                            {question.answerMultiple?.length > 0 && (
                                <div className="space-y-4">
                                    <div className="bg-gray-50 p-4 rounded-md">
                                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Multiple Choice Answer</h4>
                                        <ul className="space-y-2">
                                            {question.answerMultiple.map((option, i) => (
                                                <li key={i} className="text-gray-600">{option}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-md">
                                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Options</h4>
                                        <ul className="space-y-2">
                                            {question.multipleObjective?.map((option, i) => (
                                                <li key={i} className="text-gray-600">{option.text || option.option}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}
                            
                            {question.answerObjective && (
                                <div className="space-y-4">
                                    <div className="bg-gray-50 p-4 rounded-md">
                                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Objective Answer</h4>
                                        <p className="text-gray-600">{question.answerObjective}</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-md">
                                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Options</h4>
                                        <ul className="space-y-2">
                                            {question.objectiveoptions?.map((option, i) => (
                                                <li key={i} className="text-gray-600">{option.text || option.option}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}
                            
                            {question.answerNumeric && (
                                <div className="bg-gray-50 p-4 rounded-md">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Numeric Answer</h4>
                                    <p className="text-gray-600">{question.answerNumeric}</p>
                                </div>
                            )}
                        </div>
                        <button 
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                            onClick={() => handleEdit(index)}
                        >
                            Edit
                        </button>
                    </div>
                </div>
            ))}
            
            {editingIndex !== null && (
                <div className="mt-16 fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-4 w-11/12 max-h-[90%] overflow-y-auto relative">
                        <button
                            onClick={() => setEditingIndex(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 z-50"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <DppQuestionUpdate 
                            dpp={dpp}
                            question={dpp.dppQuestions[editingIndex]} 
                            onClose={() => setEditingIndex(null)}
                            updateQuestion={updateQuestion}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}