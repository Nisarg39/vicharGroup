import { useState } from "react"
import { affiliateLogin } from "../../server_actions/actions/affiliateActions"
import LoadingSpinner from "../common/LoadingSpinner"
import Modal from "../common/Modal"
export default function AffiliateHome(){
    const [couponCode, setCouponCode] = useState("")
    const [password, setPassword] = useState("")
    const [showErrorModal, setShowErrorModal] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const [loading, setLoading] = useState(false)
    const [coupon, setCoupon] = useState(null)

    async function handleSubmit(){
        setLoading(true)
        const details = {
            couponCode,
            password,
        }
        const response = await affiliateLogin(details)
        if (response.success) {
            setCoupon(response.coupon)
            setShowErrorModal(false)
            setErrorMessage(response.message)
            setLoading(false)

        }else{
            setErrorMessage(response.message)
            setShowErrorModal(true)
            setLoading(false)
        }
    }

    return(
        <div className="flex flex-col gap-6 items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
            {loading ? <LoadingSpinner /> : (coupon ? <CouponDetails coupon={coupon} /> : <SignInCard couponCode={couponCode} password={password} setCouponCode={setCouponCode} setPassword={setPassword} handleSubmit={handleSubmit} />)}
            <Modal showModal={showErrorModal} setShowModal={setShowErrorModal} isSuccess={false} modalMessage={errorMessage} />
        </div>
    )
}
function SignInCard(props) {
  return (
    <div className="bg-white p-8 rounded-lg shadow-lg w-96">
      <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
        Voucher Details
      </h1>
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Enter Coupon Code"
          className="p-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#1d77bc] focus:border-transparent transition-all"
          value={props.couponCode}
          onChange={(e) => props.setCouponCode(e.target.value)}
        />
        <input
          type="password"
          placeholder="Enter Password"
          className="p-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#1d77bc] focus:border-transparent transition-all"
          value={props.password}
          onChange={(e) => props.setPassword(e.target.value)}
        />
        <button
          onClick={props.handleSubmit}
          className="bg-[#1d77bc] text-white p-3 rounded-lg w-full hover:bg-[#1665a0] transition-colors duration-300 font-semibold shadow-md"
        >
          Submit
        </button>
      </div>
    </div>
  );
}

function CouponDetails(props){
    return(
        <div className="bg-white p-8 rounded-lg shadow-lg w-96">
            <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
                Coupon Details
            </h1>
            <div className="space-y-6">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-600">Coupon Code:</span>
                    <span className="font-bold text-[#1d77bc]">{props.coupon.couponCode}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-600">Discount:</span>
                    <span className="font-bold text-green-600">₹ {props.coupon.discountAmount}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-600">Valid Till:</span>
                    <span className="font-semibold text-gray-800">
                        {new Date(props.coupon.expiryDate).toLocaleString('en-IN', {
                            timeZone: 'Asia/Kolkata',
                            dateStyle: 'medium',
                            timeStyle: 'short'
                        })}
                    </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-600">Used Count:</span>
                    <span className="font-semibold text-gray-800">{props.coupon.usedCount}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-600">Status:</span>
                    <span className={`font-semibold px-3 py-1 rounded-full ${
                        props.coupon.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                        {props.coupon.status}
                    </span>
                </div>
            </div>
        </div>
    )
}