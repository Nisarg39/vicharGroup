"use client"
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { useDispatch, useSelector } from'react-redux'
import { loggedIn, loggedOut } from '../../features/login/LoginSlice'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeLink, setActiveLink] = useState('')

  const isLoggedIn = useSelector(state => state.login.loginStatus)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  const scrollToCourses = (e) => {
    e.preventDefault()
    const coursesSection = document.getElementById('courses-section')
    if (coursesSection) {
      coursesSection.scrollIntoView({ behavior: 'smooth' })
    }
    setActiveLink('courses')
    closeMenu()
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

  return (
    <nav className="bg-white p-2 md:p-3 lg:p-4" >
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="flex justify-between items-center w-full md:w-auto">
          <div className="text-[black] font-semibold text-xl hover:text-[#22a1d7] transition duration-300 mr-4 flex items-center">
            <Link href="/">
            <Image
              src="/Vichar_Navbar_Logo.png"
              alt="Education Group Logo"
              width={30}
              height={30}
              className="drop-shadow-2xl rounded-full"
              priority
            />
            </Link>
            <h1 className="ml-2">
              <span className='text-[#e96030]'>VICHAR</span>{' '}
              <span className="text-[#1d77bc] ml-1">GROUP</span>
            </h1>
          </div>
          <button
            className="md:hidden text-[black] focus:outline-none mr-2"
            onClick={toggleMenu}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        <ul className={`${isMenuOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 w-full md:w-auto`}>
          {activeLink !== 'login' && (
            <>
              <li>
                <a href="#courses-section" onClick={scrollToCourses} className={`${activeLink === 'courses' ? 'text-[#e96030] font-bold' : 'text-black'} hover:text-[#22a1d7] transition duration-300 px-3 py-2 rounded-md hover:bg-gray-100`}>
                  Courses
                </a>
              </li>
              <li>
                <Link href="/test-series" onClick={() => { closeMenu(); setActiveLink('test-series'); }} className={`${activeLink === 'test-series' ? 'text-[#e96030] font-bold' : 'text-black'} hover:text-[#22a1d7] transition duration-300 px-3 py-2 rounded-md hover:bg-gray-100`}>
                  Test Series
                </Link>
              </li>
              <li>
                <Link href="/gallery" onClick={() => { closeMenu(); setActiveLink('gallery'); }} className={`${activeLink === 'gallery' ? 'text-[#e96030] font-bold' : 'text-black'} hover:text-[#22a1d7] transition duration-300 px-3 py-2 rounded-md hover:bg-gray-100`}>
                  Gallery
                </Link>
              </li>
              <li>
                <a href="#about-us-section" onClick={scrollToAboutUs} className={`${activeLink === 'about-us' ? 'text-[#e96030] font-bold' : 'text-black'} hover:text-[#22a1d7] transition duration-300 px-3 py-2 rounded-md hover:bg-gray-100`}>
                  About Us
                </a>
              </li>
              <li>
                <a href="#contact-us-section" onClick={scrollToContactUs} className={`${activeLink === 'contact-us' ? 'text-[#e96030] font-bold' : 'text-black'} hover:text-[#22a1d7] transition duration-300 px-3 py-2 rounded-md hover:bg-gray-100`}>
                  Contact Us
                </a>
              </li>
            </>
          )}
          {activeLink === 'login' && (
            <li>
              <Link href="/" onClick={() => { closeMenu(); setActiveLink('home'); }} className={`${activeLink === 'home' ? 'text-[#e96030] font-bold' : 'text-black'} hover:text-[#22a1d7] transition duration-300 px-3 py-2 rounded-md hover:bg-gray-100`}>
                Home
              </Link>
            </li>
          )}
          <li>
            <span className="text-black px-3 py-2 rounded-md">
              {isLoggedIn ? 
                'Log Out' 
              : 
                <Link href="/login" onClick={() => { closeMenu(); setActiveLink('login'); }} className={`${activeLink === 'login' ? 'text-[#e96030] font-bold' : 'text-black'} hover:text-[#22a1d7] transition duration-300 px-3 py-2 rounded-md hover:bg-gray-100`}>
                    Log In
                </Link>
              }
            </span>
          </li>
        </ul>
      </div>
    </nav>
  )
}

export default Navbar