import { useState } from "react";
import { addProduct } from "../../../server_actions/actions/adminActions";
import LoadingSpinner from "../../common/LoadingSpinner";

export default function ProductList({ productsAvailable, handleChange, handleSubmit, errors, message }) {
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
  const [editImage, setEditImage] = useState('')
  const [editCartUrl, setEditCartUrl] = useState('')
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
      image: editImage,
      cart_url: editCartUrl,
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
    setEditImage(product.image || '')
    setEditCartUrl(product.cart_url || '')
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
    setEditImage('')
    setEditCartUrl('')
    setUpdateMessage(null)
  }


  return (
    <div className="w-full min-h-screen py-2 xs:py-4 md:py-6 rounded-lg bg-gray-50">
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
          <option value="mtc">MTC</option>
        </select>
      </div>
      <div className="px-3 space-y-3">
        {filteredProducts.map((product, index) => (
          <div key={index} className="mb-3 p-4 border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 bg-white">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                {product.image && (
                  <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded-lg" />
                )}
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{product.name}</h3>
              </div>
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
                <label className="block text-gray-700 text-sm mb-1">Image URL</label>
                <input
                  type="text"
                  name="image"
                  value={editImage}
                  onChange={(e) => setEditImage(e.target.value)}
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
                  <option value="mtc">MTC</option>
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
              <div>
                <label className="block text-gray-700 text-sm mb-1">Cart URL</label>
                <input
                  type="text"
                  name="cart_url"
                  value={editCartUrl}
                  onChange={(e) => setEditCartUrl(e.target.value)}
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
}