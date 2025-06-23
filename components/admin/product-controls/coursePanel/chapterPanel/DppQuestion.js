import React, {useState, useEffect} from 'react'
import { addDppQuestion } from '../../../../../server_actions/actions/adminActions'
import 'katex/dist/katex.min.css'
import { InlineMath, BlockMath } from 'react-katex'
import ImageUpload from '../../../../common/ImageUpload'
import LatexToolbar from './LatexToolbar'
import { CldUploadButton } from 'next-cloudinary'
import { renderFormattedText } from '../../../../../utils/textFormatting'


export default function DppQuestion({dpp, addedQuestion}){
    const [showOptions, setShowOptions] = useState(false)
    const [selectedType, setSelectedType] = useState(dpp?.type || '')
    const [serialNumber, setSerialNumber] = useState('')
    const [questionText, setQuestionText] = useState('')
    const [options, setOptions] = useState({A: '', B: '', C: '', D: ''})
    const [numericAnswer, setNumericAnswer] = useState('')
    const [imageUrls, setImageUrls] = useState({A: false, B: false, C: false, D: false})
    const [answer, setAnswer] = useState('')
    const [responseMessage, setResponseMessage] = useState('')
    const [responseStatus, setResponseStatus] = useState('')
    const [previewError, setPreviewError] = useState('')
    const [questionImage, setQuestionImage] = useState('');
    const [showQuestionImageUpload, setShowQuestionImageUpload] = useState(false);
    const [showLatexToolbar, setShowLatexToolbar] = useState(false);
    const [activeField, setActiveField] = useState('question'); // Tracks which field to insert LaTeX into
    const [uploadPreset, setUploadPreset] = useState('');
    const [solutionImageUrl, setSolutionImageUrl] = useState('');
    const [showSolutionUpload, setShowSolutionUpload] = useState(false);

    useEffect(() => {
        setUploadPreset(process.env.NEXT_PUBLIC_CLOUDINARY_PRESET_NAME);
    }, []);

    // Function to insert LaTeX expression or formatting into the active field
    const handleInsertLatex = (expression, targetField) => {
        console.log("DppQuestion: Received expression:", expression);
        console.log("DppQuestion: Target field:", targetField);
        
        if (targetField === 'question') {
            console.log("DppQuestion: Current question text:", questionText);
            const newText = questionText + expression;
            console.log("DppQuestion: New question text:", newText);
            setQuestionText(newText);
        } else if (['A', 'B', 'C', 'D'].includes(targetField)) {
            console.log("DppQuestion: Current option text:", options[targetField]);
            const newOptionText = options[targetField] + expression;
            console.log("DppQuestion: New option text:", newOptionText);
            handleOptionChange(targetField, newOptionText);
        } else {
            console.warn("DppQuestion: Unknown target field:", targetField);
        }
    }

    // Function to set the active field when focusing on an input
    const handleFieldFocus = (field) => {
        setActiveField(field);
    }

    const handleTypeChange = (e) => {
        setSelectedType(e.target.value)
        setShowOptions(e.target.value === 'objective' || e.target.value === 'multiple')
    }

    const handleImageUploaded = (url, target) => {
        if (target === 'question') {
            setQuestionImage(url);
        } else if (['A', 'B', 'C', 'D'].includes(target)) {
            handleOptionChange(target, url);
            handleImageUrlChange(target);
        }
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
            if (!numericAnswer.trim()) {
                throw new Error('Please enter an answer')
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
                questionImage: questionImage,
                objectiveoptions: selectedType === 'objective' ? formattedOptions : undefined,
                multipleObjective: selectedType === 'multiple' ? formattedOptions : undefined,
                answerObjective: selectedType === 'objective' ? answer : undefined,
                answerMultiple: selectedType === 'multiple' ? answer.split(',').map(a => a.trim()) : undefined,
                answerNumeric: selectedType === 'numeric' ? numericAnswer : undefined,
                solutionImage: solutionImageUrl || undefined,
            }

            const response = await addDppQuestion(questionData)
            setResponseMessage(response?.message || 'Operation completed')
            setResponseStatus('success')
            alert('Question added successfully')
            addedQuestion(response?.dppQuestion)
            
            // Reset all state values after successful addition
            setSerialNumber('')
            setQuestionText('')
            setOptions({A: '', B: '', C: '', D: ''})
            setNumericAnswer('')
            setImageUrls({A: false, B: false, C: false, D: false})
            setAnswer('')
            setQuestionImage('')
            setSolutionImageUrl('')
            setShowQuestionImageUpload(false)
            setShowSolutionUpload(false)
            // Keep the selected type as it is for convenience when adding multiple questions of same type
            // setSelectedType('')
            // setShowOptions(false)
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

    const handleSolutionImageUploaded = (result) => {
        if (result?.info?.secure_url) {
            setSolutionImageUrl(result.info.secure_url);
        } else {
            console.error("Unexpected result structure:", result);
        }
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

    return(
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="space-y-6">
                {responseMessage && (
                    <div className={`p-3 rounded-md ${responseStatus === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {responseMessage}
                    </div>
                )}                

                <div className="flex justify-between items-center">
                    <button 
                        type="button"
                        className="text-blue-500 hover:text-blue-700 text-sm flex items-center gap-1"
                        onClick={() => {
                            setShowLatexToolbar(!showLatexToolbar);
                        }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        {showLatexToolbar ? 'Hide LaTeX Toolbar' : 'Show LaTeX Toolbar'}
                    </button>
                    
                    <button 
                        type="button"
                        className="text-blue-500 hover:text-blue-700 text-sm"
                        onClick={() => alert("Use $ symbols to wrap LaTeX expressions. For example: $\\frac{1}{2}$ will render as a fraction.\n\nUse **text** for bold text and *text* for italic text.\n\nPress Enter to create a new line.")}
                    >
                        Formatting Help
                    </button>
                </div>

                <div className="text-sm text-gray-500">
                    Toolbar visible: {showLatexToolbar ? 'Yes' : 'No'}
                </div>

                {showLatexToolbar && (
                    <div className="border border-gray-300 p-2 rounded-md mb-4">
                        <LatexToolbar 
                            onSelectExpression={handleInsertLatex} 
                            targetField={activeField}
                        />
                    </div>
                )}

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
                            placeholder="Question (Use $ for LaTeX, **text** for bold, press Enter for new line)"
                            required
                            value={questionText}
                            onChange={(e) => setQuestionText(e.target.value)}
                            onFocus={() => handleFieldFocus('question')}
                            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                        />                        
                        <div className="mt-2">
                            <button 
                                type="button"
                                onClick={() => setShowQuestionImageUpload(!showQuestionImageUpload)}
                                className="text-blue-500 hover:text-blue-700 text-sm flex items-center"
                            >
                                {showQuestionImageUpload ? 'Hide Image Upload' : 'Add Image to Question'}
                            </button>
                        </div>
                        
                        {showQuestionImageUpload && (
                            <div className="mt-2">
                                <ImageUpload onImageUploaded={(url) => handleImageUploaded(url, 'question')} />
                            </div>
                        )}
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
                    
                    {/* Display question image if available */}
                    {questionImage && (
                        <div className="mb-4">
                            <img src={questionImage} alt="Question" className="max-w-full h-auto border rounded" />
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
                            <div key={option} className="flex flex-col bg-gray-50 p-4 rounded-md">
                                <div className="flex items-center gap-4">
                                    <span className="font-semibold w-8">{option}.</span>
                                    <textarea 
                                        placeholder={`Option ${option} (Use $ for LaTeX, press Enter for new line)`}
                                        required
                                        value={options[option]}
                                        onChange={(e) => handleOptionChange(option, e.target.value)}
                                        onFocus={() => handleFieldFocus(option)}
                                        className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px]"
                                        rows={2}
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
                                
                                {imageUrls[option] && (
                                    <div className="mt-2">
                                        <ImageUpload onImageUploaded={(url) => handleImageUploaded(url, option)} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
                {selectedType === 'numeric' && (
                    <div className="bg-gray-50 p-4 rounded-md">
                        <input 
                            type="text" 
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
                {/* Solution Image Upload Section */}
                <div className="bg-gray-50 p-4 rounded-md">
                    <div className="mb-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-md font-semibold">Solution Image</h3>
                            <button 
                                type="button"
                                onClick={() => setShowSolutionUpload(!showSolutionUpload)}
                                className="text-blue-500 hover:text-blue-700 text-sm flex items-center"
                            >
                                {showSolutionUpload ? 'Hide Upload' : 'Show Upload'}
                            </button>
                        </div>
                    </div>
                    
                    {showSolutionUpload && (
                        <div className="space-y-4">
                            {uploadPreset ? (
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                                    <CldUploadButton
                                        uploadPreset={uploadPreset}
                                        options={{
                                            maxFiles: 1,
                                            resourceType: "raw",
                                            allowedFormats: ["jpg", "jpeg", "png"]
                                        }}
                                        onSuccess={handleSolutionImageUploaded}
                                        onError={(error) => console.error("Upload failed:", error)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-5 rounded-lg transition-all duration-200 shadow-sm hover:shadow flex items-center gap-2"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                        </svg>
                                        Upload Solution Image
                                    </CldUploadButton>
                                </div>
                            ) : (
                                <div className="text-gray-600 p-4 bg-gray-50 rounded-xl text-center border border-gray-200">
                                    <p>Loading upload button... (Check if NEXT_PUBLIC_CLOUDINARY_PRESET_NAME is set)</p>
                                </div>
                            )}
                            
                            {solutionImageUrl && (
                                <div className="mt-4">
                                    <span className="font-semibold">Solution: </span>
                                    <a 
                                        href={solutionImageUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm6.293-7.707a1 1 0 011.414 0L12 10.586V4a1 1 0 112 0v6.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                        View Solution Image
                                    </a>
                                </div>
                            )}
                        </div>
                    )}
                </div>
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
