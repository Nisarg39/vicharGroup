"use client"
import React, { useState, useEffect } from 'react';
import { getEnquiries } from '../../server_actions/actions/adminActions';
import { DataTable } from './DataTable';
import { MessagePopup } from './MessagePopup';
import {  messageSeenEnquiryForm } from '../../server_actions/actions/adminActions';

export const StudentEnquiryTable = () => {
  const [enquiriesData, setEnquiriesData] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [selectedStudentName, setSelectedStudentName] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const enquiryHeaders = ['Date & Time', 'Name', 'Email', 'Mobile', 'Stream', 'Class', 'Message', 'Contacted'];

  useEffect(() => {
    const fetchData = async () => {
      const data = await getEnquiries(currentPage);
      setEnquiriesData(data.enquiries);
      setTotalPages(data.totalPages);
    };
    fetchData();
  }, [currentPage]);
  const toggleContacted = (index) => {
    const updatedEnquiries = [...enquiriesData];
    updatedEnquiries[index] = {
      ...updatedEnquiries[index],
      contacted: !updatedEnquiries[index].contacted
    };
    setEnquiriesData(updatedEnquiries);
  };

  const handlePageChange = async (newPage) => {
    setCurrentPage(newPage);
    const data = await getEnquiries(newPage);
    setEnquiriesData(data.enquiries);
    setTotalPages(data.totalPages);
  };

  const renderEnquiryRow = (enquiry, index) => (
    <tr key={index} className={`${enquiry.seen ? 'bg-green-50' : 'bg-white'} border-b border-gray-50 last:border-0`}>
      <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
        <div className="flex flex-col">
          <span>{new Date(enquiry.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
          <span>{new Date(enquiry.createdAt).toLocaleDateString()}</span>
        </div>
      </td>
      <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600">{enquiry.fullName}</td>
      <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600">{enquiry.email}</td>
      <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600">{enquiry.mobile}</td>
      <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600">{enquiry.stream}</td>
      <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600">{enquiry.class}</td>
      <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm">
        <button 
          onClick={async () => {
            await messageSeenEnquiryForm(enquiry._id);
            setSelectedMessage(enquiry.message);
            setSelectedStudentName(enquiry.fullName);
            const updatedEnquiries = [...enquiriesData];
            updatedEnquiries[index] = {
              ...updatedEnquiries[index],
              seen: true
            };
            setEnquiriesData(updatedEnquiries);
          }}
          className="text-blue-600 hover:text-blue-800 flex items-center gap-2 transition-colors duration-200"
        >
          {enquiry.seen ? (
            <>
              <svg className="w-5 h-5" fill="none" stroke="green" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-green-600 hover:text-green-700">Seen</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="#1d77bc" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-[#1d77bc] hover:text-blue-800">View</span>
            </>
          )}
        </button>
      </td>
      <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm">
        <button 
          onClick={() => toggleContacted(index)}
          className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          style={{ backgroundColor: enquiry.contacted ? '#10B981' : '#EF4444' }}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              enquiry.contacted ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </td>
    </tr>
  );

  return (
    <>
      <DataTable 
        title="Student Enquiries"
        headers={enquiryHeaders}
        data={enquiriesData}
        renderRow={renderEnquiryRow}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
      <MessagePopup 
        message={selectedMessage} 
        studentName={selectedStudentName}
        onClose={() => {
          setSelectedMessage(null);
          setSelectedStudentName(null);
        }} 
      />
    </>
  );
};