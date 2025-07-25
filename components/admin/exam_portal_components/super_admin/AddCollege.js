import { useState } from 'react';
import { addCollege } from '../../../../server_actions/actions/adminActions';
import ImageUpload from '../../../common/ImageUpload';
import { data, getTopics } from '../../../../utils/examUtils/subject_Details';


// for now we can only allocate subjects to the college but i want to alocate the college to the stream, subject as well as class
// when the user selects the stream automatically check the subjects in the checkbox and keep 11th or 12th as option for class

export default function AddCollege({ onAddCollege, setShowAddForm }) {
  const [errors, setErrors] = useState({});
  const [newCollege, setNewCollege] = useState({
    name: '',
    location: '',
    contact: '',
    email: '',
    principalName: '',
    principalContact: '',
    address: '',
    collegeCode: '',
    website: '',
    collegeLogo: '',
    password: 'collegeadmin@123',
    isActive: true,
  });
  const [imagePreview, setImagePreview] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedStreams, setSelectedStreams] = useState([]); // NEW: for streams
  const [selectedClass, setSelectedClass] = useState([]); // Now an array for multi-select

  const getAllSubjects = () => {
    const subjects = new Set();
    ['JEE', 'NEET', 'MHT-CET'].forEach(stream => {
      Object.keys(data[stream] || {}).forEach(subject => {
        subjects.add(subject);
      });
    });
    return Array.from(subjects);
  };

  // Helper to get all streams
  const getAllStreams = () => Object.keys(data);

  // Helper to get subjects for selected streams
  const getSubjectsForStreams = (streams) => {
    const subjects = new Set();
    streams.forEach(stream => {
      Object.keys(data[stream] || {}).forEach(subject => {
        subjects.add(subject);
      });
    });
    return Array.from(subjects);
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'name': // collegeName
        if (!value) return 'College name is required';
        return value.length >= 3 ? '' : 'College name must be at least 3 characters';
        
      case 'collegeCode':
        if (!value) return 'College code is required';
        return value.length >= 2 ? '' : 'College code must be at least 2 characters';
        
      case 'location': // collegeLocation
        if (!value) return 'Location is required';
        return value.length >= 2 ? '' : 'Location must be at least 2 characters';
        
      case 'contact': // collegeContact
        if (!value) return 'Contact number is required';
        return /^[0-9]{10}$/.test(value) ? '' : 'Contact must be 10 digits';
        
      case 'email': // collegeEmail
        if (!value) return 'Email is required';
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'Invalid email format';
        
      case 'website': // collegeWebsite - optional
        return value === '' || /^https?:\/\/.+\..+/.test(value) ? '' : 'Invalid website URL';
        
      case 'principalName': // optional
        return value === '' || value.length >= 3 ? '' : 'Principal name must be at least 3 characters';
        
      case 'principalContact': // optional
        return value === '' || /^[0-9]{10}$/.test(value) ? '' : 'Contact must be 10 digits';
        
      case 'address': // Address - optional
        return value === '' || value.length >= 10 ? '' : 'Address must be at least 10 characters';
        
      case 'password':
        if (!value) return 'Password is required';
        return value.length >= 6 ? '' : 'Password must be at least 6 characters';
        
      default:
        return '';
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle phone number fields
    if (name === 'contact' || name === 'principalContact') {
      // Return early if non-numeric key is pressed
      if (!/^\d*$/.test(value)) {
        return;
      }
      
      // Limit to 10 digits
      const numbersOnly = value.slice(0, 10);
      setNewCollege({
        ...newCollege,
        [name]: numbersOnly
      });
      
      const error = validateField(name, numbersOnly);
      setErrors({
        ...errors,
        [name]: error
      });
      return;
    }

    // Handle other fields
    setNewCollege({
      ...newCollege,
      [name]: value
    });
    
    const error = validateField(name, value);
    setErrors({
      ...errors,
      [name]: error
    });
  };

  // Handle toggle switch for isActive
  const handleToggleChange = () => {
    setNewCollege({
      ...newCollege,
      isActive: !newCollege.isActive
    });
  };

  // Handle stream selection
  const handleStreamChange = (stream) => {
    let updatedStreams;
    if (selectedStreams.includes(stream)) {
      updatedStreams = selectedStreams.filter(s => s !== stream);
    } else {
      updatedStreams = [...selectedStreams, stream];
    }
    setSelectedStreams(updatedStreams);
    // Auto-select subjects for selected streams
    const autoSubjects = getSubjectsForStreams(updatedStreams);
    setSelectedSubjects(autoSubjects);
  };

  // Handle class selection (multi-select)
  const handleClassChange = (classValue) => {
    if (selectedClass.includes(classValue)) {
      setSelectedClass(selectedClass.filter(c => c !== classValue));
    } else {
      setSelectedClass([...selectedClass, classValue]);
    }
  };

  const getInputClassName = (fieldName) => {
    const baseClasses = "mt-1 block w-full rounded-md border px-3 py-2";
    return `${baseClasses} ${
      errors[fieldName] 
        ? "border-red-500 focus:border-red-500 focus:ring-red-500" 
        : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
    }`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Custom validation for streams and classes
    let customErrors = {};
    if (selectedStreams.length === 0) {
      customErrors.selectedStreams = 'At least one stream must be selected.';
    }
    if (selectedClass.length === 0) {
      customErrors.selectedClass = 'At least one class must be selected.';
    }
    // Check for any validation errors
    const fieldErrors = {};
    Object.keys(newCollege).forEach(key => {
      if (key !== 'isActive') { // Skip validation for boolean fields
        const error = validateField(key, newCollege[key]);
        if (error) fieldErrors[key] = error;
      }
    });
    const allErrors = { ...fieldErrors, ...customErrors };
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      return;
    }

    // Map the form fields to match the MongoDB schema
    const collegeData = {
      collegeName: newCollege.name,
      collegeCode: newCollege.collegeCode,
      collegeLocation: newCollege.location,
      collegeContact: newCollege.contact,
      collegeEmail: newCollege.email,
      collegeWebsite: newCollege.website,
      principalName: newCollege.principalName,
      principalContact: newCollege.principalContact,
      Address: newCollege.address,
      collegeLogo: newCollege.collegeLogo,
      password: newCollege.password,
      isActive: newCollege.isActive,
      allocatedStreams: selectedStreams, // NEW
      allocatedClasses: selectedClass, // Now an array
      allocatedSubjects: selectedSubjects
    };

    try {
      const response = await addCollege(collegeData);
      // Show success alert
      alert('College added successfully!');
      // Reset form
      setNewCollege({
        name: '',
        location: '',
        contact: '',
        email: '',
        principalName: '',
        principalContact: '',
        address: '',
        collegeCode: '',
        website: '',
        collegeLogo: '',
        password: 'collegeadmin@123',
        isActive: true
      });
      setImagePreview('');
      setSelectedSubjects([]);
      setSelectedStreams([]); // NEW
      setSelectedClass([]); // NEW
      if (onAddCollege) {
        await onAddCollege();
      }
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding college:', error);
      // Show error alert
      alert('Failed to add college. Please try again.');
      setErrors({
        submit: 'Failed to add college. Please try again.'
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Add New College</h2>
        <button
          onClick={() => setShowAddForm(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">College Logo</label>
          <ImageUpload
            aspectRatio={1}
            onImageUploaded={(imageUrl) => {
              setNewCollege({
                ...newCollege,
                collegeLogo: imageUrl
              });
              setImagePreview(imageUrl);
            }}
            className="mt-1"
            maxWidth={300}
            maxHeight={300}
            required={false}
          />
          {imagePreview && (
            <div className="mt-2">
              <img 
                src={imagePreview} 
                alt="College Logo Preview" 
                className="w-32 h-32 object-cover rounded-lg border border-gray-200"
              />
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">College Name</label>
            <input
              type="text"
              name="name"
              value={newCollege.name}
              onChange={handleInputChange}
              className={getInputClassName('name')}
              required
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">College Code</label>
            <input
              type="text"
              name="collegeCode"
              value={newCollege.collegeCode}
              onChange={handleInputChange}
              className={getInputClassName('collegeCode')}
              required
            />
            {errors.collegeCode && (
              <p className="mt-1 text-sm text-red-600">{errors.collegeCode}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <input
              type="text"
              name="location"
              value={newCollege.location}
              onChange={handleInputChange}
              className={getInputClassName('location')}
              required
            />
            {errors.location && (
              <p className="mt-1 text-sm text-red-600">{errors.location}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Contact Number</label>
            <input
              type="tel"
              name="contact"
              value={newCollege.contact}
              onChange={handleInputChange}
              onKeyPress={(e) => {
                if (!/[0-9]/.test(e.key)) {
                  e.preventDefault();
                }
              }}
              className={getInputClassName('contact')}
              maxLength="10"
              pattern="[0-9]*"
              inputMode="numeric"
              required
            />
            {errors.contact && (
              <p className="mt-1 text-sm text-red-600">{errors.contact}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={newCollege.email}
              onChange={handleInputChange}
              className={getInputClassName('email')}
              required
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Website</label>
            <input
              type="url"
              name="website"
              value={newCollege.website}
              onChange={handleInputChange}
              className={getInputClassName('website')}
            />
            {errors.website && (
              <p className="mt-1 text-sm text-red-600">{errors.website}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Principal Name</label>
            <input
              type="text"
              name="principalName"
              value={newCollege.principalName}
              onChange={handleInputChange}
              className={getInputClassName('principalName')}
              required
            />
            {errors.principalName && (
              <p className="mt-1 text-sm text-red-600">{errors.principalName}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Principal Contact</label>
            <input
              type="tel"
              name="principalContact"
              value={newCollege.principalContact}
              onChange={handleInputChange}
              onKeyPress={(e) => {
                if (!/[0-9]/.test(e.key)) {
                  e.preventDefault();
                }
              }}
              className={getInputClassName('principalContact')}
              maxLength="10"
              pattern="[0-9]*"
              inputMode="numeric"
              required
            />
            {errors.principalContact && (
              <p className="mt-1 text-sm text-red-600">{errors.principalContact}</p>
            )}
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <textarea
              name="address"
              value={newCollege.address}
              onChange={handleInputChange}
              className={getInputClassName('address')}
              rows="3"
              required
            />
            {errors.address && (
              <p className="mt-1 text-sm text-red-600">{errors.address}</p>
            )}
          </div>
          
          {/* Toggle switch for isActive */}
          <div className="col-span-2">
            <div className="flex items-center">
              <label className="mr-3 text-sm font-medium text-gray-700">Status:</label>
              <div className="relative inline-block w-12 mr-2 align-middle select-none">
                <input
                  type="checkbox"
                  name="isActive"
                  id="isActive"
                  checked={newCollege.isActive}
                  onChange={handleToggleChange}
                  className="absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer focus:outline-none transition-transform duration-200 ease-in"
                  style={{
                    transform: newCollege.isActive ? 'translateX(100%)' : 'translateX(0)',
                    borderColor: newCollege.isActive ? '#4F46E5' : '#D1D5DB',
                  }}
                />
                <label
                  htmlFor="isActive"
                  className={`block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200 ease-in ${
                    newCollege.isActive ? 'bg-indigo-600' : 'bg-gray-300'
                  }`}
                ></label>
              </div>
              <span className={`text-sm ${newCollege.isActive ? 'text-green-600' : 'text-red-600'}`}>
                {newCollege.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
          {/* Streams selection */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Allocated Streams</label>
            <div className="flex gap-4">
              {getAllStreams().map((stream) => (
                <div key={stream} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`stream-${stream}`}
                    name={stream}
                    value={stream}
                    checked={selectedStreams.includes(stream)}
                    onChange={() => handleStreamChange(stream)}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300"
                  />
                  <label htmlFor={`stream-${stream}`} className="ml-2 text-sm text-gray-700">
                    {stream}
                  </label>
                </div>
              ))}
            </div>
            {errors.selectedStreams && (
              <p className="mt-1 text-sm text-red-600">{errors.selectedStreams}</p>
            )}
          </div>
          {/* Class selection (only show if at least one stream is selected) */}
          {selectedStreams.length > 0 && (
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Allocated Class</label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="allocatedClass11"
                    value="11"
                    checked={selectedClass.includes('11')}
                    onChange={() => handleClassChange('11')}
                    className="h-4 w-4 text-blue-600 border-gray-300"
                  />
                  <span className="ml-2">11th</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="allocatedClass12"
                    value="12"
                    checked={selectedClass.includes('12')}
                    onChange={() => handleClassChange('12')}
                    className="h-4 w-4 text-blue-600 border-gray-300"
                  />
                  <span className="ml-2">12th</span>
                </label>
              </div>
              {errors.selectedClass && (
                <p className="mt-1 text-sm text-red-600">{errors.selectedClass}</p>
              )}
            </div>
          )}
          {/* Allocated Subjects (auto-checked for selected streams) */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Allocated Subjects
            </label>
            <div className="grid grid-cols-3 gap-4">
              {getAllSubjects().map((subject) => (
                <div key={subject} className="flex items-center">
                  <input
                    type="checkbox"
                    id={subject}
                    name={subject}
                    value={subject}
                    checked={selectedSubjects.includes(subject)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedSubjects([...selectedSubjects, subject]);
                      } else {
                        setSelectedSubjects(selectedSubjects.filter(s => s !== subject));
                      }
                    }}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300"
                  />
                  <label htmlFor={subject} className="ml-2 text-sm text-gray-700">
                    {subject}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={newCollege.password}
                onChange={handleInputChange}
                className={getInputClassName('password')}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={() => setShowAddForm(false)}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg"
          >
            Add College
          </button>
        </div>
      </form>
    </div>
  );
}