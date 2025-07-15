"use client"
import React, { useEffect, useState } from 'react'
import { getCollegeTeachers, updateCollegeTeacher } from '../../../../../server_actions/actions/examController/collegeActions'
import { UserIcon, PencilSquareIcon, XMarkIcon, EyeIcon, EyeSlashIcon, MagnifyingGlassIcon, UsersIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export default function CollegeTeachersList({ collegeData, refreshKey, noOuterMargin = false }) {
    const [teachers, setTeachers] = useState([])
    const [loading, setLoading] = useState(true)
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, total: 0, teachersPerPage: 10 })
    const [editingTeacher, setEditingTeacher] = useState(null)
    const [editForm, setEditForm] = useState(null)
    const [editLoading, setEditLoading] = useState(false)
    const [showEditPassword, setShowEditPassword] = useState(false)
    const [search, setSearch] = useState('')
    const [searchInput, setSearchInput] = useState('')
    const teachersPerPage = 10

    // Debounce search input
    useEffect(() => {
        const handler = setTimeout(() => {
            setSearch(searchInput)
        }, 400)
        return () => clearTimeout(handler)
    }, [searchInput])

    const fetchTeachers = async (page = 1, searchTerm = search) => {
        setLoading(true)
        const response = await getCollegeTeachers(collegeData?._id, page, teachersPerPage, searchTerm)
        if (response.success) {
            let data = response.collegeTeachers
            if (typeof data === 'string') data = JSON.parse(data)
            setTeachers(data)
            setPagination(response.pagination || { currentPage: 1, totalPages: 1, total: 0, teachersPerPage })
        } else {
            setTeachers([])
            setPagination({ currentPage: 1, totalPages: 1, total: 0, teachersPerPage })
        }
        setLoading(false)
    }

    useEffect(() => {
        if (collegeData?._id) fetchTeachers(1, search)
        // eslint-disable-next-line
    }, [collegeData?._id, refreshKey, search])

    const handlePageChange = (page) => {
        if (page < 1 || page > pagination.totalPages) return
        fetchTeachers(page)
    }

    const getPageNumbers = () => {
        const { totalPages, currentPage } = pagination
        let pages = []
        if (totalPages <= 7) {
            pages = Array.from({ length: totalPages }, (_, i) => i + 1)
        } else {
            if (currentPage <= 3) {
                pages = [1, 2, 3, 4, '...', totalPages]
            } else if (currentPage >= totalPages - 2) {
                pages = [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
            } else {
                pages = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages]
            }
        }
        return pages
    }

    // Edit logic
    const openEditModal = (teacher) => {
        setEditingTeacher(teacher)
        setEditForm({
            name: teacher.name || '',
            email: teacher.email || '',
            password: '', // leave blank for unchanged
            allocatedSubjects: Array.isArray(teacher.allocatedSubjects) ? teacher.allocatedSubjects : [],
            allocatedClasses: Array.isArray(teacher.allocatedClasses) ? teacher.allocatedClasses : [],
            profileImageUrl: teacher.profileImageUrl || ''
        })
    }
    const closeEditModal = () => {
        setEditingTeacher(null)
        setEditForm(null)
    }
    const handleEditChange = (e) => {
        const { name, value, type, checked } = e.target
        if (name === 'allocatedClasses') {
            if (checked) {
                setEditForm(prev => ({ ...prev, allocatedClasses: [...prev.allocatedClasses, value] }))
            } else {
                setEditForm(prev => ({ ...prev, allocatedClasses: prev.allocatedClasses.filter(c => c !== value) }))
            }
        } else if (name === 'allocatedSubjects') {
            if (checked) {
                setEditForm(prev => ({ ...prev, allocatedSubjects: [...prev.allocatedSubjects, value] }))
            } else {
                setEditForm(prev => ({ ...prev, allocatedSubjects: prev.allocatedSubjects.filter(s => s !== value) }))
            }
        } else {
            setEditForm(prev => ({ ...prev, [name]: value }))
        }
    }
    const handleEditSubmit = async (e) => {
        e.preventDefault()
        // Basic validation
        if (!editForm.name.trim() || !editForm.email.trim()) {
            toast.error('Name and email are required.')
            return
        }
        if (!/^\S+@\S+\.\S+$/.test(editForm.email)) {
            toast.error('Please enter a valid email address.')
            return
        }
        setEditLoading(true)
        const toastId = toast.loading('Updating teacher...')
        const updateData = { ...editForm }
        if (!updateData.password) delete updateData.password // don't update password if left blank
        try {
            const response = await updateCollegeTeacher(editingTeacher._id, updateData)
            if (response.success) {
                toast.success('Teacher updated successfully!', { id: toastId })
                closeEditModal()
                fetchTeachers(pagination.currentPage)
            } else {
                toast.error(response.message || 'Failed to update teacher', { id: toastId })
            }
        } catch (error) {
            toast.error('An error occurred while updating teacher', { id: toastId })
        } finally {
            setEditLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex items-center justify-between px-6 pt-4 pb-2">
                <div className="flex items-center gap-3">
                    <UsersIcon className="h-7 w-7 text-blue-600 bg-blue-100 rounded-full p-1 shadow" />
                    <span className="text-2xl font-bold text-gray-900 tracking-tight">Teachers</span>
                </div>
                <div className="flex items-center gap-2 bg-white/80 backdrop-blur-xl rounded-xl shadow border border-gray-100/60 px-4 py-2">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        value={searchInput}
                        onChange={e => setSearchInput(e.target.value)}
                        placeholder="Search by name or email..."
                        className="w-48 md:w-64 bg-transparent border-none focus:ring-0 text-gray-900 placeholder-gray-400"
                    />
                </div>
            </div>
            
            {/* Teachers Table Section */}
            {loading ? (
                <div className="flex justify-center items-center py-16">
                    <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                    </svg>
                </div>
            ) : teachers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                    <UsersIcon className="h-12 w-12 text-gray-300 mb-2" />
                    <div className="text-gray-700 font-semibold text-lg">No teachers found</div>
                    <div className="text-gray-500 text-sm">Try adjusting your search or add a new teacher.</div>
                </div>
            ) : (
                <div className={`overflow-x-auto rounded-2xl shadow-xl border border-gray-100/60 bg-white/80 backdrop-blur-xl${noOuterMargin ? ' pb-6' : ' mx-6 pb-6'}`}>
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gradient-to-r from-blue-50/60 to-indigo-50/40 sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Photo</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Subjects</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Classes</th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white/80 divide-y divide-gray-100">
                            {teachers.map((teacher, idx) => {
                                const isEditing = editingTeacher && editingTeacher._id === teacher._id
                                const isLast = idx === teachers.length - 1;
                                return (
                                    <>
                                        <tr
                                            key={teacher._id || idx}
                                            className={`transition hover:bg-blue-50/40 ${isEditing ? 'ring-2 ring-blue-300 bg-blue-50/30' : ''}`}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {teacher.profileImageUrl ? (
                                                    <img src={teacher.profileImageUrl} alt={teacher.name} className="h-12 w-12 rounded-full object-cover border-2 border-blue-200 shadow" />
                                                ) : (
                                                    <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center shadow">
                                                        <UserIcon className="h-6 w-6 text-white" />
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-base font-semibold text-gray-900">{teacher.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{teacher.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-wrap gap-1">
                                                    {Array.isArray(teacher.allocatedSubjects) && teacher.allocatedSubjects.length > 0 && teacher.allocatedSubjects.map((subject, i) => (
                                                        <span key={i} className="inline-flex px-2 py-0.5 text-xs font-semibold rounded bg-blue-100 text-blue-800 shadow-sm">{subject}</span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-wrap gap-1">
                                                    {Array.isArray(teacher.allocatedClasses) && teacher.allocatedClasses.length > 0 && teacher.allocatedClasses.map((cls, i) => (
                                                        <span key={i} className="inline-flex px-2 py-0.5 text-xs font-semibold rounded bg-green-100 text-green-800 shadow-sm">{cls}th</span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className={`px-6 py-4 whitespace-nowrap text-center${isLast ? ' pb-6' : ''}`}>
                                                <button
                                                    className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors shadow"
                                                    onClick={() => isEditing ? closeEditModal() : openEditModal(teacher)}
                                                    title={isEditing ? 'Cancel edit' : 'Edit teacher'}
                                                >
                                                    {isEditing ? <XMarkIcon className="h-5 w-5" /> : <PencilSquareIcon className="h-5 w-5" />}
                                                </button>
                                            </td>
                                        </tr>
                                        {isEditing && (
                                            <tr className="bg-white/95">
                                                <td colSpan={6} className="p-6">
                                                    <div className="bg-white/95 backdrop-blur-xl rounded-xl shadow-inner border border-gray-100/60 p-6 z-10">
                                                        <h3 className="text-lg font-bold text-gray-900 mb-4">Edit Teacher</h3>
                                                        <form className="space-y-5" onSubmit={handleEditSubmit}>
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                                                <input
                                                                    type="text"
                                                                    name="name"
                                                                    value={editForm.name}
                                                                    onChange={handleEditChange}
                                                                    className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-shadow shadow-sm"
                                                                    required
                                                                    disabled={editLoading}
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                                                <input
                                                                    type="email"
                                                                    name="email"
                                                                    value={editForm.email}
                                                                    onChange={handleEditChange}
                                                                    className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-shadow shadow-sm"
                                                                    required
                                                                    disabled={editLoading}
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">Password <span className="text-xs text-gray-400">(leave blank to keep unchanged)</span></label>
                                                                <div className="relative">
                                                                    <input
                                                                        type={showEditPassword ? 'text' : 'password'}
                                                                        name="password"
                                                                        value={editForm.password}
                                                                        onChange={handleEditChange}
                                                                        className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-2 pr-12 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-shadow shadow-sm"
                                                                        disabled={editLoading}
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        tabIndex={-1}
                                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 focus:outline-none"
                                                                        onClick={() => setShowEditPassword(v => !v)}
                                                                        aria-label={showEditPassword ? 'Hide password' : 'Show password'}
                                                                    >
                                                                        {showEditPassword ? (
                                                                            <EyeSlashIcon className="h-5 w-5" />
                                                                        ) : (
                                                                            <EyeIcon className="h-5 w-5" />
                                                                        )}
                                                                    </button>
                                                                </div>
                                                                <span className="text-xs text-gray-400">Password must be at least 6 characters.</span>
                                                            </div>
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
                                                                                    checked={editForm.allocatedSubjects.includes(subject)}
                                                                                    onChange={handleEditChange}
                                                                                    className="rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-200 h-5 w-5 bg-white/80 shadow-sm"
                                                                                    disabled={editLoading}
                                                                                />
                                                                                <span className="text-gray-900 font-medium">{subject}</span>
                                                                            </label>
                                                                        ))
                                                                    ) : (
                                                                        <span className="text-gray-500 text-sm">No subjects available</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">Allocated Classes</label>
                                                                <div className="flex gap-6 mt-2 bg-white/70 rounded-xl px-4 py-3 shadow-inner border border-gray-100/60">
                                                                    {["11", "12"].map(cls => (
                                                                        <label key={cls} className="inline-flex items-center space-x-2 cursor-pointer select-none">
                                                                            <input
                                                                                type="checkbox"
                                                                                name="allocatedClasses"
                                                                                value={cls}
                                                                                checked={editForm.allocatedClasses.includes(cls)}
                                                                                onChange={handleEditChange}
                                                                                className="rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-200 h-5 w-5 bg-white/80 shadow-sm"
                                                                                disabled={editLoading}
                                                                            />
                                                                            <span className="text-gray-900 font-medium">{cls}th</span>
                                                                        </label>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image URL <span className="text-gray-400 text-xs">(optional)</span></label>
                                                                <input
                                                                    type="text"
                                                                    name="profileImageUrl"
                                                                    value={editForm.profileImageUrl}
                                                                    onChange={handleEditChange}
                                                                    className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-shadow shadow-sm"
                                                                    disabled={editLoading}
                                                                />
                                                            </div>
                                                            <div>
                                                                <button
                                                                    type="submit"
                                                                    className="w-full py-2 px-4 rounded-xl bg-blue-600/90 text-white font-semibold shadow hover:bg-blue-700/90 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-60 disabled:cursor-not-allowed"
                                                                    disabled={editLoading}
                                                                >
                                                                    {editLoading ? 'Saving...' : 'Save Changes'}
                                                                </button>
                                                            </div>
                                                        </form>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}
            {pagination.totalPages > 1 && (
                <div className={`flex items-center justify-center space-x-2 py-4 bg-white/80 backdrop-blur-xl rounded-xl shadow border border-gray-100/60${noOuterMargin ? ' mt-4' : ' mx-6 mt-4'}`}>
                    <button
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                        disabled={pagination.currentPage === 1}
                        className={`px-3 py-1 rounded-md ${
                            pagination.currentPage === 1
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-white text-gray-700 hover:bg-gray-50 border'
                        }`}
                    >
                        Previous
                    </button>
                    {getPageNumbers().map((page, index) => (
                        <button
                            key={index}
                            onClick={() => typeof page === 'number' && handlePageChange(page)}
                            className={`px-3 py-1 rounded-md ${
                                page === pagination.currentPage
                                    ? 'bg-blue-600 text-white'
                                    : page === '...'
                                    ? 'cursor-default'
                                    : 'bg-white hover:bg-gray-50 border'
                            }`}
                            disabled={page === '...'}
                        >
                            {page}
                        </button>
                    ))}
                    <button
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                        disabled={pagination.currentPage === pagination.totalPages}
                        className={`px-3 py-1 rounded-md ${
                            pagination.currentPage === pagination.totalPages
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-white text-gray-700 hover:bg-gray-50 border'
                        }`}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    )
}
