  // Dashboard.js
  "use client"
  import React, { useState } from 'react';
  import { StudentEnquiryTable } from './StudentEnquiryTable';
  import { ContactUsTable } from './ContactUsTable';
  import ChangePassword from './ChangePassword';
  import EnrolledStudentsList from './EnrolledStudentsList';
  import AddProduct from './product-controls/AddProduct';
  import { useRouter } from 'next/navigation';
  import Modal from '../common/Modal';
  import PaymentsHome from './payments/PaymentsHome';


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

    function handlePayments() {
      setActiveTab('payments');
    }

    async function handleLogout() {
      localStorage.removeItem('isAdmin');
      setShowLogoutModal(true);
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }

    return (
        <div className="md:ml-64 min-h-screen w-full md:w-[calc(100%-16rem)] px-4 md:px-0">
          <div className="pt-8">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-2xl md:text-4xl font-semibold text-gray-900 text-center md:text-left">Admin Dashboard</h1>
                <button
                  onClick={handleLogout}
                  className="w-full md:w-auto px-4 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors duration-200"
                >
                  Logout
                </button>
              </div>
              <div className="flex flex-col md:flex-row flex-wrap gap-2 mb-6">
                <button
                  onClick={() => fetchStudentEnquiries()}
                  className={`w-full md:w-auto px-4 py-2 text-sm rounded-full transition-colors duration-200 ${
                    activeTab === 'enquiry'
                      ? 'bg-[#1d77bc] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Student Enquiries
                </button>
                <button
                  onClick={() => fetchContactMessages()}
                  className={`w-full md:w-auto px-4 py-2 text-sm rounded-full transition-colors duration-200 ${
                    activeTab === 'contact'
                      ? 'bg-[#1d77bc] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Contact Us
                </button>
                <button
                  onClick={() => handlePasswordTab()}
                  className={`w-full md:w-auto px-4 py-2 text-sm rounded-full transition-colors duration-200 ${
                    activeTab === 'password'
                      ? 'bg-[#1d77bc] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Change Password
                </button>
                <button
                  onClick={() => handleEnrolledStudents()}
                  className={`w-full md:w-auto px-4 py-2 text-sm rounded-full transition-colors duration-200 ${
                    activeTab === 'enrolled'
                      ? 'bg-[#1d77bc] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Enrolled Students
                </button>
                <button
                  onClick={() => handleAddProduct()}
                  className={`w-full md:w-auto px-4 py-2 text-sm rounded-full transition-colors duration-200 ${
                    activeTab === 'addProduct'
                      ? 'bg-[#1d77bc] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Add Product
                </button>
                <button
                  onClick={() => handlePayments()}
                  className={`w-full md:w-auto px-4 py-2 text-sm rounded-full transition-colors duration-200 ${
                    activeTab === 'payments'
                      ? 'bg-[#1d77bc] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Payments
                </button>
              </div>
              <div className="mt-4 overflow-x-auto">
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
                {activeTab === 'payments' && (
                  <div className="bg-white rounded-lg">
                    <PaymentsHome />
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