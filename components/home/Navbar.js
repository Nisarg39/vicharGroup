"use client"
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from'react-redux'
import { loggedIn, loggedOut } from '../../features/login/LoginSlice'
import { FaGraduationCap, FaHeartbeat, FaChartLine, FaBook, FaChartBar, FaExchangeAlt } from 'react-icons/fa'

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

  const scrollToAboutUs = (e) => {
    e.preventDefault()
    const aboutUsSection = document.getElementById('about-us-section')
    if (aboutUsSection) {
      aboutUsSection.scrollIntoView({ behavior: 'smooth' })
    }
    setActiveLink('about-us')
    closeMenu()
  }

  const scrollToContactUs = (e) => {
    e.preventDefault()
    const contactUsSection = document.getElementById('contact-us-section')
    if (contactUsSection) {
      contactUsSection.scrollIntoView({ behavior: 'smooth' })
    }
    setActiveLink('contact-us')
    closeMenu()
  }

  const coursesData = [
    { category: "Vichar Education", courses: [
      { name: "JEE", link: "/course/upsc", icon: <FaGraduationCap /> },
      { name: "NEET", link: "/course/ssc", icon: <FaHeartbeat /> },
      { name: "MHT-CET", link: "/course/banking", icon: <FaGraduationCap /> },
      { name: "11th - 12th", link: "/course/state-psc", icon: <FaBook /> }
    ]},
    { category: "Vichar Stock Market", courses: [
      { name: "PRICE ACTION", link: "/course/jee", icon: <FaChartLine /> },
      { name: "RSI", link: "/course/neet", icon: <FaChartBar /> },
      { name: "OPTION TRADING", link: "/course/cat", icon: <FaExchangeAlt /> }
    ]}
  ]

  return (
    <nav className="bg-white p-4 md:p-5 lg:p-6 relative">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="flex justify-between items-center w-full md:w-auto">
          <div className="text-[black] font-semibold text-xl hover:text-[#22a1d7] transition duration-300 mr-4 flex items-center">
            <Link href="/">
            <Image
              src="/Vichar_Navbar_Logo.png"
              alt="Education Group Logo"
              width={40}
              height={40}
              className="drop-shadow-2xl rounded-full"
              priority
            />
            </Link>
            <div className="flex flex-col">
              <h1 className="ml-2">
                <span className='text-[#e96030]'>VICHAR</span>{' '}
                <span className="text-[#1d77bc] ml-1">GROUP</span>
              </h1>
              <p className="text-xs text-gray-500 ml-2">Soch Sahi Disha Mein</p>
            </div>
          </div>
          <button
            className="md:hidden text-[black] focus:outline-none mr-2"
            onClick={toggleMenu}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        <div className={`${isMenuOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 w-full md:w-auto items-start md:items-center bg-white md:bg-transparent shadow-lg md:shadow-none rounded-lg md:rounded-none p-4 md:p-0 absolute md:static left-0 right-0 top-full z-20 transition-all duration-300 ease-in-out`}>
          {activeLink !== 'login' && (
            <>
              <div className="relative group w-full md:w-auto">
                <a href="#" onClick={toggleCoursesDropdown} onMouseEnter={() => !isMobile && setIsCoursesDropdownOpen(true)} onMouseLeave={() => !isMobile && setIsCoursesDropdownOpen(false)} className={`${activeLink === 'courses' ? 'text-[#e96030] font-bold' : 'text-black'} hover:text-[#22a1d7] transition duration-300 px-4 py-3 rounded-md hover:bg-gray-100 flex items-center justify-between w-full text-left md:text-center md:whitespace-nowrap`}>
                  Courses
                  <svg className={`w-4 h-4 ml-1 transform ${isCoursesDropdownOpen ? 'rotate-180' : ''} transition-transform duration-200`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </a>
                <ul className={`${isMobile ? 'static' : 'absolute'} left-0 mt-0 w-full md:w-72 bg-white rounded-md shadow-lg ${isCoursesDropdownOpen ? 'block' : 'hidden'} transition duration-300 z-10`} onMouseEnter={() => !isMobile && setIsCoursesDropdownOpen(true)} onMouseLeave={() => !isMobile && setIsCoursesDropdownOpen(false)}>
                  {coursesData.map((category, index) => (
                    <li key={index} className="border-b border-gray-200 last:border-b-0">
                      <div className="font-bold px-4 py-3 text-sm text-gray-800 bg-gray-50 uppercase">{category.category}</div>
                      <ul className="py-2">
                        {category.courses.map((course, courseIndex) => (
                          <li key={courseIndex}>
                            <Link href={course.link} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#22a1d7] transition duration-200 flex items-center" onClick={closeMenu}>
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
              <Link href="/test-series" onClick={() => { closeMenu(); setActiveLink('test-series'); }} className={`${activeLink === 'test-series' ? 'text-[#e96030] font-bold' : 'text-black'} hover:text-[#22a1d7] transition duration-300 px-4 py-3 rounded-md hover:bg-gray-100 block w-full text-left md:text-center md:whitespace-nowrap`}>
                Test Series
              </Link>
              <Link href="/gallery" onClick={() => { closeMenu(); setActiveLink('gallery'); }} className={`${activeLink === 'gallery' ? 'text-[#e96030] font-bold' : 'text-black'} hover:text-[#22a1d7] transition duration-300 px-4 py-3 rounded-md hover:bg-gray-100 block w-full text-left md:text-center md:whitespace-nowrap`}>
                Gallery
              </Link>
              <a href="#about-us-section" onClick={scrollToAboutUs} className={`${activeLink === 'about-us' ? 'text-[#e96030] font-bold' : 'text-black'} hover:text-[#22a1d7] transition duration-300 px-4 py-3 rounded-md hover:bg-gray-100 block w-full text-left md:text-center md:whitespace-nowrap`}>
                About Us
              </a>
              <a href="#contact-us-section" onClick={scrollToContactUs} className={`${activeLink === 'contact-us' ? 'text-[#e96030] font-bold' : 'text-black'} hover:text-[#22a1d7] transition duration-300 px-4 py-3 rounded-md hover:bg-gray-100 block w-full text-left md:text-center md:whitespace-nowrap`}>
                Contact Us
              </a>
            </>
          )}
          {activeLink === 'login' && (
            <Link href="/" onClick={() => { closeMenu(); setActiveLink('home'); }} className={`${activeLink === 'home' ? 'text-[#e96030] font-bold' : 'text-black'} hover:text-[#22a1d7] transition duration-300 px-4 py-3 rounded-md hover:bg-gray-100 block w-full text-left md:text-center md:whitespace-nowrap`}>
              Home
            </Link>
          )}
          <div className="w-full md:w-auto">
            {isLoggedIn ? 
              <span className="text-black px-4 py-3 rounded-md block w-full text-left md:text-center md:whitespace-nowrap">Log Out</span>
            : 
              <Link href="/login" onClick={() => { closeMenu(); setActiveLink('login'); }} className={`${activeLink === 'login' ? 'text-[#e96030] font-bold' : 'text-black'} hover:text-[#22a1d7] transition duration-300 px-4 py-3 rounded-md hover:bg-gray-100 block w-full text-left md:text-center md:whitespace-nowrap`}>
                Log In
              </Link>
            }
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar