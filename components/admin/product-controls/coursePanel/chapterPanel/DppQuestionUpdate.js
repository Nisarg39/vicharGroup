import {useState, useEffect} from 'react'
import { updateDppQuestion } from '../../../../../server_actions/actions/adminActions'
import 'katex/dist/katex.min.css'
import { InlineMath, BlockMath } from 'react-katex'
import ImageUpload from '../../../../common/ImageUpload'

export default function DppQuestionUpdate({dpp, question, updateQuestion}) {

    // console.log(question.questionImage)

    const [showOptions, setShowOptions] = useState(question?.answerMultiple?.length > 0 ? true : question?.answerObjective ? true : false)
    const [selectedType, setSelectedType] = useState(question?.answerObjective ? 'objective' : question?.answerNumeric ? 'numeric' : question?.answerMultiple?.length > 0 ? 'multiple' : '')
    const [serialNumber, setSerialNumber] = useState(question?.serialNumber || '')
    const [questionText, setQuestionText] = useState(question?.question || '')

    // Add this with other state declarations
    const [questionImage, setQuestionImage] = useState(question?.questionImage || '')
    const [imagePreview, setImagePreview] = useState(question?.questionImage || '')
    const [isUploading, setIsUploading] = useState(false)

    const [options, setOptions] = useState({
        A: question?.objectiveoptions?.[0]?.text || question?.multipleObjective?.[0]?.text || '',
        B: question?.objectiveoptions?.[1]?.text || question?.multipleObjective?.[1]?.text || '',
        C: question?.objectiveoptions?.[2]?.text || question?.multipleObjective?.[2]?.text || '',
        D: question?.objectiveoptions?.[3]?.text || question?.multipleObjective?.[3]?.text || ''
    })
    const [numericAnswer, setNumericAnswer] = useState(question?.answerNumeric || '')
    const [imageUrls, setImageUrls] = useState({
        A: question?.objectiveoptions?.[0]?.isImage || question?.multipleObjective?.[0]?.isImage || false,
        B: question?.objectiveoptions?.[1]?.isImage || question?.multipleObjective?.[1]?.isImage || false,
        C: question?.objectiveoptions?.[2]?.isImage || question?.multipleObjective?.[2]?.isImage || false,
        D: question?.objectiveoptions?.[3]?.isImage || question?.multipleObjective?.[3]?.isImage || false 
    })
    const [answer, setAnswer] = useState(
        question?.answerObjective || (question?.answerMultiple?.length > 0 ? question.answerMultiple.join(',') : '')
    )
    const [responseMessage, setResponseMessage] = useState('')
    const [responseStatus, setResponseStatus] = useState('')
    const [previewError, setPreviewError] = useState('')
    const handleTypeChange = (e) => {
        alert('you cannot change the type of existing question')
        // setSelectedType(e.target.value)
        // setShowOptions(e.target.value === 'objective' || e.target.value === 'multiple')
    }

    const handleImageUpload = (imageUrl) => {
        setQuestionImage(imageUrl)
        setImagePreview(imageUrl)
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

    const handleUpdateQuestion = async() => {
        try {
            validateInputs()

            const formattedOptions = Object.entries(options).map(([option, text]) => ({
                option,
                text,
                isImage: imageUrls[option]
            }))

            const questionData = {
                questionId: question._id,
                serialNumber: Number(serialNumber),
                question: questionText,
                questionImage: questionImage, // Add the question image
                objectiveoptions: selectedType === 'objective' ? formattedOptions : undefined,
                multipleObjective: selectedType === 'multiple' ? formattedOptions : undefined,
                answerObjective: selectedType === 'objective' ? answer : undefined,
                answerMultiple: selectedType === 'multiple' ? answer.split(',').map(a => a.trim()) : undefined,
                answerNumeric: selectedType === 'numeric' ? Number(numericAnswer) : undefined,
            }

            const response = await updateDppQuestion(questionData)
            setResponseMessage(response?.message || 'Operation completed')
            setResponseStatus('success')
            alert('Question updated successfully')
            updateQuestion(response?.dppQuestion)
        } catch (error) {
            setResponseMessage(error?.message || 'An error occurred')
            setResponseStatus('error')
            alert(error?.message || 'An error occurred')
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
        if (!text) return '';
        
        try {
            const parts = text.split(/(\$.*?\$)/g);
            const hasLatex = parts.some(part => part.startsWith('$') && part.endsWith('$'));
            
            if (!hasLatex) return text; // Return as string if no LaTeX
            
            return (
                <>
                    {parts.map((part, index) => {
                        if (part.startsWith('$') && part.endsWith('$')) {
                            const latex = part.slice(1, -1);
                            return <InlineMath key={index} math={latex} />;
                        }
                        return <span key={index}>{part}</span>;
                    })}
                </>
            );
        } catch (error) {
            return <span className="text-red-500">Error rendering LaTeX: {error.message}</span>;
        }
    }

    const renderFormattedText = (text) => {
        if (!text) return '';
        
        try {
            // Process bold text first
            const boldPattern = /\*\*(.*?)\*\*/g;
            let processedText = text;
            const boldParts = [];
            let lastIndex = 0;
            let match;
            
            while ((match = boldPattern.exec(text)) !== null) {
                if (match.index > lastIndex) {
                    boldParts.push({
                        type: 'normal',
                        text: text.substring(lastIndex, match.index)
                    });
                }
                
                boldParts.push({
                    type: 'bold',
                    text: match[1]
                });
                
                lastIndex = match.index + match[0].length;
            }
            
            if (lastIndex < text.length) {
                boldParts.push({
                    type: 'normal',
                    text: text.substring(lastIndex)
                });
            }
            
            // If no bold parts found, just process LaTeX
            if (boldParts.length === 0) {
                return renderWithLatex(text);
            }
            
            // Process each part for LaTeX
            return (
                <>
                    {boldParts.map((part, index) => {
                        if (part.type === 'bold') {
                            return <strong key={index}>{renderWithLatex(part.text)}</strong>;
                        } else {
                            return <span key={index}>{renderWithLatex(part.text)}</span>;
                        }
                    })}
                </>
            );
        } catch (error) {
            return <span className="text-red-500">Error rendering formatted text: {error.message}</span>;
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
                        onClick={() => alert("Use $ symbols to wrap LaTeX expressions. For example: $\\frac{1}{2}$ will render as a fraction.\n\nUse ** to make text bold. For example: **bold text** will appear as bold.")}
                    >
                        Formatting Help
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
                        
                        {/* Add image upload section */}
                        <div className="mt-4">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-gray-700">Question Image</h4>
                                {questionImage && (
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            setQuestionImage('')
                                            setImagePreview('')
                                        }}
                                        className="text-sm text-red-500 hover:text-red-700"
                                    >
                                        Remove Image
                                    </button>
                                )}
                            </div>
                            
                            {imagePreview ? (
                                <div className="mb-4">
                                    <img 
                                        src={imagePreview} 
                                        alt="Question preview" 
                                        className="max-w-full h-auto max-h-64 rounded-md border border-gray-200" 
                                    />
                                </div>
                            ) : null}
                            
                            <ImageUpload 
                                onImageUploaded={handleImageUpload}
                                isUploading={isUploading}
                                setIsUploading={setIsUploading}
                                folder="dpp_questions"
                            />
                        </div>
                    </div>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-6">
                    <h3 className="text-lg font-semibold mb-4">Question Preview</h3>
                    
                    {previewError && (
                        <div className="text-red-500 mb-4">{previewError}</div>
                    )}
                    
                    <div className="mb-4">
                        <span className="font-bold mr-2">{serialNumber || 'Q.'})</span>
                        {renderFormattedText(questionText)}
                    </div>

                    {/* Updated image preview section */}
                    {imagePreview && (
                        <div className="mt-2 mb-4">
                            <img 
                                src={imagePreview} 
                                alt="Question" 
                                className="max-w-full h-auto max-h-64 rounded-md border border-gray-200" 
                            />
                        </div>
                    )}
                    
                    {(selectedType === 'objective' || selectedType === 'multiple') && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            {['A', 'B', 'C', 'D'].map((option) => (
                                <div key={option} className="flex items-start gap-2">
                                    <span className="font-semibold">{option}.</span>
                                    {imageUrls[option] ? (
                                        <img src={options[option]} alt={`Option ${option}`} className="max-w-full h-auto" />
                                    ) : (
                                        <div>{renderFormattedText(options[option])}</div>
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
                    onClick={handleUpdateQuestion}
                    disabled={!serialNumber || !questionText || !selectedType || isUploading}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors w-full md:w-auto disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    {isUploading ? 'Uploading...' : 'Update Question'}
                </button>
            </div>
        </div>
    )}