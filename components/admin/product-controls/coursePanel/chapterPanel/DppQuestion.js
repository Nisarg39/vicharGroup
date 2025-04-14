import {useState, useEffect} from 'react'
import { addDppQuestion } from '../../../../../server_actions/actions/adminActions'
import 'katex/dist/katex.min.css'
import { InlineMath, BlockMath } from 'react-katex'

export default function DppQuestion({dpp, addedQuestion}){
    const [showOptions, setShowOptions] = useState(false)
    const [selectedType, setSelectedType] = useState(dpp?.type || '')
    const [serialNumber, setSerialNumber] = useState('')
    const [questionText, setQuestionText] = useState('')
    const [options, setOptions] = useState({A: '', B: '', C: '', D: ''})
    const [numericAnswer, setNumericAnswer] = useState('')
    const [imageUrls, setImageUrls] = useState({A: false, B: false, C: false, D: false})
    const [answer, setAnswer] = useState('')
    const [isQuestionImage, setIsQuestionImage] = useState(false)
    const [responseMessage, setResponseMessage] = useState('')
    const [responseStatus, setResponseStatus] = useState('')
    const [previewError, setPreviewError] = useState('')

    const handleTypeChange = (e) => {
        setSelectedType(e.target.value)
        setShowOptions(e.target.value === 'objective' || e.target.value === 'multiple')
    }

    const validateInputs = () => {
        if (!serialNumber || serialNumber <= 0) {
            throw new Error('Please enter a valid serial number')
        }
        if (!questionText.trim()) {
            throw new Error('Question text is required')
        }
        if (!selectedType) {
            throw new Error('Please select a question type')
        }
        if (selectedType === 'numeric') {
            if (!numericAnswer || isNaN(numericAnswer)) {
                throw new Error('Please enter a valid numeric answer')
            }
        }
        if (selectedType === 'objective' || selectedType === 'multiple') {
            const emptyOptions = Object.values(options).some(opt => !opt.trim())
            if (emptyOptions) {
                throw new Error('All options must be filled')
            }
            if (!answer) {
                throw new Error('Please select an answer')
            }
            if (selectedType === 'multiple' && !answer.split(',').filter(a => a.trim()).length) {
                throw new Error('Please select at least one correct answer for multiple choice')
            }
        }
    }

    const handleAddQuestion = async() => {
        try {
            validateInputs()

            const formattedOptions = Object.entries(options).map(([option, text]) => ({
                option,
                text,
                isImage: imageUrls[option]
            }))

            const questionData = {
                dppId: dpp._id,
                serialNumber: Number(serialNumber),
                question: questionText,
                questionType: isQuestionImage ? 'image' : 'text',
                objectiveoptions: selectedType === 'objective' ? formattedOptions : undefined,
                multipleObjective: selectedType === 'multiple' ? formattedOptions : undefined,
                answerObjective: selectedType === 'objective' ? answer : undefined,
                answerMultiple: selectedType === 'multiple' ? answer.split(',').map(a => a.trim()) : undefined,
                answerNumeric: selectedType === 'numeric' ? Number(numericAnswer) : undefined,
            }

            const response = await addDppQuestion(questionData)
            setResponseMessage(response?.message || 'Operation completed')
            setResponseStatus('success')
            alert('Question added successfully')
            addedQuestion(response?.dppQuestion)
        } catch (error) {
            setResponseMessage(error?.message || 'An error occurred')
            setResponseStatus('error')
            alert('Failed to add question')
        }

        setTimeout(() => {
            setResponseMessage('')
            setResponseStatus('')
        }, 3000)
    }

    const handleOptionChange = (option, value) => {
        setOptions(prev => ({...prev, [option]: value}))
    }

    const handleImageUrlChange = (option) => {
        setImageUrls(prev => ({...prev, [option]: !prev[option]}))
    }

    const handleAnswerChange = (option) => {
        if (selectedType === 'multiple') {
            const answers = answer.split(',').filter(a => a.trim())
            if (answers.includes(option)) {
                setAnswer(answers.filter(a => a !== option).join(','))
            } else {
                setAnswer([...answers, option].join(','))
            }
        } else {
            setAnswer(option)
        }
    }

    const renderWithLatex = (text) => {
        if (!text) return ''
        
        try {
            const parts = text.split(/(\$.*?\$)/g)
            
            return (
                <>
                    {parts.map((part, index) => {
                        if (part.startsWith('$') && part.endsWith('$')) {
                            const latex = part.slice(1, -1);
                            return <InlineMath key={index} math={latex} />
                        }
                        return <span key={index}>{part}</span>
                    })}
                </>
            )
        } catch (error) {
            return <span className="text-red-500">Error rendering LaTeX: {error.message}</span>
        }
    }

    return(
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="space-y-6">
                {responseMessage && (
                    <div className={`p-3 rounded-md ${responseStatus === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {responseMessage}
                    </div>
                )}
                
                <div className="flex justify-end">
                    <button 
                        type="button"
                        className="text-blue-500 hover:text-blue-700 text-sm"
                        onClick={() => alert("Use $ symbols to wrap LaTeX expressions. For example: $\\frac{1}{2}$ will render as a fraction.")}
                    >
                        LaTeX Help
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input 
                        type="number" 
                        placeholder="Serial Number"
                        required
                        value={serialNumber}
                        onChange={(e) => setSerialNumber(e.target.value)}
                        className="md:col-span-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="md:col-span-3">
                        <textarea 
                            placeholder="Question (Use $ symbols to wrap LaTeX expressions, e.g. $\frac{1}{2}$)"
                            required
                            value={questionText}
                            onChange={(e) => setQuestionText(e.target.value)}
                            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                        />
                        <label className="flex items-center gap-2 mt-2">
                            <input 
                                type="checkbox" 
                                checked={isQuestionImage}
                                onChange={() => setIsQuestionImage(!isQuestionImage)}
                                className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                            />
                            <span>Image Url</span>
                        </label>
                    </div>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-6">
                    <h3 className="text-lg font-semibold mb-4">Question Preview</h3>
                    
                    {previewError && (
                        <div className="text-red-500 mb-4">{previewError}</div>
                    )}
                    
                    <div className="mb-4">
                        <span className="font-bold mr-2">{serialNumber || 'Q.'})</span>
                        {isQuestionImage ? (
                            <img src={questionText} alt="Question" className="max-w-full h-auto" />
                        ) : (
                            renderWithLatex(questionText)
                        )}
                    </div>
                    
                    {(selectedType === 'objective' || selectedType === 'multiple') && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            {['A', 'B', 'C', 'D'].map((option) => (
                                <div key={option} className="flex items-start gap-2">
                                    <span className="font-semibold">{option}.</span>
                                    {imageUrls[option] ? (
                                        <img src={options[option]} alt={`Option ${option}`} className="max-w-full h-auto" />
                                    ) : (
                                        <div>{renderWithLatex(options[option])}</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {selectedType === 'numeric' && (
                        <div className="mt-4">
                            <span className="font-semibold">Answer: </span>
                            <span>{numericAnswer}</span>
                        </div>
                    )}
                    
                    {selectedType === 'objective' && (
                        <div className="mt-4">
                            <span className="font-semibold">Answer: </span>
                            <span>{answer}</span>
                        </div>
                    )}
                    
                    {selectedType === 'multiple' && (
                        <div className="mt-4">
                            <span className="font-semibold">Answers: </span>
                            <span>{answer}</span>
                        </div>
                    )}
                </div>
                
                <select 
                    value={selectedType}
                    onChange={handleTypeChange}
                    required
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">Select Question Type</option>
                    <option value="objective">Objective</option>
                    <option value="multiple">Multiple</option>
                    <option value="numeric">Numeric</option>
                </select>
                {showOptions && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {['A', 'B', 'C', 'D'].map((option) => (
                            <div key={option} className="flex items-center gap-4 bg-gray-50 p-4 rounded-md">
                                <span className="font-semibold w-8">{option}.</span>
                                <input 
                                    type="text" 
                                    placeholder={`Option ${option} (Use $ for LaTeX)`}
                                    required
                                    value={options[option]}
                                    onChange={(e) => handleOptionChange(option, e.target.value)}
                                    className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <label className="flex items-center gap-2 whitespace-nowrap">
                                    <input 
                                        type="checkbox" 
                                        checked={imageUrls[option]}
                                        onChange={() => handleImageUrlChange(option)}
                                        className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                                    />
                                    <span>Image Url</span>
                                </label>
                            </div>
                        ))}
                    </div>
                )}
                {selectedType === 'numeric' && (
                    <div className="bg-gray-50 p-4 rounded-md">
                        <input 
                            type="number" 
                            placeholder="Enter Numeric Answer"
                            required
                            value={numericAnswer}
                            onChange={(e) => setNumericAnswer(e.target.value)}
                            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                )}
                {selectedType !== 'numeric' && (
                    <div className="bg-gray-50 p-4 rounded-md">
                        {selectedType === 'multiple' ? (
                            <div className="grid grid-cols-2 gap-4">
                                {['A', 'B', 'C', 'D'].map((option) => (
                                    <label key={option} className="flex items-center gap-2">
                                        <input 
                                            type="checkbox" 
                                            checked={answer.includes(option)}
                                            onChange={() => handleAnswerChange(option)}
                                            className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                                        />
                                        <span>Option {option}</span>
                                    </label>
                                ))}
                            </div>
                        ) : (
                            <select 
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                required
                                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select Answer</option>
                                <option value="A">A</option>
                                <option value="B">B</option>
                                <option value="C">C</option>
                                <option value="D">D</option>
                            </select>
                        )}
                    </div>
                )}
                <button 
                    onClick={handleAddQuestion}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors w-full md:w-auto"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Add Question
                </button>
            </div>
        </div>
    )
}