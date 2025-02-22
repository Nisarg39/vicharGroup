"use client"
import { useSelector } from "react-redux"
import { useState } from "react"
import { updateStudentDetails } from "../../server_actions/actions/studentActions"
import Modal from "../common/Modal"
import { FaEnvelope, FaUserTag, FaUser, FaPhone, FaVenusMars, FaCalendar, FaMapMarkerAlt, FaCity, FaLocationArrow, FaGlobeAmericas } from 'react-icons/fa'

const ProfileHeader = ({ name, email, referralCode, gender }) => (
    <div className="bg-gradient-to-r from-[#1d77bc] to-[#2988d1] p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center gap-8">
            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-lg transform hover:scale-105 transition-transform duration-300">
                <img 
                    src={gender === 'female' ? "https://cdn-icons-gif.flaticon.com/13372/13372960.gif" : "https://cdn-icons-gif.flaticon.com/12146/12146129.gif"} 
                    alt={gender === 'female' ? "Female avatar" : "Male avatar"} 
                    className="w-full h-full object-cover"
                />
            </div>
            <div className="flex-1 text-center sm:text-left">
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                    {name || "Not provided"}
                </h1>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <p className="text-blue-50 text-lg backdrop-blur-sm bg-white/10 rounded-lg px-4 py-2 flex items-center gap-2">
                        <FaEnvelope className="text-xl" />
                        <span className="break-all">{email || "Not provided"}</span>
                    </p>
                    <p className="text-blue-50 text-lg backdrop-blur-sm bg-white/10 rounded-lg px-4 py-2 flex items-center gap-2">
                        <FaUserTag className="text-xl" />
                        <span>{referralCode || "No referral code"}</span>
                    </p>
                </div>
            </div>
        </div>
    </div>
)

const EditableField = ({ label, value, isEditing, setIsEditing, onChange, error, type = "text", options = [], fieldKey }) => {
    const getIcon = () => {
        switch(fieldKey) {
            case 'name': return <FaUser />
            case 'email': return <FaEnvelope />
            case 'phone': return <FaPhone />
            case 'gender': return <FaVenusMars />
            case 'dob': return <FaCalendar />
            case 'address': return <FaMapMarkerAlt />
            case 'city': return <FaCity />
            case 'area': return <FaLocationArrow />
            case 'state': return <FaGlobeAmericas />
            default: return null
        }
    }

    return (
        <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                {getIcon()}
                {label}
            </label>
            {isEditing ? 
                <div>
                    {type === "select" ? (
                        <select 
                            value={value} 
                            onChange={onChange} 
                            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1d77bc] focus:border-transparent transition-all duration-200"
                        >
                            <option value="">Select {label.toLowerCase()}</option>
                            {options.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    ) : type === "textarea" ? (
                        <textarea 
                            value={value} 
                            onChange={onChange} 
                            placeholder={`Enter ${label.toLowerCase()}`}
                            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1d77bc] focus:border-transparent transition-all duration-200"
                            rows="2"
                        />
                    ) : (
                        <input 
                            type={type} 
                            value={value} 
                            onChange={onChange} 
                            placeholder={`Enter ${label.toLowerCase()}`}
                            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1d77bc] focus:border-transparent transition-all duration-200"
                        />
                    )}
                    {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
                </div> :
                <p 
                    onClick={() => setIsEditing(prev => ({...prev, [fieldKey]: true}))} 
                    className="p-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-[#1d77bc] hover:shadow-md transition-all duration-200 flex items-center gap-2"
                >
                    {getIcon()}
                    {type === "date" && value ? new Date(value).toLocaleDateString() : value || `Enter ${label.toLowerCase()}`}
                </p>
            }
        </div>
    )
}

const UpdateButton = ({ onClick, isUpdating }) => (
    <button 
        className="mt-10 w-full bg-gradient-to-r from-[#1d77bc] to-[#2988d1] text-white py-4 px-6 rounded-lg hover:from-[#1a6aa8] hover:to-[#2476b8] transition-all duration-300 transform hover:scale-[1.02] focus:ring-2 focus:ring-offset-2 focus:ring-[#1d77bc] text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
        onClick={onClick}
        disabled={isUpdating}
    >
        {isUpdating ? 'Updating Details...' : 'Update Details'}
    </button>
)

export default function StudentProfile(){
    const student = useSelector(state => state.login.studentDetails)
    const [name, setName] = useState(student?.name || '')
    const [email, setEmail] = useState(student?.email || '')
    const [phone, setPhone] = useState(student?.phone || '')
    const [gender, setGender] = useState(student?.gender || '')
    const [dob, setDob] = useState(student?.dob || '')
    const [referralCode, setReferralCode] = useState(student?.referralCode || '')
    const [address, setAddress] = useState(student?.address || '')
    const [city, setCity] = useState(student?.city || '')
    const [area, setArea] = useState(student?.area || '')
    const [state, setState] = useState(student?.state || '')
    const [isEditing, setIsEditing] = useState({})
    const [errors, setErrors] = useState({})
    const [showModal, setShowModal] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [modalMessage, setModalMessage] = useState('')
    const [isUpdating, setIsUpdating] = useState(false)

    const validateFields = () => {
        let tempErrors = {}
        
        if (!name.trim()) tempErrors.name = "Name is required"
        if (!email.trim()) tempErrors.email = "Email is required"
        else if (!/\S+@\S+\.\S+/.test(email)) tempErrors.email = "Email is invalid"
        if (!phone.trim()) tempErrors.phone = "Phone is required"
        else if (!/^\d{10}$/.test(phone)) tempErrors.phone = "Phone must be 10 digits"
        if (!gender) tempErrors.gender = "Gender is required"
        if (!dob) tempErrors.dob = "Date of birth is required"
        else {
            const dobDate = new Date(dob)
            const today = new Date()
            if (dobDate > today) tempErrors.dob = "Date of birth cannot be in the future"
        }
        if (!address.trim()) tempErrors.address = "Address is required"
        if (!city.trim()) tempErrors.city = "City is required"
        if (!area.trim()) tempErrors.area = "Area is required"
        if (!state.trim()) tempErrors.state = "State is required"

        setErrors(tempErrors)
        return Object.keys(tempErrors).length === 0
    }

    async function handleUpdateDetails(){
        if (!validateFields()) {
            setShowModal(true)
            setIsSuccess(false)
            setModalMessage('Please enter all the details')
            return
        }

        setIsUpdating(true)
        const token = localStorage.getItem('token')
        const data = {
            name, email, phone, gender, dob, referralCode,
            address, city, area, state, token,
        }
        const updatedStudent = await updateStudentDetails(data)
        if(updatedStudent.success){
            setShowModal(true)
            setIsSuccess(true)
            setModalMessage('Details updated successfully')
            setIsEditing({})
        }else{
            setShowModal(true)
            setIsSuccess(false)
            setModalMessage('Error updating details')
        }
        setIsUpdating(false)
    }
    
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
            <div className="w-full max-w-7xl mx-auto px-4 py-8">
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                    <ProfileHeader name={name} email={email} referralCode={referralCode} gender={gender} />
                    <div className="p-6 sm:p-10">
                        <div className="max-w-6xl mx-auto">
                            <div className="bg-gray-50 rounded-xl p-6 sm:p-8 shadow-inner">
                                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-8 border-b pb-4">Personal Information</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                                    <EditableField
                                        label="Phone Number"
                                        value={phone}
                                        isEditing={isEditing.phone}
                                        setIsEditing={setIsEditing}
                                        onChange={(e) => setPhone(e.target.value)}
                                        error={errors.phone}
                                        type="tel"
                                        fieldKey="phone"
                                    />
                                    <EditableField
                                        label="Gender"
                                        value={gender}
                                        isEditing={isEditing.gender}
                                        setIsEditing={setIsEditing}
                                        onChange={(e) => setGender(e.target.value)}
                                        error={errors.gender}
                                        type="select"
                                        options={[
                                            {value: "male", label: "Male"},
                                            {value: "female", label: "Female"},
                                            {value: "other", label: "Other"}
                                        ]}
                                        fieldKey="gender"
                                    />
                                    <EditableField
                                        label="Date of Birth"
                                        value={dob}
                                        isEditing={isEditing.dob}
                                        setIsEditing={setIsEditing}
                                        onChange={(e) => setDob(e.target.value)}
                                        error={errors.dob}
                                        type="date"
                                        fieldKey="dob"
                                    />
                                    <div className="col-span-1 md:col-span-2">
                                        <EditableField
                                            label="Address"
                                            value={address}
                                            isEditing={isEditing.address}
                                            setIsEditing={setIsEditing}
                                            onChange={(e) => setAddress(e.target.value)}
                                            error={errors.address}
                                            type="textarea"
                                            fieldKey="address"
                                        />
                                    </div>
                                    <EditableField
                                        label="City"
                                        value={city}
                                        isEditing={isEditing.city}
                                        setIsEditing={setIsEditing}
                                        onChange={(e) => setCity(e.target.value)}
                                        error={errors.city}
                                        fieldKey="city"
                                    />
                                    <EditableField
                                        label="Area"
                                        value={area}
                                        isEditing={isEditing.area}
                                        setIsEditing={setIsEditing}
                                        onChange={(e) => setArea(e.target.value)}
                                        error={errors.area}
                                        fieldKey="area"
                                    />
                                    <div className="col-span-1 md:col-span-2">
                                        <EditableField
                                            label="State"
                                            value={state}
                                            isEditing={isEditing.state}
                                            setIsEditing={setIsEditing}
                                            onChange={(e) => setState(e.target.value)}
                                            error={errors.state}
                                            fieldKey="state"
                                        />
                                    </div>
                                </div>
                                <UpdateButton onClick={handleUpdateDetails} isUpdating={isUpdating} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Modal 
                showModal={showModal}
                setShowModal={setShowModal}
                isSuccess={isSuccess}
                modalMessage={modalMessage}
            />
        </div>
    )
}