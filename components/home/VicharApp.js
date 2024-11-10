import { useState } from 'react'
import Image from 'next/image'
import { IoLogoWhatsapp } from 'react-icons/io'
import { IoChatbubbleEllipsesOutline } from 'react-icons/io5'

function VicharApp() {
    const [showOptions, setShowOptions] = useState(false)

    const toggleOptions = () => {
        setShowOptions(!showOptions)
    }

    return (
        <>
            <div className="fixed bottom-5 sm:bottom-10 right-5 sm:right-10 z-50 flex flex-col items-end">
                {showOptions && (
                    <>
                        <a href="https://play.google.com/store/apps/details?id=com.vichareducation.jee_neet" target="_blank" rel="noopener noreferrer" className="mb-4 rounded-full overflow-hidden w-14 sm:w-14 md:w-16 h-14 sm:h-14 md:h-16 block shadow-lg border border-gray-200">
                            <Image
                                src="/vicharlogo.png"
                                alt="Vichar App Logo"
                                width={60}
                                height={60}
                                className="object-cover w-full h-full"
                            />
                        </a>
                        <a href="https://wa.me/9270189405" target="_blank" rel="noopener noreferrer" className="mb-4 rounded-full overflow-hidden w-14 sm:w-14 md:w-16 h-14 sm:h-14 md:h-16 flex justify-center items-center bg-[#25D366] shadow-lg">
                            <IoLogoWhatsapp size={36} color="white" className="sm:w-10 sm:h-10" />
                        </a>
                    </>
                )}
                <button onClick={toggleOptions} className="rounded-full overflow-hidden w-14 sm:w-14 md:w-16 h-14 sm:h-14 md:h-16 flex justify-center items-center bg-gray-200 shadow-lg">
                    <IoChatbubbleEllipsesOutline size={36} color="black" className="sm:w-10 sm:h-10" />
                </button>
            </div>
        </>
    )
}

export default VicharApp