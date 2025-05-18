import React, { useState, useEffect } from "react"
import DppQuestionUpdate from "./DppQuestionUpdate"
import { InlineMath, BlockMath } from 'react-katex'
import 'katex/dist/katex.min.css'
import { deleteDppQuestion } from "../../../../../server_actions/actions/adminActions"

export default function DppQuestionsList({ dpp }) {
    const [editingIndex, setEditingIndex] = useState(null)
    const [questions, setQuestions] = useState([])
    
    useEffect(() => {
        if (dpp && dpp.dppQuestions) {
            setQuestions([...dpp.dppQuestions])
        }
    }, [dpp])
    
    const handleEdit = (index) => {
        setEditingIndex(index === editingIndex ? null : index)
    }

    const handleDelete = async(id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this question?")
        if (!confirmDelete) return
       const response = await deleteDppQuestion(id)
       if(response.success){
           setQuestions(prevQuestions => prevQuestions.filter(question => question._id !== id))
           alert(response.message)
       } else {
           alert(response.message)
       }
    }

    const updateQuestion = (updatedQuestion) => {
        setQuestions(prevQuestions => 
            prevQuestions.map((question, index) => {
                if (index === editingIndex) {
                    return { ...question, ...updatedQuestion }
                }
                return question
            })
        )
        setEditingIndex(null)
    }
    
    const renderFormattedText = (text) => {
        if (!text || typeof text !== 'string') return ''
        
        try {
            const lines = text.split('\n')
            
            if (lines.length === 1) {
                return processTextFormatting(text)
            }
            
            return (
                <>
                    {lines.map((line, lineIndex) => (
                        <React.Fragment key={`line-${lineIndex}`}>
                            {lineIndex > 0 && <br />}
                            {processTextFormatting(line)}
                        </React.Fragment>
                    ))}
                </>
            )
        } catch (error) {
            console.error("Rendering error:", error)
            return <span className="text-red-500">Error rendering formatted text: {error.message}</span>
        }
    }

    const processTextFormatting = (text) => {
        if (!text) return ''
        
        try {
            const tokens = []
            let currentText = ''
            let inBold = false
            let inItalic = false
            let inLatex = false
            let i = 0
            
            while (i < text.length) {
                if (i + 1 < text.length && text[i] === '*' && text[i + 1] === '*') {
                    if (currentText) {
                        tokens.push({
                            type: inBold ? 'bold' : inItalic ? 'italic' : 'text',
                            content: currentText
                        })
                        currentText = ''
                    }
                    
                    inBold = !inBold
                    i += 2
                    continue
                }
                
                if (text[i] === '*' && (i + 1 >= text.length || text[i + 1] !== '*')) {
                    if (currentText) {
                        tokens.push({
                            type: inBold ? 'bold' : inItalic ? 'italic' : 'text',
                            content: currentText
                        })
                        currentText = ''
                    }
                    
                    inItalic = !inItalic
                    i += 1
                    continue
                }
                
                if (text[i] === '$' && !inLatex) {
                    if (currentText) {
                        tokens.push({
                            type: inBold ? 'bold' : inItalic ? 'italic' : 'text',
                            content: currentText
                        })
                        currentText = ''
                    }
                    
                    const startIndex = i + 1
                    let endIndex = text.indexOf('$', startIndex)
                    
                    if (endIndex === -1) {
                        currentText += text[i]
                        i++
                        continue
                    }
                    
                    const latexContent = text.substring(startIndex, endIndex)
                    tokens.push({
                        type: 'latex',
                        content: latexContent
                    })
                    
                    i = endIndex + 1
                    continue
                }
                
                currentText += text[i]
                i++
            }
            
            if (currentText) {
                tokens.push({
                    type: inBold ? 'bold' : inItalic ? 'italic' : 'text',
                    content: currentText
                })
            }
            
            return tokens.map((token, index) => {
                if (token.type === 'latex') {
                    return <InlineMath key={`latex-${index}`} math={token.content} />
                } else if (token.type === 'bold') {
                    return <strong key={`bold-${index}`}>{token.content}</strong>
                } else if (token.type === 'italic') {
                    return <em key={`italic-${index}`}>{token.content}</em>
                } else {
                    return <span key={`text-${index}`}>{token.content}</span>
                }
            })
        } catch (error) {
            console.error("Formatting error:", error)
            return <span className="text-red-500">Error formatting text: {error.message}</span>
        }
    }

    return(
        <div className="space-y-6 p-6 bg-gray-50">
            {questions.map((question, index) => (
                <div key={index}>
                    <div className="bg-white shadow-md rounded-lg p-6 transition-all duration-200 hover:shadow-lg">
                        <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">Question {index + 1}</span>
                                    <span className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full">
                                        {question.answerMultiple?.length > 0 ? 'Multiple Choice' : question.answerObjective ? 'Objective' : question.answerNumeric ? 'Numeric' : 'Not Specified'}
                                    </span>
                                </div>
                                {question.isQuestionImage ? 
                                    <img src={question.question} alt={`Question ${index + 1}`} className="max-w-full h-auto rounded-md mb-4" /> :
                                    <p className="text-gray-800 text-lg mb-4">{renderFormattedText(question.question)}</p>
                                }
                                
                                {question.answerMultiple?.length > 0 && (
                                    <div className="space-y-4">
                                        <div className="bg-gray-50 p-4 rounded-md">
                                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Multiple Choice Answer</h4>
                                            <ul className="space-y-2">
                                                {question.answerMultiple?.map((option, i) => (
                                                    <li key={i} className="text-gray-600">
                                                        {option.isImage ? 
                                                            <img src={option.value || option} alt={`Answer option ${i+1}`} className="max-w-full h-auto rounded-md" /> : 
                                                            renderFormattedText(option.value || option)}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-md">
                                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Options</h4>
                                            <ul className="space-y-2">
                                                {question.multipleObjective?.map((option, i) => (
                                                    <li key={i} className="text-gray-600">
                                                        {option.isImage ? 
                                                            <img src={option.text || option.option} alt={`Option ${i+1}`} className="max-w-full h-auto rounded-md" /> : 
                                                            renderFormattedText(option.text || option.option)}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}
                                
                                {question.answerObjective && (
                                    <div className="space-y-4">
                                        <div className="bg-gray-50 p-4 rounded-md">
                                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Objective Answer</h4>
                                            {question.isAnswerImage ? 
                                                <img src={question.answerObjective} alt="Answer" className="max-w-full h-auto rounded-md" /> : 
                                                <p className="text-gray-600">{renderFormattedText(question.answerObjective)}</p>
                                            }
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-md">
                                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Options</h4>
                                            <ul className="space-y-2">
                                                {question.objectiveoptions?.map((option, i) => (
                                                    <li key={i} className="text-gray-600">
                                                        {option.isImage ? 
                                                            <img src={option.text || option.option} alt={`Option ${i+1}`} className="max-w-full h-auto rounded-md" /> : 
                                                            renderFormattedText(option.text || option.option)}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}
                                
                                {question.answerNumeric && (
                                    <div className="bg-gray-50 p-4 rounded-md">
                                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Numeric Answer</h4>
                                        {question.isAnswerImage ? 
                                            <img src={question.answerNumeric} alt="Numeric Answer" className="max-w-full h-auto rounded-md" /> :
                                            <p className="text-gray-600">{renderFormattedText(question.answerNumeric.toString())}</p>
                                        }
                                    </div>
                                )}
                                {question.solutionPdf && (
                                    <div className="bg-gray-50 p-4 rounded-md mt-4">
                                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Solution</h4>
                                        <a 
                                            href={question.solutionPdf}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm6.293-7.707a1 1 0 011.414 0L12 10.586V4a1 1 0 112 0v6.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                            View Solution PDF
                                        </a>
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                                    onClick={() => handleEdit(index)}
                                >
                                    {editingIndex === index ? 'Cancel Edit' : 'Edit'}
                                </button>
                                <button 
                                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                                    onClick={() => handleDelete(question._id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    {editingIndex === index && (
                        <div className="mt-4 mb-8 bg-white border border-blue-200 rounded-lg p-6 shadow-md">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-800">Edit Question {index + 1}</h3>
                                <button
                                    onClick={() => setEditingIndex(null)}
                                    className="text-gray-400 hover:text-gray-500"
                                >
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <DppQuestionUpdate 
                                dpp={dpp}
                                question={questions[index]} 
                                onClose={() => setEditingIndex(null)}
                                updateQuestion={updateQuestion}
                            />
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}