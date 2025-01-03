"use client"
import React, { useState, useEffect } from 'react';
import { getEnquiries } from '../../server_actions/actions/adminActions';
import { DataTable } from './DataTable';
import { MessagePopup } from './MessagePopup';
import {  messageSeenEnquiryForm, contactedToogle } from '../../server_actions/actions/adminActions';

export const StudentEnquiryTable = () => {
  const [enquiriesData, setEnquiriesData] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [selectedStudentName, setSelectedStudentName] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [unseenCount, setUnseenCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [followUpNote, setFollowUpNote] = useState('');
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [selectedEnquiryId, setSelectedEnquiryId] = useState(null);
  const [contactedId, setContactedId] = useState("");

  const enquiryHeaders = ['Date & Time', 'Name', 'Email', 'Mobile', 'Stream', 'Class', 'Message', 'Contacted'];

  useEffect(() => {
    const fetchData = async () => {
      const data = await getEnquiries(currentPage);
      setEnquiriesData(data.enquiries);
      setTotalPages(data.totalPages);
      setUnseenCount(data.unseenCount);
      setTotalCount(data.totalCount);
    };
    fetchData();
  }, [currentPage]);

  const toggleContacted = (enquiry) => {
    setContactedId(enquiry._id);
    setFollowUpNote(enquiry.followUpNote)
    setShowFollowUpModal(true);
  };

    const handleFollowUpSubmit = async () => {
    const contactStatus = await contactedToogle(contactedId, followUpNote);
    if(contactStatus.success == true) {
      enquiriesData.map(item => {
        if(item._id == contactedId) {
          item.contacted = true;
          item.followUpNote = followUpNote;
        }
      })
      setShowFollowUpModal(false);
      setFollowUpNote('');
      setContactedId("");
    }else{
      alert("Something went wrong");
    }
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
            if(!enquiry.seen) {
              setUnseenCount(unseenCount - 1);
            }
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
          onClick={() => toggleContacted(enquiry)}
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
        title={
          <div className="flex items-center justify-between w-full">
            <span>Student Enquiries</span>
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-lg shadow-md flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <div>
                  <span className="text-blue-800 font-semibold text-lg">{totalCount}</span>
                  <span className="text-blue-600 text-sm ml-2">Total Messages</span>
                </div>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg shadow-md flex items-center gap-2">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <div>
                  <span className="text-yellow-800 font-semibold text-lg">{unseenCount}</span>
                  <span className="text-yellow-600 text-sm ml-2">Unseen Messages</span>
                </div>
              </div>
            </div>
          </div>
        }
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
      <FollowUpModal 
        showModal={showFollowUpModal}
        onClose={() => {
          setShowFollowUpModal(false);
          setFollowUpNote('');
          setSelectedEnquiryId(null);
        }}
        followUpNote={followUpNote}
        setFollowUpNote={setFollowUpNote}
        onSubmit={handleFollowUpSubmit}
      />
    </>
  );
};

const FollowUpModal = ({ showModal, onClose, followUpNote, setFollowUpNote, onSubmit }) => {
  return (
    showModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg w-96">
          <h2 className="text-xl font-semibold mb-4">Follow Up Message</h2>
          <textarea
            value={followUpNote}
            onChange={(e) => setFollowUpNote(e.target.value)}
            className="w-full h-32 p-2 border rounded-lg mb-4"
            placeholder="Enter follow up notes..."
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    )
  );
};