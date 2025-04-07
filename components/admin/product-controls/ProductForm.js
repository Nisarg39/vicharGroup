import { useState } from "react";

export default function AddProductForm({ handleSubmit, details, handleChange, errors, message }) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSubmit = async (e) => {
    setIsSubmitting(true)
    await handleSubmit(e)
    setIsSubmitting(false)
  }

  return (
    <div className="w-full min-h-screen py-2 xs:py-6 md:py-8 rounded-lg">
      <h1 className="text-2xl font-bold mb-4 text-gray-800 px-4">Add Product</h1>
      {message && (
        <div className={`px-4 py-2 mb-4 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}
      <form className="px-4" onSubmit={onSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm mb-1">Product Name</label>
          <input
            type="text"
            name="name"
            value={details.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1d77bc]"
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm mb-1">Price</label>
          <input
            type="text"
            name="price"
            value={details.price}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1d77bc]"
          />
          {errors.price && <p className="text-red-500 text-sm">{errors.price}</p>}
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm mb-1">Discounted Price</label>
          <input
            type="text"
            name="discountPrice"
            value={details.discountPrice}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1d77bc]"
          />
          {errors.discountPrice && <p className="text-red-500 text-sm">{errors.discountPrice}</p>}
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm mb-1">Class</label>
          <input
            type="text"
            name="class"
            value={details.class}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1d77bc]"
          />
          {errors.class && <p className="text-red-500 text-sm">{errors.class}</p>}
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm mb-1">Duration (in months)</label>
          <input
            type="number"
            name="duration"
            value={details.duration}
            onChange={handleChange}
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1d77bc]"
          />
          {errors.duration && <p className="text-red-500 text-sm">{errors.duration}</p>}
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm mb-1">Product Type</label>
          <select
            name="type"
            value={details.type}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1d77bc]"
          >
            <option value="">Select Type</option>
            <option value="course">Course</option>
            <option value="test-series">Test Series</option>
            <option value="mtc">MTC</option>
          </select>
          {errors.type && <p className="text-red-500 text-sm">{errors.type}</p>}
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm mb-1">Page Parameters</label>
          <input
            type="text"
            name="pageParameters"
            value={details.pageParameters}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1d77bc]"
          />
          {errors.pageParameters && <p className="text-red-500 text-sm">{errors.pageParameters}</p>}
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm mb-1">Image URL</label>
          <input
            type="text"
            name="image"
            value={details.image}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1d77bc]"
          />
          {errors.imageUrl && <p className="text-red-500 text-sm">{errors.imageUrl}</p>}
        </div>
        <button 
          type="submit" 
          disabled={isSubmitting}
          className={`mt-4 px-4 py-2 ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#1d77bc] hover:bg-[#1a6aa8]'} text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1d77bc]`}
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  )
}