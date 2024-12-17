"use client"
import { useState } from 'react'
import Image from 'next/image'
import { IoLogoWhatsapp } from 'react-icons/io'
import { FaGooglePlay } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'

export default function VicharApp() {
    const [showOptions, setShowOptions] = useState(false)

    const toggleOptions = () => {
        setShowOptions(!showOptions)
    }

    return (
        <>
            <div className="fixed bottom-5 sm:bottom-10 right-5 sm:right-10 z-50 flex flex-col items-end">
                <AnimatePresence>
                    {showOptions && (
                        <motion.a
                            initial={{ y: 57, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 57, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            href="https://wa.me/9270189405"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mb-4 rounded-full overflow-hidden w-14 sm:w-14 md:w-16 h-14 sm:h-14 md:h-16 flex justify-center items-center bg-[#25D366] shadow-lg"
                        >
                            <IoLogoWhatsapp size={36} color="white" className="sm:w-10 sm:h-10" />
                        </motion.a>
                    )}
                </AnimatePresence>
                <div className="flex gap-4">
                    <AnimatePresence>
                        {showOptions && (
                            <motion.a
                                initial={{ x: 57, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: 57, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                href="https://play.google.com/store/apps/details?id=com.vichareducation.jee_neet"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-full overflow-hidden w-14 sm:w-14 md:w-16 h-14 sm:h-14 md:h-16 flex justify-center items-center bg-black shadow-lg border border-gray-200"
                            >
                                <FaGooglePlay size={25} color="white" className="sm:w-10 sm:h-10" />
                            </motion.a>
                        )}
                    </AnimatePresence>
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        animate={{
                            y: [0, -10, 0],
                            transition: {
                                duration: 2,
                                repeat: Infinity,
                                repeatType: "reverse"
                            }
                        }}
                        onClick={toggleOptions}
                        className="rounded-full overflow-hidden w-14 sm:w-14 md:w-16 h-14 sm:h-14 md:h-16 flex justify-center items-center bg-gray-200 shadow-lg border border-black"
                    >
                        <Image
                            src="https://cdn-icons-gif.flaticon.com/14984/14984715.gif"
                            alt="Chat Icon"
                            width={56}
                            height={56}
                            className="w-[1/2] h-full object-contain"
                        />
                    </motion.button>
                </div>
            </div>
        </>
    )
}