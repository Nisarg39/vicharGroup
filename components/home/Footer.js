const Footer = () => {
    return(
        <>
        <div className="mt-10 text-center">
        <a href="/terms-and-conditions" className="text-[#106fb8] hover:text-[#0d5a94] mr-4 text-sm sm:text-base">Terms and Conditions</a>
        <a href="/privacy-policy" className="text-[#106fb8] hover:text-[#0d5a94] mr-4 text-sm sm:text-base">Privacy Policy</a>
        <a href="/refund-policy" className="text-[#106fb8] hover:text-[#0d5a94] text-sm sm:text-base">Refund Policy</a>
      </div>
      <div className="mt-3 text-center text-gray-600 text-xs sm:text-sm mb-4">
        © {new Date().getFullYear()} Vichar Group. All rights reserved.
      </div>
      </>
    )
}

export default Footer;