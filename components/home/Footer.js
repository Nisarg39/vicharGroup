const Footer = () => {
    return(
        <>
        <div className="text-center bg-black">
        <a href="/terms-and-conditions" className="text-[#106fb8] hover:text-[#0d5a94] mr-4 text-sm sm:text-base">Terms and Conditions</a>
        <a href="/privacy-policy" className="text-[#106fb8] hover:text-[#0d5a94] mr-4 text-sm sm:text-base">Privacy Policy</a>
        <a href="/refund-policy" className="text-[#106fb8] hover:text-[#0d5a94] text-sm sm:text-base">Refund Policy</a>
      </div>
      <div className="text-center text-gray-300 text-xs sm:text-sm bg-black pb-4">
        © {new Date().getFullYear()} Vichar Group. All rights reserved.
      </div>
      </>
    )
}

export default Footer;