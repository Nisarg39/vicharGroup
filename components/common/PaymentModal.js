import {useRouter} from "next/navigation"
const PaymentModal = ({ showModal, setShowModal, isSuccess, modalMessage, title }) => {
    const router =  useRouter()
    return (
        showModal && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
                <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100 animate-fadeIn relative overflow-hidden">
                    {/* Neobrutalism floating elements */}
                    <div className="absolute w-20 h-20 bg-yellow-300 rounded-full -top-10 -left-10 border-4 border-black"></div>
                    <div className="absolute w-16 h-16 bg-blue-400 -bottom-8 -right-8 rotate-45 border-4 border-black"></div>
                    <div className="absolute w-12 h-12 bg-pink-400 top-1/2 -right-6 rounded-full border-4 border-black"></div>
                    <div className="absolute w-10 h-10 bg-green-400 bottom-1/4 -left-5 rotate-12 border-4 border-black"></div>
                    
                    <div className="text-center mb-6 relative z-10">
                        <div className={`${isSuccess ? 'bg-emerald-100' : title.toLowerCase().includes('warning') ? 'bg-amber-100' : 'bg-rose-100'} rounded-full p-4 mx-auto w-20 h-20 flex items-center justify-center mb-4 transform transition-all duration-500 hover:scale-110 border-4 border-black`}>
                            {isSuccess ? (
                                <img src="https://cdn-icons-png.flaticon.com/256/9028/9028946.png" alt="Success" className="w-12 h-12" />
                            ) : title.toLowerCase().includes('warning') ? (
                                <img src="https://cdn-icons-png.flaticon.com/256/1055/1055687.png" alt="Warning" className="w-12 h-12" />
                            ) : (
                                <img src="https://cdn-icons-png.flaticon.com/256/9394/9394525.png" alt="Error" className="w-12 h-12" />
                            )}
                        </div>
                        <h3 className={`text-2xl font-bold mb-3 ${
                            isSuccess ? 'text-emerald-600' : 
                            title.toLowerCase().includes('warning') ? 'text-amber-600' : 
                            'text-rose-600'
                        } tracking-wide`}>
                            {title}
                        </h3>
                        <p className="text-slate-700 text-lg leading-relaxed mb-6">{modalMessage}</p>
                    </div>
                    <button
                        onClick={() => {
                            setShowModal(false)
                            if(isSuccess){
                                router.push("/classroom")
                            }
                        }}
                        className={`w-full py-3 px-4 rounded-xl transition duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 ${
                            isSuccess ? 'bg-emerald-500 hover:bg-emerald-600' :
                            title.toLowerCase().includes('warning') ? 'bg-amber-500 hover:bg-amber-600' :
                            'bg-rose-500 hover:bg-rose-600'
                        } text-white border-4 border-black`}
                    >
                        {isSuccess ? 'Continue' : 'Close'}
                    </button>
                </div>
            </div>
        )
    )
}

export default PaymentModal;