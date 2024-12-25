"use client"
import React, { useEffect, useState } from 'react';
import { getContactUs } from '../../server_actions/actions/adminActions';
import { DataTable } from './DataTable';
import { messageSeenContactUs } from '../../server_actions/actions/adminActions';

export const ContactUsTable = () => {
  const [contactData, setContactData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const contactHeaders = ['Date', 'Name', 'Email', 'Mobile', 'Interest Area', 'Message', 'Contacted'];

  useEffect(() => {
    const fetchData = async () => {
      const data = await getContactUs(currentPage);
      setContactData(data.contactUs);
      setTotalPages(data.totalPages);
      // console.log(data.contactUs[0].seen);
    };
    fetchData();
  }, [currentPage]);
  
  const handlePageChange = async (newPage) => {
    setCurrentPage(newPage);
    const data = await getContactUs(newPage);
    setContactData(data.contactUs);
    setTotalPages(data.totalPages);
  };

  const handleContactToggle = async (messageId, currentStatus) => {
    
  };

  const renderContactRow = (message, index) => (
    <tr key={message.id || index} className={`border-b border-gray-50 last:border-0 ${message.seen ? 'bg-green-50' : ''}`}>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
        {new Date(message.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}<br/>
        {new Date(message.createdAt).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{message.name}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{message.email}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{message.mobile_number}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{message.interest_area}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
        <button
          onClick={async () => {
            if (!message.seen) {
              const messageStatus = await messageSeenContactUs(message._id);
              const updatedData = contactData.map(item => 
                item._id === message._id ? { ...item, seen: true } : item
              );
              setContactData(updatedData);
            }
            setSelectedMessage(message);
            setIsModalOpen(true);
          }}
          className="text-blue-600 hover:text-blue-800"
        >
          {message.seen ? (
            <div className="flex items-center">
              <svg className="w-5 h-5" fill="none" stroke="green" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-green-500">Seen</span>
            </div>
          ) : (
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              <span>View</span>
            </div>
          )}
        </button>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            id={`contact-toggle-${message.id}`}
            checked={message.contacted}
            onChange={() => handleContactToggle(message.id, message.contacted)}
            className="sr-only peer"
          />
          <div className={`w-11 h-6 ${message.contacted ? 'bg-green-500' : 'bg-red-500'} peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
        </label>
      </td>
    </tr>
  );

  return (
    <>
      <DataTable 
        title="Contact Messages"
        headers={contactHeaders}
        data={contactData}
        renderRow={renderContactRow}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
      
      {isModalOpen && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Message from {selectedMessage.name}</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mt-2">
              <p className="text-gray-600">{selectedMessage.message}</p>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};