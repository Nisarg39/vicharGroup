"use client"
import { useSelector } from "react-redux"
import { useState } from "react"
import { updateStudentDetails } from "../../server_actions/actions/studentActions"
import Modal from "../common/Modal"

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
            name,
            email,
            phone,
            gender,
            dob,
            referralCode,
            address,
            city,
            area,
            state,
            token,
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
        <div className="min-h-screen bg-gray-100">
            <div className="w-full">
                <div className="bg-white shadow-xl overflow-hidden">
                    <div className="bg-[#1d77bc] p-4">
                        <div className="flex items-center gap-6">
                            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white">
                                <img 
                                    src={gender === 'female' ? "https://cdn-icons-gif.flaticon.com/13372/13372960.gif" : "https://cdn-icons-gif.flaticon.com/12146/12146129.gif"} 
                                    alt={gender === 'female' ? "Female avatar" : "Male avatar"} 
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex-1">
                                <h1 className="text-3xl font-bold text-white">
                                    {name || "Not provided"}
                                </h1>
                                <div className="flex items-center gap-4 mt-2">
                                    <p className="text-blue-100 text-lg">
                                        <span className="mr-2">Email:</span>
                                        <span className="bg-white bg-opacity-20 px-3 py-1 rounded">{email || "Not provided"}</span>
                                    </p>
                                    <p className="text-blue-100 text-lg">
                                        <span className="mr-2">Referral Code:</span>
                                        <span className="bg-white bg-opacity-20 px-3 py-1 rounded">{referralCode || "No referral code"}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="p-12">
                        <div className="max-w-6xl mx-auto">
                            <div className="bg-gray-50 rounded-xl p-8 hover:shadow-md transition-shadow">
                                <h2 className="text-3xl font-bold text-gray-800 mb-8">Personal Information</h2>
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                                        {isEditing.phone ? 
                                            <div>
                                                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Enter phone" className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1d77bc] focus:border-transparent"/>
                                                {errors.phone && <div className="text-red-500 text-sm mt-1">{errors.phone}</div>}
                                            </div> :
                                            <p onClick={() => setIsEditing({...isEditing, phone: true})} className="p-3 bg-white rounded-lg border border-gray-200 cursor-pointer">{phone || "Enter phone"}</p>
                                        }
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">Gender</label>
                                        {isEditing.gender ?
                                            <div>
                                                <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1d77bc] focus:border-transparent">
                                                    <option value="">Select gender</option>
                                                    <option value="male">Male</option>
                                                    <option value="female">Female</option>
                                                    <option value="other">Other</option>
                                                </select>
                                                {errors.gender && <div className="text-red-500 text-sm mt-1">{errors.gender}</div>}
                                            </div> :
                                            <p onClick={() => setIsEditing({...isEditing, gender: true})} className="p-3 bg-white rounded-lg border border-gray-200 cursor-pointer">{gender || "Select gender"}</p>
                                        }
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                                        {isEditing.dob ? 
                                            <div>
                                                <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1d77bc] focus:border-transparent"/>
                                                {errors.dob && <div className="text-red-500 text-sm mt-1">{errors.dob}</div>}
                                            </div> :
                                            <p onClick={() => setIsEditing({...isEditing, dob: true})} className="p-3 bg-white rounded-lg border border-gray-200 cursor-pointer">{dob ? new Date(dob).toLocaleDateString() : "Select date"}</p>
                                        }
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700">Address</label>
                                        {isEditing.address ?
                                            <div>
                                                <textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Enter address" className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1d77bc] focus:border-transparent" rows="2"/>
                                                {errors.address && <div className="text-red-500 text-sm mt-1">{errors.address}</div>}
                                            </div> :
                                            <p onClick={() => setIsEditing({...isEditing, address: true})} className="p-3 bg-white rounded-lg border border-gray-200 cursor-pointer">{address || "Enter address"}</p>
                                        }
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">City</label>
                                        {isEditing.city ?
                                            <div>
                                                <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Enter city" className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1d77bc] focus:border-transparent"/>
                                                {errors.city && <div className="text-red-500 text-sm mt-1">{errors.city}</div>}
                                            </div> :
                                            <p onClick={() => setIsEditing({...isEditing, city: true})} className="p-3 bg-white rounded-lg border border-gray-200 cursor-pointer">{city || "Enter city"}</p>
                                        }
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">Area</label>
                                        {isEditing.area ?
                                            <div>
                                                <input type="text" value={area} onChange={(e) => setArea(e.target.value)} placeholder="Enter area" className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1d77bc] focus:border-transparent"/>
                                                {errors.area && <div className="text-red-500 text-sm mt-1">{errors.area}</div>}
                                            </div> :
                                            <p onClick={() => setIsEditing({...isEditing, area: true})} className="p-3 bg-white rounded-lg border border-gray-200 cursor-pointer">{area || "Enter area"}</p>
                                        }
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700">State</label>
                                        {isEditing.state ?
                                            <div>
                                                <input type="text" value={state} onChange={(e) => setState(e.target.value)} placeholder="Enter state" className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1d77bc] focus:border-transparent"/>
                                                {errors.state && <div className="text-red-500 text-sm mt-1">{errors.state}</div>}
                                            </div> :
                                            <p onClick={() => setIsEditing({...isEditing, state: true})} className="p-3 bg-white rounded-lg border border-gray-200 cursor-pointer">{state || "Enter state"}</p>
                                        }
                                    </div>
                                </div>
                                <button 
                                    className="mt-10 w-full bg-[#1d77bc] text-white py-4 px-6 rounded-lg hover:bg-[#1a6aa8] transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-[#1d77bc] text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={handleUpdateDetails}
                                    disabled={isUpdating}
                                >
                                    {isUpdating ? 'Updating Details...' : 'Update Details'}
                                </button>
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