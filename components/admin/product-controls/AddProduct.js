import { useState } from 'react'
import Modal from '../../common/Modal'
import { addProduct, showProducts } from '../../../server_actions/actions/adminActions'
import ProductForm from './ProductForm'
import ProductList from './ProductList'
import CourseControl from './coursePanel/CourseControl'
import SegmentControls from './SegmentControls'
import LoadingSpinner from '../../common/LoadingSpinner'


// main function
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
    image: '',
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
    pageParameters: details.pageParameters,
    image: details.image,
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
        // console.log(productObject)
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

  async function courseControl(){
    setActiveComponent('courseControl')
  }

  function segmentControl(){
    setActiveComponent('segmentControl')
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="flex justify-center space-x-4 mb-6">

          <button 
            onClick={() => segmentControl()}
            className={`px-6 py-2 rounded-lg shadow-md transition-all duration-300 ${
              activeComponent === 'segmentControl' 
                ? 'bg-[#1d77bc] text-white transform scale-105' 
                : 'bg-white text-[#1d77bc] hover:bg-[#e8f3fa] border border-[#1d77bc]'
            }`}
          >
            Segment Control
          </button>
          
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
          <button
            onClick={() => courseControl()}
            className={`px-6 py-2 rounded-lg shadow-md transition-all duration-300 ${
              activeComponent === 'courseControl' 
                ? 'bg-[#1d77bc] text-white transform scale-105' 
                : 'bg-white text-[#1d77bc] hover:bg-[#e8f3fa] border border-[#1d77bc]'
            }`}
          >
            Course Control
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">

          {activeComponent === 'segmentControl' && (
            <SegmentControls />
          )}

          {activeComponent === 'addProduct' && (
            <ProductForm 
              handleSubmit={handleSubmit}
              details={details}
              handleChange={handleChange}
              errors={errors}
              message={message}
            />
          )}

          {activeComponent === 'courseControl' && (
            <CourseControl 

            />
          )}
          
          {activeComponent === 'productList' && (
            productsAvailable ? 
            <ProductList 
              productsAvailable={productsAvailable}
              handleChange={handleChange}
              handleSubmit={handleSubmit}
              errors={errors}
              message={message}
            />
            :
            <div className="flex justify-center items-center h-screen">
              <LoadingSpinner size="large" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}