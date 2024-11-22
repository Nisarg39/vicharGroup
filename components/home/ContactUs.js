import React, { useState } from 'react'
import { FaFacebook, FaInstagram, FaPhone, FaEnvelope, FaMapMarkerAlt, FaYoutube } from 'react-icons/fa'

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    message: '',
    interestArea: ''
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle form submission here
    console.log(formData)
    // Reset form after submission
    setFormData({ name: '', email: '', mobile: '', message: '', interestArea: '' })
  }

  return (
    <section className="bg-gray-100 py-20 mt-12" id='contact-us-section'>
      <div className="container mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-extrabold text-center mb-10 text-gray-800 leading-tight">Contact Us</h2>
        <p className="text-lg md:text-xl text-gray-700 text-center mb-16 max-w-3xl mx-auto leading-relaxed">We are a passionate team dedicated to delivering high-quality solutions to our clients, with a focus on innovation and customer satisfaction.</p>
        
        <div className="flex flex-col md:flex-row bg-white rounded-2xl shadow-2xl overflow-hidden max-w-4xl mx-auto">
          <div className="md:w-1/2 bg-gradient-to-br from-[#106fb8] to-[#0d5a94] p-8 flex flex-col justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">Connect With Us</h3>
              <div className="grid grid-cols-3 gap-4 mb-8">
                <a href="https://www.facebook.com/profile.php?id=61565119954603" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center text-xl text-[#106fb8] bg-white hover:bg-gray-100 rounded-full p-3 transition-all duration-300 ease-in-out transform hover:scale-110 shadow-lg"><FaFacebook /></a>
                <a href="https://www.instagram.com/vichar_group/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center text-xl text-pink-600 bg-white hover:bg-gray-100 rounded-full p-3 transition-all duration-300 ease-in-out transform hover:scale-110 shadow-lg"><FaInstagram /></a>
                <a href="https://youtube.com/@vichargroup" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center text-xl text-red-600 bg-white hover:bg-gray-100 rounded-full p-3 transition-all duration-300 ease-in-out transform hover:scale-110 shadow-lg"><FaYoutube /></a>
              </div>
            </div>
            <div className="space-y-4">
              <a href="tel:+919270189405" className="text-base text-gray-600 hover:text-gray-800 transition-all duration-300 ease-in-out flex items-center bg-blue-50 rounded-lg p-3 hover:bg-gradient-to-r hover:from-blue-100 hover:to-blue-200"><FaPhone className="mr-3 text-lg" /> +91 9270189405</a>
              <a href="tel:+919370954406" className="text-base text-gray-600 hover:text-gray-800 transition-all duration-300 ease-in-out flex items-center bg-blue-50 rounded-lg p-3 hover:bg-gradient-to-r hover:from-blue-100 hover:to-blue-200"><FaPhone className="mr-3 text-lg" /> +91 9370954406</a>
              <a href="mailto:info@vichargroup.com" className="text-base text-gray-600 hover:text-gray-800 transition-all duration-300 ease-in-out flex items-center bg-blue-50 rounded-lg p-3 hover:bg-gradient-to-r hover:from-blue-100 hover:to-blue-200"><FaEnvelope className="mr-3 text-lg" /> info@vichargroup.com</a>
              <div className="text-base text-gray-600 flex items-center bg-blue-50 rounded-lg p-3 transition-all duration-300 ease-in-out hover:bg-gradient-to-r hover:from-blue-100 hover:to-blue-200">
                <FaMapMarkerAlt className="mr-3 text-lg" />
                <address className="not-italic">
                  Office No. 65, Vichar Education, <br />
                  Lighthouse, Bibwewadi,<br />
                  Pune, Maharashtra. 411037
                </address>
              </div>
            </div>
          </div>
          <div className="md:w-1/2 p-8 bg-gray-50">
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
                  <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    id="mobile"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#106fb8] focus:ring focus:ring-[#106fb8] focus:ring-opacity-50 transition duration-300 ease-in-out px-3 py-2 bg-white"
                    placeholder="Your mobile number"
                  />
                </div>
                <div>
                  <label htmlFor="interestArea" className="block text-sm font-medium text-gray-700 mb-1">Interest Area</label>
                  <select
                    id="interestArea"
                    name="interestArea"
                    value={formData.interestArea}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#106fb8] focus:ring focus:ring-[#106fb8] focus:ring-opacity-50 transition duration-300 ease-in-out px-3 py-2 bg-white"
                  >
                    <option value="">Select an option</option>
                    <option value="education">Education</option>
                    <option value="technology">Technology</option>
                    <option value="business">Business</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="other">Other</option>
                  </select>
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
          <a href="/privacy-policy" className="text-[#106fb8] hover:text-[#0d5a94] mr-4 text-sm sm:text-base">Privacy Policy</a>
          <a href="/refund-policy" className="text-[#106fb8] hover:text-[#0d5a94] text-sm sm:text-base">Refund Policy</a>
        </div>
        <div className="mt-3 text-center text-gray-600 text-xs sm:text-sm">
          © {new Date().getFullYear()} Vichar Group. All rights reserved.
        </div>
      </div>
    </section>
  )
}

export default ContactUs