import { useState } from 'react'
import Modal from '../common/Modal'
import { addProduct, showProducts } from '../../server_actions/actions/adminActions'
import LoadingSpinner from '../common/LoadingSpinner'

// Add and Update of product is both done with addProduct function
function AddProductForm({ handleSubmit, details, handleChange, errors, message }) {
  return (
    <div className="w-full min-h-screen py-2 xs:py-6 md:py-8 rounded-lg">
      <h1 className="text-2xl font-bold mb-4 text-gray-800 px-4">Add Product</h1>
      {message && (
        <div className={`px-4 py-2 mb-4 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}
      <form className="px-4" onSubmit={handleSubmit}>
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
          <label className="block text-gray-700 text-sm mb-1">Discount Price</label>
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
        <button type="submit" className="mt-4 px-4 py-2 bg-[#1d77bc] text-white rounded-md shadow-sm hover:bg-[#1a6aa8] focus:outline-none focus:ring-2 focus:ring-[#1d77bc]">
          Submit
        </button>
      </form>
    </div>
  )
}

function ProductList({ productsAvailable, handleChange, handleSubmit, errors, message }) {
  const [filteredProducts, setFilteredProducts] = useState(productsAvailable)
  const [filterType, setFilterType] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [editName, setEditName] = useState('')
  const [editPrice, setEditPrice] = useState('')
  const [editDiscountPrice, setEditDiscountPrice] = useState('')
  const [editType, setEditType] = useState('')
  const [editClass, setEditClass] = useState('')
  const [editDuration, setEditDuration] = useState('')
  const [editPageParameters, setEditPageParameters] = useState('')
  const [originalProductName, setOriginalProductName] = useState('')
  const [updateMessage, setUpdateMessage] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  

  async function updateProduct(){
    setIsLoading(true)
    const updatedProduct = {
      name: editName,
      price: editPrice,
      discountPrice: editDiscountPrice,
      type: editType,
      class: editClass,
      duration: editDuration,
      pageParameters: editPageParameters,
      originalName: originalProductName
    }
    try{
        const response = await addProduct(updatedProduct)
        if(response.success){
            setFilteredProducts(productsAvailable.map(product => product.name === originalProductName ? response.product : product))
            setEditingProduct(null)
            setIsModalOpen(false)
            setUpdateMessage({ type: 'success', text: 'Product updated successfully!' })
        } else {
            setUpdateMessage({ type: 'error', text: 'Failed to update product' })
        }
    } catch (error) {
        setUpdateMessage({ type: 'error', text: 'Error updating product: ' + error.message })
    } finally {
        setIsLoading(false)
    }
  }

  const handleFilterChange = (e) => {
    const selectedType = e.target.value
    setFilterType(selectedType)
    
    if (selectedType === '') {
      setFilteredProducts(productsAvailable)
    } else {
      const filtered = productsAvailable.filter(product => product.type === selectedType)
      setFilteredProducts(filtered)
    }
  }

  const handleEditClick = (product) => {
    setEditingProduct(product)
    setEditName(product.name)
    setOriginalProductName(product.name)
    setEditPrice(product.price)
    setEditDiscountPrice(product.discountPrice)
    setEditType(product.type)
    setEditClass(product.class)
    setEditDuration(product.duration)
    setEditPageParameters(product.pageParameters)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingProduct(null)
    setEditName('')
    setEditPrice('')
    setEditDiscountPrice('')
    setEditType('')
    setEditClass('')
    setEditDuration('')
    setEditPageParameters('')
    setUpdateMessage(null)
  }


  return (
    <div className="w-full min-h-screen py-2 xs:py-4 md:py-6 rounded-lg bg-gray-50">
      <h1 className="text-2xl font-bold mb-4 text-gray-800 px-3 border-b pb-3">Product List</h1>
      {updateMessage && (
        <div className={`px-3 py-2 mb-4 rounded ${updateMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {updateMessage.text}
        </div>
      )}
      <div className="px-3 mb-4">
        <select
          name="filterType"
          value={filterType}
          onChange={handleFilterChange}
          className="w-48 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1d77bc]"
        >
          <option value="">All Products</option>
          <option value="course">Courses</option>
          <option value="test-series">Test Series</option>
        </select>
      </div>
      <div className="px-3 space-y-3">
        {filteredProducts.map((product, index) => (
          <div key={index} className="mb-3 p-4 border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 bg-white">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{product.name}</h3>
              <button
                onClick={() => handleEditClick(product)}
                className="px-3 py-1 bg-[#1d77bc] text-white rounded-md hover:bg-[#1a6aa8] focus:outline-none focus:ring-2 focus:ring-[#1d77bc]"
              >
                Edit
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mt-2">
              <p className="text-gray-700 flex items-center">
                <span className="font-medium mr-2">Price:</span>
                <span className="text-green-600">₹{product.price}</span>
              </p>
              <p className="text-gray-700 flex items-center">
                <span className="font-medium mr-2">Discount Price:</span>
                <span className="text-orange-600">₹{product.discountPrice}</span>
              </p>
              <p className="text-gray-700 flex items-center">
                <span className="font-medium mr-2">Type:</span>
                <span className="capitalize bg-[#e8f3fa] text-[#1d77bc] px-2 py-0.5 rounded-full text-sm">
                  {product.type}
                </span>
              </p>
              <p className="text-gray-700 flex items-center">
                <span className="font-medium mr-2">Class:</span>
                <span className="text-gray-600">{product.class}</span>
              </p>
              <p className="text-gray-700 flex items-center">
                <span className="font-medium mr-2">Duration:</span>
                <span className="text-gray-600">{product.duration} months</span>
              </p>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit Product</h2>
            {updateMessage && (
              <div className={`mb-4 px-3 py-2 rounded ${updateMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {updateMessage.text}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1d77bc]"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm mb-1">Price</label>
                <input
                  type="text"
                  name="price"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1d77bc]"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm mb-1">Discount Price</label>
                <input
                  type="text"
                  name="discountPrice"
                  value={editDiscountPrice}
                  onChange={(e) => setEditDiscountPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1d77bc]"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm mb-1">Class</label>
                <input
                  type="text"
                  name="class"
                  value={editClass}
                  onChange={(e) => setEditClass(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1d77bc]"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm mb-1">Duration (in months)</label>
                <input
                  type="number"
                  name="duration"
                  value={editDuration}
                  onChange={(e) => setEditDuration(e.target.value)}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1d77bc]"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm mb-1">Product Type</label>
                <select
                  name="type"
                  value={editType}
                  onChange={(e) => setEditType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1d77bc]"
                >
                  <option value="">Select Type</option>
                  <option value="course">Course</option>
                  <option value="test-series">Test Series</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 text-sm mb-1">Page Parameters</label>
                <input
                  type="text"
                  name="pageParameters"
                  value={editPageParameters}
                  onChange={(e) => setEditPageParameters(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1d77bc]"
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={handleModalClose}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={updateProduct}
                  disabled={isLoading}
                  className="px-4 py-2 bg-[#1d77bc] text-white rounded-md hover:bg-[#1a6aa8] flex items-center"
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="small" />
                      <span className="ml-2">Saving...</span>
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <form className="px-3 mt-6" onSubmit={handleSubmit}>
      </form>
    </div>
  )
}// main function
export default function AddProduct() {
  const [activeComponent, setActiveComponent] = useState('addProduct')
  const [details, setDetails] = useState({
    name: '',
    price: '',
    discountPrice: '',
    type: '',
    class: '',
    duration: '',
    pageParameters: '',
  })

  const [productsAvailable, setProductsAvailable] = useState([])
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState(null)

  const productObject = {
    name: details.name,
    price: details.price,
    discountPrice: details.discountPrice,
    type: details.type,
    class: details.class,
    duration: details.duration,
    pageParameters: details.pageParameters
  }

  const validate = () => {
    const newErrors = {}
    if (!details.name) newErrors.name = 'Product name is required'
    if (!details.price || isNaN(details.price)) newErrors.price = 'Valid price is required'
    if (!details.discountPrice || isNaN(details.discountPrice)) newErrors.discountPrice = 'Valid discount price is required'
    if (!details.type) newErrors.type = 'Product type is required'
    return newErrors
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
    } else {
      setErrors({})
      try {
        const response = await addProduct(productObject)
        if (response.success) {
          setMessage({ type: 'success', text: 'Product added successfully!' })
          setDetails({ name: '', price: '', discountPrice: '', type: '', class: '', duration: '', pageParameters: '' })
        } else {
          setMessage({ type: 'error', text: response.message || 'Failed to add product' })
        }
      } catch (error) {
        setMessage({ type: 'error', text: 'An error occurred while adding the product' })
      }
    }
  }

  async function productList() {
    try {
      const response = await showProducts()
      if (response.success) {
        setProductsAvailable(response.products)
        setActiveComponent('productList')
      } else {
        setMessage({ type: 'error', text: response.message || 'Failed to fetch products' })
        setActiveComponent('productList')
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while fetching products' })
      setActiveComponent('productList')
    }
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="flex justify-center space-x-4 mb-6">
          <button 
            onClick={() => setActiveComponent('addProduct')}
            className={`px-6 py-2 rounded-lg shadow-md transition-all duration-300 ${
              activeComponent === 'addProduct' 
                ? 'bg-[#1d77bc] text-white transform scale-105' 
                : 'bg-white text-[#1d77bc] hover:bg-[#e8f3fa] border border-[#1d77bc]'
            }`}
          >
            Add Product
          </button>
          <button 
            onClick={() => productList()}
            className={`px-6 py-2 rounded-lg shadow-md transition-all duration-300 ${
              activeComponent === 'productList' 
                ? 'bg-[#1d77bc] text-white transform scale-105' 
                : 'bg-white text-[#1d77bc] hover:bg-[#e8f3fa] border border-[#1d77bc]'
            }`}
          >
            Product List
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {activeComponent === 'addProduct' && (
            <AddProductForm 
              handleSubmit={handleSubmit}
              details={details}
              handleChange={handleChange}
              errors={errors}
              message={message}
            />
          )}
          
          {activeComponent === 'productList' && (
            <ProductList 
              productsAvailable={productsAvailable}
              handleChange={handleChange}
              handleSubmit={handleSubmit}
              errors={errors}
              message={message}
            />
          )}
        </div>
      </div>
    </div>
  )
}