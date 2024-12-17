"use client"
import React, { useState } from 'react';
import { changePassword } from '../../server_actions/actions/adminActions';
import Modal from '../common/modal';

export default function ChangePassword() {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showModal, setShowModal] = useState(false);
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        try {
            const result = await changePassword({
                currentPassword,
                newPassword
            });
            if (result.success) {
                setSuccess('Password changed successfully');
                setError('');
                setShowModal(true);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            }
            else {
                setError(result.message || 'Failed to change password');
                setSuccess('');
            }
        } catch (error) {
            setError(error.message || 'Failed to change password');
            setSuccess('');
        }
    };

    return (
        <div className="w-full min-h-screen py-2 sm:py-6 md:py-8">
            <div className="w-full max-w-full sm:max-w-md mx-auto bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
                <div className="text-center">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                        Change Password
                    </h2>
                    <p className="text-gray-600 text-xs sm:text-sm">
                        Please enter your current password and choose a new one
                    </p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                    <div className="space-y-3 sm:space-y-4">
                        <div className="relative">
                            <label htmlFor="current-password" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                                Current Password
                            </label>
                            <input
                                id="current-password"
                                name="current-password"
                                type="password"
                                required
                                className="relative block w-full rounded-lg border-0 py-2 sm:py-2.5 px-3 sm:px-4 text-sm sm:text-base text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 transition-all duration-200 shadow-sm"
                                placeholder="Enter your current password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <label htmlFor="new-password" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                                New Password
                            </label>
                            <input
                                id="new-password"
                                name="new-password"
                                type="password"
                                required
                                className="relative block w-full rounded-lg border-0 py-2 sm:py-2.5 px-3 sm:px-4 text-sm sm:text-base text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 transition-all duration-200 shadow-sm"
                                placeholder="Enter your new password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <label htmlFor="confirm-password" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                                Confirm New Password
                            </label>
                            <input
                                id="confirm-password"
                                name="confirm-password"
                                type="password"
                                required
                                className="relative block w-full rounded-lg border-0 py-2 sm:py-2.5 px-3 sm:px-4 text-sm sm:text-base text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 transition-all duration-200 shadow-sm"
                                placeholder="Confirm your new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-2 sm:p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs sm:text-sm text-center">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="p-2 sm:p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-xs sm:text-sm text-center">
                            {success}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            className="group relative flex w-full justify-center rounded-lg bg-[#1d77bc] px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-white transition-all duration-200 hover:bg-[#1662a0] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 shadow-sm hover:shadow-md"
                        >
                            <span className="absolute inset-y-0 left-0 flex items-center pl-2 sm:pl-3">
                                <svg className="h-4 w-4 sm:h-5 sm:w-5 text-white group-hover:text-white" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                                </svg>
                            </span>
                            Change Password
                        </button>
                    </div>
                </form>
            </div>

            <Modal
                showModal={showModal}
                setShowModal={setShowModal}
                isSuccess={true}
                modalMessage="Your password has been changed successfully."
            />
        </div>
    )
}