import { useState } from 'react';
import { addCollege } from '../../../../server_actions/actions/adminActions';
import ImageUpload from '../../../common/ImageUpload';

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
    collegeLogo: ''
  });
  const [imagePreview, setImagePreview] = useState('');

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
    
    // Check for any validation errors
    const fieldErrors = {};
    Object.keys(newCollege).forEach(key => {
      const error = validateField(key, newCollege[key]);
      if (error) fieldErrors[key] = error;
    });

    // If there are validation errors, set them and return
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
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
      collegeLogo: newCollege.collegeLogo
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
        collegeLogo: ''
      });
      setImagePreview('');
      
      // Call the onAddCollege prop to trigger table refresh
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