import { useState, useRef, useEffect } from 'react'
import ReactCrop from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import axios from 'axios'
import { getTopics } from '../../../../../utils/examUtils/subject_Details'
import { CreateTeacherExam, GetAllTeachers, UpdateTeacherExam } from '../../../../../server_actions/actions/adminActions'

// Get available subjects from subject_Details data
const getAvailableSubjects = () => {
    const subjects = new Set()
    const streams = ['JEE', 'NEET', 'MHT-CET']
    
    streams.forEach(stream => {
        // Get subjects for each stream by checking what's available
        const sampleStandard = '11' // Use standard 11 to check available subjects
        const streamData = getTopics(stream, 'Physics', sampleStandard) // Test if Physics exists
        
        // Check all possible subjects for each stream
        const possibleSubjects = ['Physics', 'Chemistry', 'Maths', 'Mathematics', 'Biology', 'Botany', 'Zoology']
        
        possibleSubjects.forEach(subject => {
            const topicsData = getTopics(stream, subject, sampleStandard)
            if (topicsData && Object.keys(topicsData).length > 0) {
                subjects.add(subject)
            }
        })
    })
    
    return Array.from(subjects).map(subject => ({
        value: subject.toLowerCase(),
        label: subject.charAt(0).toUpperCase() + subject.slice(1).toLowerCase()
    }))
}

// Generate subjects from the actual data structure
const subjects = getAvailableSubjects()

export default function TeacherExamManagement(){
    const [teacherData, setTeacherData] = useState({
        name: '',
        email: '',
        password: '',
        subject: ''
    })
    const [imageSrc, setImageSrc] = useState(null)
    const [crop, setCrop] = useState({
        unit: '%',
        width: 50,
        height: 50,
        x: 25,
        y: 25,
        aspect: 1
    })
    const [croppedImageUrl, setCroppedImageUrl] = useState(null)
    const [showCrop, setShowCrop] = useState(false)
    const [adminToken, setAdminToken] = useState(null)
    const [isUploading, setIsUploading] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [teachers, setTeachers] = useState([])
    const [isLoadingTeachers, setIsLoadingTeachers] = useState(false)
    const [activeTab, setActiveTab] = useState('add') // 'add' or 'list'
    const [editingTeacher, setEditingTeacher] = useState(null) // null for add mode, teacher object for edit mode
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalCount, setTotalCount] = useState(0)
    const [hasNextPage, setHasNextPage] = useState(false)
    const [hasPrevPage, setHasPrevPage] = useState(false)
    const imgRef = useRef(null)
    const cropRef = useRef(null)

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setTeacherData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    // Handle edit teacher
    const handleEditTeacher = (teacher) => {
        setEditingTeacher(teacher)
        setTeacherData({
            name: teacher.name,
            email: teacher.email,
            password: '', // Don't show existing password
            subject: teacher.subject ? subjects.find(s => s.label === teacher.subject)?.value || '' : ''
        })
        setCroppedImageUrl(teacher.profileImageUrl || null)
        setActiveTab('add')
    }

    // Handle cancel edit
    const handleCancelEdit = () => {
        setEditingTeacher(null)
        setTeacherData({
            name: '',
            email: '',
            password: '',
            subject: ''
        })
        setCroppedImageUrl(null)
        setImageSrc(null)
        setShowCrop(false)
    }

    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (e) => {
                setImageSrc(e.target.result)
                setShowCrop(true)
                setCroppedImageUrl(null)
            }
            reader.readAsDataURL(file)
        }
    }

    const getCroppedImg = () => {
        const image = imgRef.current
        const canvas = document.createElement('canvas')
        const scaleX = image.naturalWidth / image.width
        const scaleY = image.naturalHeight / image.height
        
        canvas.width = crop.width * scaleX
        canvas.height = crop.height * scaleY
        
        const ctx = canvas.getContext('2d')
        
        ctx.drawImage(
            image,
            crop.x * scaleX,
            crop.y * scaleY,
            crop.width * scaleX,
            crop.height * scaleY,
            0,
            0,
            crop.width * scaleX,
            crop.height * scaleY
        )
        
        return canvas.toDataURL('image/jpeg')
    }

    const uploadImageToS3 = async (imageDataUrl) => {
        try {
            // Convert data URL to blob
            const response = await fetch(imageDataUrl)
            const blob = await response.blob()
            
            // Generate filename without path (backend adds the path)
            const fileName = `teacher_profile_${Date.now()}.png`
            
            // Get pre-signed URL using teacherDetails type
            const preSignedResponse = await fetch('https://api.drcexam.in/getPreSignedURL', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${adminToken}`
                },
                body: JSON.stringify({
                    type: 'teacherDetails',
                    fileName: fileName
                })
            })
            
            const preSignedData = await preSignedResponse.json()
            
            if (preSignedData.statusCode !== 200) {
                throw new Error(preSignedData.message || 'Failed to get pre-signed URL')
            }
            
            const preSignedURL = preSignedData.payload
            
            // Upload to S3
            await fetch(preSignedURL, {
                method: 'PUT',
                body: blob,
                headers: {
                    'Content-Type': 'image/png'
                }
            })
            
            // Return the uploaded URL
            const uploadedUrl = preSignedURL.split('?')[0]
            return uploadedUrl
        } catch (error) {
            console.error('Error uploading image to S3:', error)
            throw error
        }
    }

    const handleCropComplete = async () => {
        if (!adminToken) {
            alert('Authentication required. Please wait and try again.')
            return
        }
        
        setIsUploading(true)
        try {
            const croppedImage = getCroppedImg()
            
            // Upload to S3 and get the URL
            const uploadedUrl = await uploadImageToS3(croppedImage)
            
            // Set the uploaded URL for preview
            setCroppedImageUrl(uploadedUrl)
            
            setShowCrop(false)
            alert('Image uploaded successfully!')
        } catch (error) {
            console.error('Error uploading image:', error)
            alert('Error uploading image. Please try again.')
        } finally {
            setIsUploading(false)
        }
    }

    // Fetch teachers list
    const fetchTeachers = async (page = 1) => {
        setIsLoadingTeachers(true)
        try {
            const result = await GetAllTeachers(page, 10)
            if (result.success) {
                setTeachers(result.teachers)
                setCurrentPage(result.currentPage)
                setTotalPages(result.totalPages)
                setTotalCount(result.totalCount)
                setHasNextPage(result.hasNextPage)
                setHasPrevPage(result.hasPrevPage)
            } else {
                console.error('Error fetching teachers:', result.message)
            }
        } catch (error) {
            console.error('Error fetching teachers:', error)
        } finally {
            setIsLoadingTeachers(false)
        }
    }

    // Get admin token on component mount
    useEffect(() => {
        const getAdminToken = async () => {
            try {
                const response = await axios.post('https://api.drcexam.in/user/auth/signin', {
                    email: 'admin.support@drcexam.in',
                    password: 'Exam@2024',
                    remember: true
                })
                const token = response.data.payload.token
                setAdminToken(token)
            } catch (error) {
                console.error('Admin authentication error:', error)
                alert('Authentication failed. Image upload may not work.')
            }
        }
        getAdminToken()
        fetchTeachers()
    }, [])

    // Validation function
    const validateForm = () => {
        const errors = []
        
        // Check mandatory fields
        if (!teacherData.name.trim()) {
            errors.push('Teacher name is required')
        }
        
        if (!teacherData.email.trim()) {
            errors.push('Email address is required')
        } else {
            // Basic email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!emailRegex.test(teacherData.email)) {
                errors.push('Please enter a valid email address')
            }
        }
        
        // Password validation - required for new teachers, optional for updates
        if (!editingTeacher) {
            // Creating new teacher - password is required
            if (!teacherData.password.trim()) {
                errors.push('Password is required')
            } else if (teacherData.password.length < 6) {
                errors.push('Password must be at least 6 characters long')
            }
        } else {
            // Updating existing teacher - password is optional
            if (teacherData.password.trim() && teacherData.password.length < 6) {
                errors.push('Password must be at least 6 characters long')
            }
        }
        
        return errors
    }

    const handleSubmit = async () => {
        // Validate form
        const validationErrors = validateForm()
        
        if (validationErrors.length > 0) {
            alert('Please fix the following errors:\n\n' + validationErrors.join('\n'))
            return
        }
        
        setIsSubmitting(true)
        
        try {
            // Find the subject label for display
            const selectedSubject = subjects.find(subject => subject.value === teacherData.subject)
            const subjectLabel = selectedSubject ? selectedSubject.label : ''
            
            console.log('=== TEACHER DETAILS ===')
            console.log('Teacher Name:', teacherData.name)
            console.log('Teacher Email:', teacherData.email)
            console.log('Teacher Password:', teacherData.password)
            console.log('Teacher Subject:', subjectLabel || 'Not selected')
            console.log('Profile Image S3 URL:', croppedImageUrl || 'Not uploaded')
            console.log('Edit Mode:', editingTeacher ? 'true' : 'false')
            console.log('=== END OF TEACHER DETAILS ===')
            
            // Complete teacher object for submission
            const completeTeacherData = {
                name: teacherData.name.trim(),
                email: teacherData.email.trim(),
                subject: subjectLabel,
                profileImageUrl: croppedImageUrl || null,
            }
            
            // Only include password if it's provided
            if (teacherData.password.trim()) {
                completeTeacherData.password = teacherData.password
            }
            
            // Add createdAt for new teachers
            if (!editingTeacher) {
                completeTeacherData.createdAt = new Date().toISOString()
            }
            
            console.log('Complete Teacher Object:', completeTeacherData)
            
            // Submit to server
            let result
            if (editingTeacher) {
                result = await UpdateTeacherExam(editingTeacher._id, completeTeacherData)
            } else {
                result = await CreateTeacherExam(completeTeacherData)
            }
            
            if (result.success) {
                alert(editingTeacher ? 'Teacher updated successfully!' : 'Teacher added successfully!')
                
                // Reset form
                setTeacherData({
                    name: '',
                    email: '',
                    password: '',
                    subject: ''
                })
                setCroppedImageUrl(null)
                setImageSrc(null)
                setShowCrop(false)
                setEditingTeacher(null)
                
                // Refresh teachers list
                fetchTeachers()
            } else {
                alert(`Error ${editingTeacher ? 'updating' : 'adding'} teacher: ` + (result.message || 'Unknown error occurred'))
            }
            
        } catch (error) {
            console.error('Error submitting teacher data:', error)
            alert(`Error ${editingTeacher ? 'updating' : 'adding'} teacher: ` + (error.message || 'Network error occurred'))
        } finally {
            setIsSubmitting(false)
        }
    }

    return(
        <div className="w-full bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-[#1d77bc] to-[#4a90c2] p-6 border-b">
                <h1 className="text-2xl md:text-3xl font-semibold text-white flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                    Teacher Management
                </h1>
                <p className="text-blue-100 mt-2">
                    {editingTeacher ? 'Edit teacher information' : 'Add new teachers to the exam portal system'}
                </p>
                
                {/* Tab Navigation */}
                <div className="flex gap-4 mt-4">
                    <button
                        onClick={() => {
                            setActiveTab('add')
                            if (editingTeacher) {
                                handleCancelEdit()
                            }
                        }}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                            activeTab === 'add' 
                                ? 'bg-white text-[#1d77bc]' 
                                : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                    >
                        {editingTeacher ? (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Cancel Edit
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Add Teacher
                            </>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('list')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                            activeTab === 'list' 
                                ? 'bg-white text-[#1d77bc]' 
                                : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Teachers List 
                        <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                            {totalCount}
                        </span>
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                {activeTab === 'add' ? (
                    <div className="max-w-4xl mx-auto space-y-6">
                {/* Profile Image Section */}
                <div className="bg-gray-50 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#1d77bc]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <h3 className="text-lg font-semibold text-gray-800">Profile Image</h3>
                    </div>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-white">
                        <input 
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                            id="profile-upload"
                        />
                        <label 
                            htmlFor="profile-upload" 
                            className="cursor-pointer flex flex-col items-center gap-2 hover:text-[#1d77bc] transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <span className="text-sm font-medium">Click to upload profile image</span>
                            <span className="text-xs text-gray-500">PNG, JPG up to 10MB</span>
                        </label>
                    </div>
                    
                    {showCrop && imageSrc && (
                        <div className="mt-6 p-6 bg-white rounded-xl shadow-sm border border-gray-200">
                            <div className="flex items-center gap-2 mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#e96030]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                </svg>
                                <p className="text-sm font-semibold text-gray-800">Crop your image to square ratio</p>
                            </div>
                            <div className="max-w-md mx-auto mb-6">
                                <ReactCrop
                                    crop={crop}
                                    onChange={(newCrop) => setCrop(newCrop)}
                                    aspect={1}
                                    circularCrop
                                >
                                    <img
                                        ref={imgRef}
                                        src={imageSrc}
                                        alt="Crop preview"
                                        className="max-w-full max-h-80 rounded-lg"
                                    />
                                </ReactCrop>
                            </div>
                            <div className="flex justify-center gap-3">
                                <button
                                    onClick={handleCropComplete}
                                    disabled={isUploading || !adminToken}
                                    className="bg-gradient-to-r from-[#e96030] to-[#ff7043] text-white px-6 py-3 rounded-lg hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isUploading ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                                            </svg>
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 12l2 2 4-4" />
                                            </svg>
                                            Crop & Upload Image
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => setShowCrop(false)}
                                    disabled={isUploading}
                                    className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                    
                    {croppedImageUrl && (
                        <div className="mt-6 p-6 bg-green-50 rounded-xl border border-green-200">
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-2 mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-sm font-semibold text-green-800">Profile Image Ready</p>
                                </div>
                                <img 
                                    src={croppedImageUrl} 
                                    alt="Uploaded Profile Preview" 
                                    className="w-32 h-32 object-cover rounded-full border-4 border-white shadow-lg mx-auto"
                                />
                                <p className="text-xs text-green-600 mt-3 font-medium">Image uploaded to S3 successfully</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Personal Information Section */}
                <div className="bg-gray-50 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#1d77bc]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <h3 className="text-lg font-semibold text-gray-800">Personal Information</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Teacher Name
                            </label>
                            <input 
                                type="text"
                                name="name"
                                value={teacherData.name}
                                onChange={handleInputChange}
                                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1d77bc] focus:border-transparent transition-all duration-200 bg-white"
                                placeholder="Enter teacher name"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                </svg>
                                Email Address
                            </label>
                            <input 
                                type="email"
                                name="email"
                                value={teacherData.email}
                                onChange={handleInputChange}
                                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1d77bc] focus:border-transparent transition-all duration-200 bg-white"
                                placeholder="Enter email address"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                Password
                            </label>
                            <input 
                                type="password"
                                name="password"
                                value={teacherData.password}
                                onChange={handleInputChange}
                                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1d77bc] focus:border-transparent transition-all duration-200 bg-white"
                                placeholder={editingTeacher ? "Leave blank to keep current password" : "Enter secure password"}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                                Subject Specialization
                            </label>
                            <select
                                name="subject"
                                value={teacherData.subject}
                                onChange={handleInputChange}
                                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1d77bc] focus:border-transparent transition-all duration-200 bg-white"
                            >
                                <option value="">Select Subject</option>
                                {subjects.map((subject) => (
                                    <option key={subject.value} value={subject.value}>
                                        {subject.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Submit Button Section */}
                <div className="flex justify-center gap-4 pt-6">
                    <button 
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="bg-gradient-to-r from-[#1d77bc] to-[#2563eb] text-white px-8 py-4 rounded-xl hover:shadow-lg transition-all duration-200 flex items-center gap-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <>
                                <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                                </svg>
                                {editingTeacher ? 'Updating Teacher...' : 'Adding Teacher...'}
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={editingTeacher ? "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" : "M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"} />
                                </svg>
                                {editingTeacher ? 'Update Teacher' : 'Add Teacher to Portal'}
                            </>
                        )}
                    </button>
                    {editingTeacher && (
                        <button 
                            onClick={handleCancelEdit}
                            disabled={isSubmitting}
                            className="bg-gray-500 text-white px-8 py-4 rounded-xl hover:bg-gray-600 transition-all duration-200 flex items-center gap-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Cancel Edit
                        </button>
                    )}
                </div>
                    </div>
                ) : (
                    /* Teachers List */
                    <div className="max-w-6xl mx-auto">
                        <div className="bg-gray-50 rounded-xl p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#1d77bc]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    <h3 className="text-xl font-semibold text-gray-800">Registered Teachers</h3>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-sm text-gray-600">
                                        Page {currentPage} of {totalPages} ({totalCount} total teachers)
                                    </span>
                                    <button
                                        onClick={() => fetchTeachers(currentPage)}
                                        disabled={isLoadingTeachers}
                                        className="bg-[#1d77bc] text-white px-4 py-2 rounded-lg hover:bg-[#155a8a] transition-colors disabled:opacity-50"
                                    >
                                        {isLoadingTeachers ? 'Loading...' : 'Refresh'}
                                    </button>
                                </div>
                            </div>

                            {isLoadingTeachers ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="flex items-center gap-3">
                                        <svg className="animate-spin h-6 w-6 text-[#1d77bc]" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                                        </svg>
                                        <span className="text-gray-600">Loading teachers...</span>
                                    </div>
                                </div>
                            ) : teachers.length === 0 ? (
                                <div className="text-center py-12">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">No Teachers Added Yet</h3>
                                    <p className="text-gray-600">Click on "Add Teacher" tab to add your first teacher.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {teachers.map((teacher) => (
                                        <div key={teacher._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                                            <div className="p-6">
                                                <div className="flex items-center gap-4 mb-4">
                                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#1d77bc] to-[#4a90c2] flex items-center justify-center overflow-hidden">
                                                        {teacher.profileImageUrl ? (
                                                            <img
                                                                src={teacher.profileImageUrl}
                                                                alt={teacher.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <span className="text-white text-xl font-bold">
                                                                {teacher.name.charAt(0).toUpperCase()}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-gray-800 text-lg">{teacher.name}</h4>
                                                        <p className="text-gray-600 text-sm">{teacher.email}</p>
                                                    </div>
                                                </div>
                                                
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                        </svg>
                                                        <span className="text-sm text-gray-700">
                                                            <span className="font-medium">Subject:</span> {teacher.subject || 'Not specified'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        <span className="text-sm text-gray-700">
                                                            <span className="font-medium">Added:</span> {new Date(teacher.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                {/* Edit Button */}
                                                <div className="mt-4 pt-4 border-t border-gray-100">
                                                    <button
                                                        onClick={() => handleEditTeacher(teacher)}
                                                        className="w-full bg-gradient-to-r from-[#1d77bc] to-[#2563eb] text-white px-4 py-2 rounded-lg hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                        Edit Teacher
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            
                            {/* Pagination Controls */}
                            {!isLoadingTeachers && teachers.length > 0 && totalPages > 1 && (
                                <div className="mt-8 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-600">
                                            Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalCount)} of {totalCount} teachers
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => fetchTeachers(currentPage - 1)}
                                            disabled={!hasPrevPage}
                                            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-500"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                            </svg>
                                            Previous
                                        </button>
                                        
                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: totalPages }, (_, i) => {
                                                const pageNum = i + 1;
                                                const isCurrentPage = pageNum === currentPage;
                                                const showPage = 
                                                    pageNum === 1 || 
                                                    pageNum === totalPages || 
                                                    (pageNum >= currentPage - 2 && pageNum <= currentPage + 2);
                                                
                                                if (!showPage) {
                                                    if (pageNum === currentPage - 3 || pageNum === currentPage + 3) {
                                                        return <span key={pageNum} className="px-2 py-1 text-gray-500">...</span>;
                                                    }
                                                    return null;
                                                }
                                                
                                                return (
                                                    <button
                                                        key={pageNum}
                                                        onClick={() => fetchTeachers(pageNum)}
                                                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                                            isCurrentPage
                                                                ? 'bg-[#1d77bc] text-white'
                                                                : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-700'
                                                        }`}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        
                                        <button
                                            onClick={() => fetchTeachers(currentPage + 1)}
                                            disabled={!hasNextPage}
                                            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-500"
                                        >
                                            Next
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}