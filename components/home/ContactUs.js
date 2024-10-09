import React, { useState } from 'react'
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa'

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle form submission here
    console.log(formData)
    // Reset form after submission
    setFormData({ name: '', email: '', message: '' })
  }

  return (
    <section className="bg-gray-100 py-20" id='contact-us-section'>
      <div className="container mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-extrabold text-center mb-10 text-gray-800 leading-tight">Contact Us</h2>
        <p className="text-lg md:text-xl text-gray-700 text-center mb-16 max-w-3xl mx-auto leading-relaxed">We are a passionate team dedicated to delivering high-quality solutions to our clients, with a focus on innovation and customer satisfaction.</p>
        
        <div className="flex flex-col md:flex-row bg-white rounded-2xl shadow-2xl overflow-hidden max-w-4xl mx-auto">
          <div className="md:w-1/2 bg-gradient-to-br from-[#106fb8] to-[#0d5a94] p-8">
            <h3 className="text-2xl font-bold text-white mb-6">Connect With Us</h3>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center text-xl text-[#106fb8] bg-white hover:bg-gray-100 rounded-full p-3 transition-all duration-300 ease-in-out transform hover:scale-110 shadow-lg"><FaFacebook /></a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center text-xl text-[#106fb8] bg-white hover:bg-gray-100 rounded-full p-3 transition-all duration-300 ease-in-out transform hover:scale-110 shadow-lg"><FaTwitter /></a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center text-xl text-pink-600 bg-white hover:bg-gray-100 rounded-full p-3 transition-all duration-300 ease-in-out transform hover:scale-110 shadow-lg"><FaInstagram /></a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center text-xl text-[#106fb8] bg-white hover:bg-gray-100 rounded-full p-3 transition-all duration-300 ease-in-out transform hover:scale-110 shadow-lg"><FaLinkedin /></a>
            </div>
            <div className="space-y-4">
              <a href="tel:+1234567890" className="text-base text-gray-600 hover:text-gray-800 transition-all duration-300 ease-in-out flex items-center bg-blue-50 rounded-lg p-3 hover:bg-gradient-to-r hover:from-blue-100 hover:to-blue-200"><FaPhone className="mr-3 text-lg" /> +1 (234) 567-890</a>
              <a href="tel:+9876543210" className="text-base text-gray-600 hover:text-gray-800 transition-all duration-300 ease-in-out flex items-center bg-blue-50 rounded-lg p-3 hover:bg-gradient-to-r hover:from-blue-100 hover:to-blue-200"><FaPhone className="mr-3 text-lg" /> +9 (876) 543-210</a>
              <a href="mailto:contact@dummyemail.com" className="text-base text-gray-600 hover:text-gray-800 transition-all duration-300 ease-in-out flex items-center bg-blue-50 rounded-lg p-3 hover:bg-gradient-to-r hover:from-blue-100 hover:to-blue-200"><FaEnvelope className="mr-3 text-lg" /> contact@dummyemail.com</a>
              <div className="text-base text-gray-600 flex items-center bg-blue-50 rounded-lg p-3 transition-all duration-300 ease-in-out hover:bg-gradient-to-r hover:from-blue-100 hover:to-blue-200">
                <FaMapMarkerAlt className="mr-3 text-lg" />
                <address className="not-italic">
                  123 Main Street, Suite 456<br />
                  Cityville, State 78901<br />
                  Country
                </address>
              </div>
            </div>
          </div>
          <div className="md:w-1/2 p-8 bg-gray-50 flex items-center justify-center">
            <div className="w-full max-w-md">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Send A Message</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#106fb8] focus:ring focus:ring-[#106fb8] focus:ring-opacity-50 transition duration-300 ease-in-out px-3 py-2 bg-white"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#106fb8] focus:ring focus:ring-[#106fb8] focus:ring-opacity-50 transition duration-300 ease-in-out px-3 py-2 bg-white"
                    placeholder="your.email@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    rows="4"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#106fb8] focus:ring focus:ring-[#106fb8] focus:ring-opacity-50 transition duration-300 ease-in-out px-3 py-2 bg-white resize-none"
                    placeholder="Your message here..."
                  ></textarea>
                </div>
                <div>
                  <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-base font-semibold text-white bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition duration-300 ease-in-out transform hover:scale-105">
                    Send Message
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div className="mt-10 text-center">
          <a href="/terms-and-conditions" className="text-[#106fb8] hover:text-[#0d5a94] mr-4 text-sm sm:text-base">Terms and Conditions</a>
          <a href="/privacy-policy" className="text-[#106fb8] hover:text-[#0d5a94] text-sm sm:text-base">Privacy Policy</a>
        </div>
        <div className="mt-3 text-center text-gray-600 text-xs sm:text-sm">
          © {new Date().getFullYear()} Vichar Group. All rights reserved.
        </div>
      </div>
    </section>
  )
}

export default ContactUs