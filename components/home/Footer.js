"use client"
import Link from 'next/link'
import { useState } from 'react'
import { FaGraduationCap, FaHeartbeat, FaChartLine, FaBook, FaChartBar, FaExchangeAlt, 
         FaInfoCircle, FaClipboard, FaImages, FaEnvelope, FaChevronDown } from 'react-icons/fa'

const Footer = () => {
    const [activeDropdown, setActiveDropdown] = useState(null);

    const toggleDropdown = (index) => {
        setActiveDropdown(activeDropdown === index ? null : index);
    };

    return(
        <footer className="bg-gradient-to-b from-white to-gray-50 py-10 md:py-16 border-t border-gray-200">
            <div className="container mx-auto px-4 md:px-8">
                {/* Main footer content */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
                    <div className="transform hover:translate-y-[-5px] transition-transform duration-300">
                        <h3 
                            className="font-bold text-gray-800 mb-4 md:mb-6 text-base md:text-xl flex justify-between items-center cursor-pointer md:cursor-default"
                            onClick={() => toggleDropdown(0)}
                        >
                            Vichar Education
                            <FaChevronDown className={`md:hidden transition-transform duration-300 ${activeDropdown === 0 ? 'rotate-180' : ''}`} />
                        </h3>
                        <ul className={`space-y-3 md:space-y-4 md:block text-xs md:text-base ${activeDropdown === 0 ? 'block' : 'hidden md:block'}`}>
                            <li><Link href="/vichar-education/jee" className="text-gray-600 hover:text-[#22a1d7] flex items-center group transition-all duration-300"><FaGraduationCap className="mr-2 md:mr-3 text-[#22a1d7] group-hover:scale-110" />JEE</Link></li>
                            <li><Link href="/vichar-education/neet" className="text-gray-600 hover:text-[#22a1d7] flex items-center group transition-all duration-300"><FaHeartbeat className="mr-2 md:mr-3 text-[#22a1d7] group-hover:scale-110" />NEET</Link></li>
                            <li><Link href="/vichar-education/mht-cet" className="text-gray-600 hover:text-[#22a1d7] flex items-center group transition-all duration-300"><FaGraduationCap className="mr-2 md:mr-3 text-[#22a1d7] group-hover:scale-110" />MHT-CET</Link></li>
                            <li><Link href="/vichar-education/foundation" className="text-gray-600 hover:text-[#22a1d7] flex items-center group transition-all duration-300"><FaBook className="mr-2 md:mr-3 text-[#22a1d7] group-hover:scale-110" />FOUNDATION</Link></li>
                        </ul>
                    </div>
                    <div className="transform hover:translate-y-[-5px] transition-transform duration-300">
                        <h3 
                            className="font-bold text-gray-800 mb-4 md:mb-6 text-base md:text-xl flex justify-between items-center cursor-pointer md:cursor-default"
                            onClick={() => toggleDropdown(1)}
                        >
                            Vichar Stock Market
                            <FaChevronDown className={`md:hidden transition-transform duration-300 ${activeDropdown === 1 ? 'rotate-180' : ''}`} />
                        </h3>
                        <ul className={`space-y-3 md:space-y-4 md:block text-xs md:text-base ${activeDropdown === 1 ? 'block' : 'hidden md:block'}`}>
                            <li><Link href="/vichar-stock-market" className="text-gray-600 hover:text-[#22a1d7] flex items-center group transition-all duration-300"><FaChartLine className="mr-2 md:mr-3 text-[#22a1d7] group-hover:scale-110" />PRICE ACTION</Link></li>
                            <li><Link href="/vichar-stock-market" className="text-gray-600 hover:text-[#22a1d7] flex items-center group transition-all duration-300"><FaChartBar className="mr-2 md:mr-3 text-[#22a1d7] group-hover:scale-110" />RSI</Link></li>
                            <li><Link href="/vichar-stock-market" className="text-gray-600 hover:text-[#22a1d7] flex items-center group transition-all duration-300"><FaExchangeAlt className="mr-2 md:mr-3 text-[#22a1d7] group-hover:scale-110" />OPTION TRADING</Link></li>
                        </ul>
                    </div>
                    <div className="transform hover:translate-y-[-5px] transition-transform duration-300">
                        <h3 
                            className="font-bold text-gray-800 mb-4 md:mb-6 text-base md:text-xl flex justify-between items-center cursor-pointer md:cursor-default"
                            onClick={() => toggleDropdown(2)}
                        >
                            Quick Links
                            <FaChevronDown className={`md:hidden transition-transform duration-300 ${activeDropdown === 2 ? 'rotate-180' : ''}`} />
                        </h3>
                        <ul className={`space-y-3 md:space-y-4 md:block text-xs md:text-base ${activeDropdown === 2 ? 'block' : 'hidden md:block'}`}>
                            <li><Link href="/about-us" className="text-gray-600 hover:text-[#22a1d7] flex items-center group transition-all duration-300"><FaInfoCircle className="mr-2 md:mr-3 text-[#22a1d7] group-hover:scale-110" />About Us</Link></li>
                            <li><Link href="/test-series" className="text-gray-600 hover:text-[#22a1d7] flex items-center group transition-all duration-300"><FaClipboard className="mr-2 md:mr-3 text-[#22a1d7] group-hover:scale-110" />Test Series</Link></li>
                            <li><Link href="/gallery" className="text-gray-600 hover:text-[#22a1d7] flex items-center group transition-all duration-300"><FaImages className="mr-2 md:mr-3 text-[#22a1d7] group-hover:scale-110" />Gallery</Link></li>
                            <li><Link href="/contact-us" className="text-gray-600 hover:text-[#22a1d7] flex items-center group transition-all duration-300"><FaEnvelope className="mr-2 md:mr-3 text-[#22a1d7] group-hover:scale-110" />Contact Us</Link></li>
                        </ul>
                    </div>
                    <div className="transform hover:translate-y-[-5px] transition-transform duration-300">
                        <h3 
                            className="font-bold text-gray-800 mb-4 md:mb-6 text-base md:text-xl flex justify-between items-center cursor-pointer md:cursor-default"
                            onClick={() => toggleDropdown(3)}
                        >
                            Legal
                            <FaChevronDown className={`md:hidden transition-transform duration-300 ${activeDropdown === 3 ? 'rotate-180' : ''}`} />
                        </h3>
                        <ul className={`space-y-3 md:space-y-4 md:block text-xs md:text-base ${activeDropdown === 3 ? 'block' : 'hidden md:block'}`}>
                            <li><Link href="/terms-and-conditions" className="text-gray-600 hover:text-[#22a1d7] transition-colors duration-300">Terms and Conditions</Link></li>
                            <li><Link href="/privacy-policy" className="text-gray-600 hover:text-[#22a1d7] transition-colors duration-300">Privacy Policy</Link></li>
                            <li><Link href="/refund-policy" className="text-gray-600 hover:text-[#22a1d7] transition-colors duration-300">Refund Policy</Link></li>
                        </ul>
                    </div>
                </div>
            </div>
            
            {/* Copyright section */}
            <div className="mt-10 pt-6">
                <div className="container mx-auto px-4 md:px-8">
                    <div className="text-center text-gray-600 text-xs md:text-sm">
                        <p>© {new Date().getFullYear()} Vichar Group. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer;