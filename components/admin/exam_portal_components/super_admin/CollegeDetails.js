"use client"
import { updateCollegeDetails } from "../../../../server_actions/actions/adminActions";
import ImageUpload from "../../../common/ImageUpload";
import { useState } from "react";
import { IoClose } from 'react-icons/io5';
import { MdEmail, MdPhone, MdPerson, MdLocationOn, MdSchool, MdCalendarToday, MdEdit, MdCancel, MdLock } from 'react-icons/md';
import { FaGlobe, FaHashtag, FaMapMarkerAlt } from 'react-icons/fa';
import { data } from '../../../../utils/examUtils/subject_Details';

// Helper to get all subjects
const getAllSubjects = () => {
  const subjects = new Set();
  ['JEE', 'NEET', 'MHT-CET'].forEach(stream => {
    Object.keys(data[stream] || {}).forEach(subject => {
      // Skip positiveMarking and negativeMarking keys, only get subjects
      if (subject !== 'positiveMarking' && subject !== 'negativeMarking') {
        subjects.add(subject);
      }
    });
  });
  return Array.from(subjects);
};

// Helper to get all streams
const getAllStreams = () => Object.keys(data);

// Helper to get all classes
const getAllClasses = () => ['11', '12'];

export default function CollegeDetails({ college, onClose, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [editedCollege, setEditedCollege] = useState({
    ...college,
    collegeLogo: college?.collegeLogo || null,
    password: college.password
  });
  const [errors, setErrors] = useState({});


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedCollege(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle toggle switch for isActive
  const handleToggleChange = () => {
    setEditedCollege(prev => ({
      ...prev,
      isActive: !prev.isActive
    }));
  };

  // Handlers for streams and classes
  const handleStreamChange = (stream) => {
    let updatedStreams;
    if (editedCollege.allocatedStreams?.includes(stream)) {
      updatedStreams = editedCollege.allocatedStreams.filter(s => s !== stream);
    } else {
      updatedStreams = [...(editedCollege.allocatedStreams || []), stream];
    }

    // Auto-select subjects for selected streams
    const getSubjectsForStreams = (streams) => {
      const subjects = new Set();
      streams.forEach(str => {
        const streamData = data[str] || {};
        Object.keys(streamData).forEach(key => {
          // Skip positiveMarking and negativeMarking keys, only get subjects
          if (key !== 'positiveMarking' && key !== 'negativeMarking' && 
              typeof streamData[key] === 'object') {
            subjects.add(key);
          }
        });
      });
      return Array.from(subjects);
    };
    const autoSubjects = getSubjectsForStreams(updatedStreams);

    setEditedCollege(prev => ({
      ...prev,
      allocatedStreams: updatedStreams,
      allocatedSubjects: autoSubjects
    }));
  };

  const handleClassChange = (classValue) => {
    let updatedClasses;
    if (editedCollege.allocatedClasses?.includes(classValue)) {
      updatedClasses = editedCollege.allocatedClasses.filter(c => c !== classValue);
    } else {
      updatedClasses = [...(editedCollege.allocatedClasses || []), classValue];
    }
    setEditedCollege(prev => ({
      ...prev,
      allocatedClasses: updatedClasses
    }));
  };

  const handleSubmit = async () => {
    // Validation for streams and classes
    let customErrors = {};
    if (!editedCollege.allocatedStreams || editedCollege.allocatedStreams.length === 0) {
      customErrors.allocatedStreams = 'At least one stream must be selected.';
    }
    if (!editedCollege.allocatedClasses || editedCollege.allocatedClasses.length === 0) {
      customErrors.allocatedClasses = 'At least one class must be selected.';
    }
    if (Object.keys(customErrors).length > 0) {
      setErrors(customErrors);
      return;
    }
    setErrors({});
    try {
      const updatedData = {
        _id: editedCollege._id,
        ...editedCollege
      };
      
      const response = await updateCollegeDetails(updatedData);
      

      if(response && response.success) {
        setIsEditing(false);
        setEditedCollege(response.college);
        onUpdate(response.college);
        alert("College details updated successfully!");
      } else {
        const errorMessage = response?.message || "Failed to update college details";
        console.error("Update failed:", errorMessage);
        alert(errorMessage);
      }
    } catch (error) {
      console.error("Error updating college details:", error);
      alert("Failed to update college details. Please try again.");
    }
  };

  const renderValue = (label, value, name) => {
    if (!isEditing) {
      return <p className="text-gray-900 text-sm break-all">{value}</p>;
    }
    return (
      <input
        type="text"
        name={name}
        value={editedCollege[name]}
        onChange={handleInputChange}
        className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder={`Enter ${label}`}
      />
    );
  };

  return (
    <div className="w-full max-w-full">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="fixed top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
      >
        <IoClose className="w-5 h-5 text-gray-500" />
      </button>

      {/* Header with Logo */}
      <div className="flex items-start gap-6 mb-8 p-6 bg-gradient-to-r from-white to-gray-50 rounded-xl shadow-sm relative">
        {/* Logo */}
        <div className="flex-shrink-0">
          {/* Always show current logo/placeholder */}
          {(editedCollege?.collegeLogo) ? (
            <img 
              src={editedCollege.collegeLogo}
              alt={`${college?.collegeName || 'College'} logo`}
              className="w-28 h-28 object-cover rounded-xl shadow-md border-4 border-white ring-1 ring-gray-200"
            />
          ) : (
            <div className="w-28 h-28 bg-gradient-to-br from-[#1d77bc] to-[#4da3e4] rounded-xl flex items-center justify-center shadow-md ring-4 ring-white">
              <span className="text-4xl text-white font-bold">
                {college?.collegeName?.charAt(0) || 'C'}
              </span>
            </div>
          )}
          
          {/* Show ImageUpload below when editing */}
          {isEditing && (
            <div className="mt-4">
              <ImageUpload
                onImageUploaded={(url) => setEditedCollege(prev => ({...prev, collegeLogo: url}))}
              />
            </div>
          )}
        </div>

        {/* Title and Basic Info */}
        <div className="flex-grow">
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3 mb-3">
            <MdSchool className="text-[#1d77bc] text-3xl" />
            {isEditing ? (
              <input
                type="text"
                name="collegeName"
                value={editedCollege.collegeName}
                onChange={handleInputChange}
                className="text-3xl font-bold border-b border-gray-300 focus:outline-none focus:border-blue-500 bg-transparent"
              />
            ) : college.collegeName}
          </h2>
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full">
              <FaHashtag className="text-[#1d77bc]" />
              {isEditing ? (
                <input
                  type="text"
                  name="collegeCode"
                  value={editedCollege.collegeCode}
                  onChange={handleInputChange}
                  className="w-24 bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500"
                />
              ) : (
                <span className="font-medium text-gray-700">{college.collegeCode}</span>
              )}
            </div>
            <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full">
              <FaMapMarkerAlt className="text-[#1d77bc]" />
              {isEditing ? (
                <input
                  type="text"
                  name="collegeLocation"
                  value={editedCollege.collegeLocation}
                  onChange={handleInputChange}
                  className="w-32 bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500"
                />
              ) : (
                <span className="font-medium text-gray-700">{college.collegeLocation}</span>
              )}
            </div>
            <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full">
              <MdCalendarToday className="text-[#1d77bc]" />
              <span className="font-medium text-gray-700">
                {new Date(college.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Edit and Cancel Buttons */}
        <div className="absolute top-6 right-6 flex gap-2">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <MdEdit className="w-5 h-5" />
              <span>Edit</span>
            </button>
          ) : (
            <>
              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
              >
                <span>Save</span>
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditedCollege({...college});
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
              >
                <MdCancel className="w-5 h-5" />
                <span>Cancel</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Contact Information Section */}
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <MdEmail className="text-[#1d77bc] text-lg" />
              <p className="text-sm font-semibold text-gray-600">Email</p>
            </div>
            {renderValue("Email", college.collegeEmail, "collegeEmail")}
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <MdPhone className="text-[#1d77bc] text-lg" />
              <p className="text-sm font-semibold text-gray-600">College Contact</p>
            </div>
            {renderValue("Contact Number", college.collegeContact, "collegeContact")}
          </div>
        </div>

        {/* Principal Information Section */}
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <MdPerson className="text-[#1d77bc] text-lg" />
              <p className="text-sm font-semibold text-gray-600">Principal Name</p>
            </div>
            {renderValue("Principal Name", college.principalName, "principalName")}
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <MdPhone className="text-[#1d77bc] text-lg" />
              <p className="text-sm font-semibold text-gray-600">Principal Contact</p>
            </div>
            {renderValue("Principal Contact", college.principalContact, "principalContact")}
          </div>
        </div>

        {/* Website Section */}
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <FaGlobe className="text-[#1d77bc] text-lg" />
              <p className="text-sm font-semibold text-gray-600">Website</p>
            </div>
            {renderValue("Website URL", college.collegeWebsite, "collegeWebsite")}
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <MdLock className="text-[#1d77bc] text-lg" />
              <p className="text-sm font-semibold text-gray-600">College Password</p>
            </div>
            {isEditing ? (
              <input
                type="text"
                name="password"
                value={editedCollege.password}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter new password"
              />
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-gray-900 text-sm font-medium">
                  {showPassword ? college.password : '••••••••••'}
                </p>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  {showPassword ? 'Hide' : 'Show'} Password
                </button>
              </div>
            )}
          </div>
          
          {/* Status Toggle Section */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-4 h-4 rounded-full ${editedCollege.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <p className="text-sm font-semibold text-gray-600">Status</p>
            </div>
            {!isEditing ? (
              <p className={`text-sm ${editedCollege.isActive ? 'text-green-600' : 'text-red-600'} font-medium`}>
                {editedCollege.isActive ? 'Active' : 'Inactive'}
              </p>
            ) : (
              <div className="flex items-center mt-2">
                <div className="relative inline-block w-12 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    name="isActive"
                    id="isActive"
                    checked={editedCollege.isActive}
                    onChange={handleToggleChange}
                    className="absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer focus:outline-none transition-transform duration-200 ease-in"
                    style={{
                      transform: editedCollege.isActive ? 'translateX(100%)' : 'translateX(0)',
                      borderColor: editedCollege.isActive ? '#4F46E5' : '#D1D5DB',
                    }}
                  />
                  <label
                    htmlFor="isActive"
                    className={`block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200 ease-in ${
                      editedCollege.isActive ? 'bg-indigo-600' : 'bg-gray-300'
                    }`}
                  ></label>
                </div>
                <span className={`text-sm ${editedCollege.isActive ? 'text-green-600' : 'text-red-600'} font-medium`}>
                  {editedCollege.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Full Width Address Section */}
        <div className="md:col-span-2 lg:col-span-3 bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <MdLocationOn className="text-[#1d77bc] text-lg" />
            <p className="text-sm font-semibold text-gray-600">Address</p>
          </div>
          {renderValue("Full Address", college.Address, "Address")}
        </div>

        {/* Allocated Streams Section */}
        <div className="md:col-span-2 lg:col-span-3 bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <MdSchool className="text-[#1d77bc] text-lg" />
            <p className="text-sm font-semibold text-gray-600">Allocated Streams</p>
          </div>
          {isEditing ? (
            <>
              <div className="flex gap-4">
                {getAllStreams().map((stream) => (
                  <label key={stream} className="flex items-center">
                    <input
                      type="checkbox"
                      name={`allocatedStream-${stream}`}
                      value={stream}
                      checked={editedCollege.allocatedStreams?.includes(stream)}
                      onChange={() => handleStreamChange(stream)}
                      className="h-4 w-4 text-blue-600 border-gray-300"
                    />
                    <span className="ml-2">{stream}</span>
                  </label>
                ))}
              </div>
              {errors.allocatedStreams && (
                <p className="mt-1 text-sm text-red-600">{errors.allocatedStreams}</p>
              )}
            </>
          ) : (
            <div className="flex flex-wrap gap-2">
              {editedCollege.allocatedStreams?.length > 0 ? (
                editedCollege.allocatedStreams.map((stream, index) => (
                  <span key={index} className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                    {stream}
                  </span>
                ))
              ) : (
                <p className="text-gray-500 italic">No streams allocated</p>
              )}
            </div>
          )}
        </div>

        {/* Allocated Classes Section */}
        <div className="md:col-span-2 lg:col-span-3 bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <MdSchool className="text-[#1d77bc] text-lg" />
            <p className="text-sm font-semibold text-gray-600">Allocated Classes</p>
          </div>
          {isEditing ? (
            <>
              <div className="flex gap-4">
                {getAllClasses().map((classValue) => (
                  <label key={classValue} className="flex items-center">
                    <input
                      type="checkbox"
                      name={`allocatedClass-${classValue}`}
                      value={classValue}
                      checked={editedCollege.allocatedClasses?.includes(classValue)}
                      onChange={() => handleClassChange(classValue)}
                      className="h-4 w-4 text-blue-600 border-gray-300"
                    />
                    <span className="ml-2">{classValue}th</span>
                  </label>
                ))}
              </div>
              {errors.allocatedClasses && (
                <p className="mt-1 text-sm text-red-600">{errors.allocatedClasses}</p>
              )}
            </>
          ) : (
            <div className="flex flex-wrap gap-2">
              {editedCollege.allocatedClasses?.length > 0 ? (
                editedCollege.allocatedClasses.map((classValue, index) => (
                  <span key={index} className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                    {classValue}th
                  </span>
                ))
              ) : (
                <p className="text-gray-500 italic">No classes allocated</p>
              )}
            </div>
          )}
        </div>

        {/* Allocated Subjects Section */}
        <div className="md:col-span-2 lg:col-span-3 bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <MdSchool className="text-[#1d77bc] text-lg" />
            <p className="text-sm font-semibold text-gray-600">Allocated Subjects</p>
          </div>
          {isEditing ? (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-4">
                {getAllSubjects().map((subject) => (
                  <div key={subject} className="flex items-center">
                    <input
                      type="checkbox"
                      id={subject}
                      name={subject}
                      value={subject}
                      checked={editedCollege.allocatedSubjects?.includes(subject)}
                      onChange={(e) => {
                        const subjects = e.target.checked
                          ? [...(editedCollege.allocatedSubjects || []), subject]
                          : editedCollege.allocatedSubjects?.filter(s => s !== subject);
                        setEditedCollege(prev => ({
                          ...prev,
                          allocatedSubjects: subjects
                        }));
                      }}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300"
                    />
                    <label htmlFor={subject} className="ml-2 text-sm text-gray-700">
                      {subject}
                    </label>
                  </div>
                ))}
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-xs text-blue-800">
                    <p className="font-medium">Note:</p>
                    <p>Subjects are auto-selected when you change streams above, but you can manually adjust them here. Marking rules are applied automatically by the system.</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {editedCollege.allocatedSubjects?.length > 0 ? (
                editedCollege.allocatedSubjects.map((subject, index) => (
                  <span key={index} className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                    {subject}
                  </span>
                ))
              ) : (
                <p className="text-gray-500 italic">No subjects allocated</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}