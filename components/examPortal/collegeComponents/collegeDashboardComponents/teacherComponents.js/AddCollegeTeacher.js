"use client"
import React, { useState } from 'react'
import { addCollegeTeacher } from '../../../../../server_actions/actions/examController/collegeActions'
import toast from 'react-hot-toast'
import { EyeIcon, EyeSlashIcon, UserIcon, EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline'

export default function AddCollegeTeacher({ collegeData, onTeacherAdded }) {
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        allocatedSubjects: [],
        allocatedClasses: [],
        profileImageUrl: ''
    })
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        if (name === 'allocatedSubjects') {
            if (checked) {
                setForm(prev => ({ ...prev, allocatedSubjects: [...prev.allocatedSubjects, value] }))
            } else {
                setForm(prev => ({ ...prev, allocatedSubjects: prev.allocatedSubjects.filter(s => s !== value) }))
            }
        } else {
            setForm(prev => ({ ...prev, [name]: value }))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const details = {
            collegeId: collegeData?._id,
            name: form.name.trim(),
            email: form.email.trim(),
            password: form.password,
            allocatedSubjects: form.allocatedSubjects,
            allocatedClasses: form.allocatedClasses,
            profileImageUrl: form.profileImageUrl.trim() || undefined
        }
        setLoading(true)
        const toastId = toast.loading('Adding teacher...')
        try {
            const response = await addCollegeTeacher(details)
            if (response.success) {
                toast.success('Teacher added successfully!', { id: toastId })
                setForm({
                    name: '',
                    email: '',
                    password: '',
                    allocatedSubjects: [],
                    allocatedClasses: [],
                    profileImageUrl: ''
                })
                if (onTeacherAdded) onTeacherAdded();
            } else {
                toast.error(response.message || 'Failed to add teacher', { id: toastId })
            }
        } catch (error) {
            toast.error('An error occurred while adding teacher', { id: toastId })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100/60 p-8 w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <UserIcon className="h-7 w-7 text-gray-400" /> Add College Teacher
            </h2>
            <p className="text-gray-500 mb-6 text-sm">Fill in the details below to add a new teacher to <span className="font-semibold text-gray-700">{collegeData?.name || 'the college'}</span>.</p>
            <form className="space-y-7" onSubmit={handleSubmit}>
                {/* Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <div className="relative">
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-2 pl-11 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-shadow shadow-sm"
                            placeholder="Enter teacher's name"
                            required
                            disabled={loading}
                        />
                        <UserIcon className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                </div>
                {/* Email */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <div className="relative">
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-2 pl-11 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-shadow shadow-sm"
                            placeholder="Enter teacher's email"
                            required
                            disabled={loading}
                        />
                        <EnvelopeIcon className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                </div>
                {/* Password */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-2 pl-11 pr-12 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-shadow shadow-sm"
                            placeholder="Set a password"
                            required
                            disabled={loading}
                        />
                        <LockClosedIcon className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <button
                            type="button"
                            tabIndex={-1}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 focus:outline-none"
                            onClick={() => setShowPassword(v => !v)}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                            {showPassword ? (
                                <EyeSlashIcon className="h-5 w-5" />
                            ) : (
                                <EyeIcon className="h-5 w-5" />
                            )}
                        </button>
                    </div>
                    <span className="text-xs text-gray-400">Password must be at least 6 characters.</span>
                </div>
                {/* Allocated Subjects (Checkboxes) */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Allocated Subjects <span className="text-gray-400 text-xs">(optional, select multiple)</span></label>
                    <div className="flex flex-wrap gap-4 mt-2 bg-white/70 rounded-xl px-4 py-3 shadow-inner border border-gray-100/60">
                        {Array.isArray(collegeData?.allocatedSubjects) && collegeData.allocatedSubjects.length > 0 ? (
                            collegeData.allocatedSubjects.map((subject, idx) => (
                                <label key={idx} className="inline-flex items-center space-x-2 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        name="allocatedSubjects"
                                        value={subject}
                                        checked={form.allocatedSubjects.includes(subject)}
                                        onChange={handleChange}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-200 h-5 w-5 bg-white/80 shadow-sm"
                                        disabled={loading}
                                    />
                                    <span className="text-gray-900 font-medium">{subject}</span>
                                </label>
                            ))
                        ) : (
                            <span className="text-gray-500 text-sm">No subjects available</span>
                        )}
                    </div>
                </div>
                {/* Allocated Classes (Checkboxes) */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Allocated Classes</label>
                    <span className="text-xs text-gray-400">Select one or both classes</span>
                    <div className="flex gap-6 mt-3 bg-white/70 rounded-xl px-4 py-3 shadow-inner border border-gray-100/60">
                        {["11", "12"].map(cls => (
                            <label key={cls} className="inline-flex items-center space-x-2 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    name="allocatedClasses"
                                    value={cls}
                                    checked={form.allocatedClasses.includes(cls)}
                                    onChange={e => {
                                        if (e.target.checked) {
                                            setForm(prev => ({ ...prev, allocatedClasses: [...prev.allocatedClasses, cls] }))
                                        } else {
                                            setForm(prev => ({ ...prev, allocatedClasses: prev.allocatedClasses.filter(c => c !== cls) }))
                                        }
                                    }}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-200 h-5 w-5 bg-white/80 shadow-sm"
                                    disabled={loading}
                                />
                                <span className="text-gray-900 font-medium">{cls}th</span>
                            </label>
                        ))}
                    </div>
                </div>
                {/* Profile Image URL */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image URL <span className="text-gray-400 text-xs">(optional)</span></label>
                    <input
                        type="text"
                        name="profileImageUrl"
                        value={form.profileImageUrl}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-shadow shadow-sm"
                        placeholder="Paste image URL (optional)"
                        disabled={loading}
                    />
                </div>
                {/* Submit Button */}
                <div>
                    <button
                        type="submit"
                        className="w-full py-2 px-4 rounded-xl bg-blue-600/90 text-white font-semibold shadow hover:bg-blue-700/90 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        disabled={loading}
                    >
                        {loading && (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                            </svg>
                        )}
                        {loading ? 'Adding...' : 'Add Teacher'}
                    </button>
                </div>
            </form>
        </div>
    )
}
