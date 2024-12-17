const Modal = ({ showModal, setShowModal, isSuccess, modalMessage }) => {
    return (
        showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
                <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100 animate-fadeIn">
                    <div className={`text-center mb-6`}>
                        <div className={`${isSuccess ? 'bg-green-100' : 'bg-red-100'} rounded-full p-4 mx-auto w-16 h-16 flex items-center justify-center mb-4`}>
                            {isSuccess ? (
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                            ) : (
                                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            )}
                        </div>
                        <h3 className={`text-xl font-bold mb-2 ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
                            {isSuccess ? 'Success!' : 'Error!'}
                        </h3>
                        <p className="text-gray-600">{modalMessage}</p>
                    </div>
                    <button
                        onClick={() => setShowModal(false)}
                        className="w-full bg-[#106fb8] text-white py-3 px-4 rounded-lg hover:bg-[#0e5d9e] transition duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                        Close
                    </button>
                </div>
            </div>
        )
    )
}

export default Modal;