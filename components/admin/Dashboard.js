  // Dashboard.js
  "use client"
  import React, { useState } from 'react';
  import { StudentEnquiryTable } from './StudentEnquiryTable';
  import { ContactUsTable } from './ContactUsTable';
  import ChangePassword from './ChangePassword';
  import EnrolledStudentsList from './EnrolledStudentsList';
  import AddProduct from './AddProduct';
  import { useRouter } from 'next/navigation';
  import Modal from '../common/Modal';


  export default function Dashboard() {
    const [activeTab, setActiveTab] = useState('enquiry');
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const router = useRouter();

    async function fetchStudentEnquiries() {
      setActiveTab('enquiry');
    }

    async function fetchContactMessages() {
      setActiveTab('contact');
    }

    function handlePasswordTab() {
      setActiveTab('password');
    }

    function handleEnrolledStudents() {
      setActiveTab('enrolled');
    }

    function handleAddProduct() {
      setActiveTab('addProduct');
    }

    async function handleLogout() {
      localStorage.removeItem('isAdmin');
      setShowLogoutModal(true);
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }

    return (
        <div className="ml-64 min-h-screen w-[calc(100%-16rem)]">
          <div className="pt-8">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-4xl font-semibold text-gray-900">Admin Dashboard</h1>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors duration-200"
                >
                  Logout
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mb-6">
                <button
                  onClick={() => fetchStudentEnquiries()}
                  className={`px-4 py-2 text-sm rounded-full transition-colors duration-200 ${
                    activeTab === 'enquiry'
                      ? 'bg-[#1d77bc] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Student Enquiries
                </button>
                <button
                  onClick={() => fetchContactMessages()}
                  className={`px-4 py-2 text-sm rounded-full transition-colors duration-200 ${
                    activeTab === 'contact'
                      ? 'bg-[#1d77bc] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Contact Us
                </button>
                <button
                  onClick={() => handlePasswordTab()}
                  className={`px-4 py-2 text-sm rounded-full transition-colors duration-200 ${
                    activeTab === 'password'
                      ? 'bg-[#1d77bc] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Change Password
                </button>
                <button
                  onClick={() => handleEnrolledStudents()}
                  className={`px-4 py-2 text-sm rounded-full transition-colors duration-200 ${
                    activeTab === 'enrolled'
                      ? 'bg-[#1d77bc] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Enrolled Students
                </button>
                <button
                  onClick={() => handleAddProduct()}
                  className={`px-4 py-2 text-sm rounded-full transition-colors duration-200 ${
                    activeTab === 'addProduct'
                      ? 'bg-[#1d77bc] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Add Product
                </button>
              </div>
              <div className="mt-4">
                {activeTab === 'enquiry' && <StudentEnquiryTable />}
                {activeTab === 'contact' && <ContactUsTable />}
                {activeTab === 'password' && (
                  <div className="bg-white rounded-lg">
                    <ChangePassword />
                  </div>
                )}
                {activeTab === 'enrolled' && (
                  <div className="bg-white rounded-lg">
                    <EnrolledStudentsList />
                  </div>
                )}
                {activeTab === 'addProduct' && (
                  <div className="bg-white rounded-lg">
                    <AddProduct />
                  </div>
                )}
              </div>
            </div>
          </div>
          <Modal 
          isOpen={showLogoutModal} 
          onClose={() => setShowLogoutModal(false)}
          showModal={showLogoutModal}
          setShowModal={setShowLogoutModal}
          isSuccess={true}
          modalMessage="Logged Out Successfully"
          >
          <div className="p-4 text-center">
            <h3 className="text-base font-medium mb-2">Logged Out Successfully</h3>
            <p className="text-sm text-gray-600">Redirecting...</p>
          </div>
        </Modal>
        </div>
    );
  }