"use client"
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from'react-redux'
import { loggedIn, loggedOut } from '../../features/login/LoginSlice'
import { FaGraduationCap, FaHeartbeat, FaChartLine, FaBook, FaChartBar, FaExchangeAlt, FaClipboardCheck, FaFlask, FaCalculator, FaUserTie, FaInfoCircle, FaClipboard, FaImages, FaEnvelope, FaSignInAlt, FaChalkboardTeacher } from 'react-icons/fa'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeLink, setActiveLink] = useState('')
  const [isCoursesDropdownOpen, setIsCoursesDropdownOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const isLoggedIn = useSelector(state => state.login.loginStatus)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
    setIsCoursesDropdownOpen(false)
  }

  const toggleCoursesDropdown = (e) => {
    e.preventDefault()
    setIsCoursesDropdownOpen(!isCoursesDropdownOpen)
    setActiveLink(isCoursesDropdownOpen ? '' : 'courses')
    if (!isMobile) {
      closeMenu()
    }
  }

  const coursesData = [
    { category: "Vichar Education", courses: [
      { name: "JEE", link: "/vichar-education/jee", icon: <FaGraduationCap /> },
      { name: "NEET", link: "/vichar-education/neet", icon: <FaHeartbeat /> },
      { name: "MHT-CET", link: "/vichar-education/mht-cet", icon: <FaGraduationCap /> },
      { name: "FOUNDATION", link: "/vichar-education/foundation", icon: <FaBook /> }
    ]},
    { category: "Vichar Stock Market", courses: [
      { name: "PRICE ACTION", link: "/vichar-stock-market", icon: <FaChartLine /> },
      { name: "RSI", link: "/vichar-stock-market", icon: <FaChartBar /> },
      { name: "OPTION TRADING", link: "/vichar-stock-market", icon: <FaExchangeAlt /> }
    ]}
  ]

  return (
    <nav className="bg-white w-full">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center bg-white w-full p-2">
        <div className="flex justify-between items-center w-full md:w-auto bg-white px-4 py-2">
          <div className="text-gray-800 font-semibold text-xl hover:text-[#22a1d7] transition duration-300 mr-4 flex items-center">
            <Link href="/" onClick={() => setActiveLink('')}>
            <Image
              src="/Vichar_Navbar_Logo-removebg-preview.png"
              alt="Education Group Logo"
              width={40}
              height={40}
              className="rounded-full"
              priority
            />
            </Link>
            <div className="flex flex-col">
              <h1 className="ml-2">
                <span className='text-[#e96030]'>VICHAR</span>{' '}
                <span className="text-[#1d77bc] ml-1">GROUP</span>
                <p className="text-xs text-gray-400 ml-2 italic">Soch Sahi Disha Mein</p>
              </h1>
              
            </div>
          </div>
          <button
            className="md:hidden text-gray-800 focus:outline-none mr-2"
            onClick={toggleMenu}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        <div className={`${isMenuOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row space-y-2 pb-2 md:space-y-0 md:space-x-4 w-full md:w-auto items-start md:items-center absolute md:static left-0 right-0 top-full z-20 transition-all duration-300 ease-in-out bg-white`}>
        <Link href="/about-us" onClick={() => { closeMenu(); setActiveLink('about-us'); }} className={`${activeLink === 'about-us' ? 'text-[#e96030] font-bold' : 'text-gray-800'} hover:text-[#22a1d7] transition duration-300 px-4 py-3 rounded-md hover:bg-gray-100/50 block w-full text-left md:text-center md:whitespace-nowrap flex items-center`}>
                <FaInfoCircle className="mr-2" /> About Us
        </Link>
          <div className="relative group w-full md:w-auto">
            <a href="#" onClick={toggleCoursesDropdown} onMouseEnter={() => !isMobile && setIsCoursesDropdownOpen(true)} onMouseLeave={() => !isMobile && setIsCoursesDropdownOpen(false)} className={`${activeLink === 'courses' ? 'text-[#e96030] font-bold' : 'text-gray-800'} hover:text-[#22a1d7] transition duration-300 px-4 py-3 rounded-md hover:bg-gray-100/50 flex items-center w-full text-left md:text-center md:whitespace-nowrap`}>
              <span className="flex items-center"><FaBook className="mr-2" /> Courses</span>
              <svg className={`w-4 h-4 ml-1 transform ${isCoursesDropdownOpen ? 'rotate-180' : ''} transition-transform duration-200`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </a>
            <ul className={`${isMobile ? 'static' : 'absolute'} left-0 mt-0 w-full md:w-72 bg-white rounded-md shadow-lg ${isCoursesDropdownOpen ? 'block' : 'hidden'} transition duration-300 z-10`} onMouseEnter={() => !isMobile && setIsCoursesDropdownOpen(true)} onMouseLeave={() => !isMobile && setIsCoursesDropdownOpen(false)}>
              {coursesData.map((category, index) => (
                <li key={index} className="last:border-b-0">
                  <div className="font-bold px-4 py-3 text-sm text-gray-600 bg-gray-50/50 uppercase text-center">{category.category}</div>
                  <ul className="py-2">
                    {category.courses.map((course, courseIndex) => (
                      <li key={courseIndex}>
                        <Link href={course.link} className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100/50 hover:text-[#22a1d7] transition duration-200 flex items-center" onClick={() => { closeMenu(); setActiveLink(''); }}>
                          <span className="mr-2">{course.icon}</span>
                          {course.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
          <Link href="/test-series" onClick={() => { closeMenu(); setActiveLink('test-series'); }} className={`${activeLink === 'test-series' ? 'text-[#e96030] font-bold' : 'text-gray-800'} hover:text-[#22a1d7] transition duration-300 px-4 py-3 rounded-md hover:bg-gray-100/50 block w-full text-left md:text-center md:whitespace-nowrap flex items-center`}>
            <FaClipboard className="mr-2" /> Test Series
          </Link>
          <Link href="/gallery" onClick={() => { closeMenu(); setActiveLink('gallery'); }} className={`${activeLink === 'gallery' ? 'text-[#e96030] font-bold' : 'text-gray-800'} hover:text-[#22a1d7] transition duration-300 px-4 py-3 rounded-md hover:bg-gray-100/50 block w-full text-left md:text-center md:whitespace-nowrap flex items-center`}>
            <FaImages className="mr-2" /> Gallery
          </Link>
          <Link href="/contact-us" onClick={() => { closeMenu(); setActiveLink('contact-us'); }} className={`${activeLink === 'contact-us' ? 'text-[#e96030] font-bold' : 'text-gray-800'} hover:text-[#22a1d7] transition duration-300 px-4 py-3 rounded-md hover:bg-gray-100/50 block w-full text-left md:text-center md:whitespace-nowrap flex items-center`}>
            <FaEnvelope className="mr-2" /> Contact Us
          </Link>
          <div className="w-full md:w-auto">
            {isLoggedIn ? 
              <Link href="/classroom" onClick={() => {closeMenu(); setActiveLink('classroom');}} className={`${activeLink === 'classroom' ? 'text-[#e96030] font-bold' : 'text-gray-800'} hover:text-[#22a1d7] transition duration-300 px-4 py-3 rounded-md hover:bg-gray-100/50 block w-full text-left md:text-center md:whitespace-nowrap flex items-center`}>
                <FaChalkboardTeacher className="mr-2" /> Classroom
              </Link>
            : 
              <Link href="/login" onClick={() => { closeMenu(); setActiveLink('login'); }} className={`${activeLink === 'login' ? 'text-[#e96030] font-bold' : 'text-gray-800'} hover:text-[#22a1d7] transition duration-300 px-4 py-3 rounded-md hover:bg-gray-100/50 block w-full text-left md:text-center md:whitespace-nowrap flex items-center`}>
                <FaSignInAlt className="mr-2" /> Log In
              </Link>
            }
          </div>
        </div>
      </div>
    </nav>
  )}

export default Navbar