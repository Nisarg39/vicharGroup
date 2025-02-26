"use client"
import { useRouter } from "next/navigation";
import { getStudentDetails, updateStudentDetails, verifyCouponCode, productPurchase } from "../../server_actions/actions/studentActions";
import { useEffect, useState } from "react";
import Modal from "../common/Modal";
import PaymentModal from "../common/PaymentModal";
import LoadingSpinner from "../common/LoadingSpinner";
import { useSelector, useDispatch } from "react-redux";
import { studentDetails } from "../../features/login/LoginSlice";

export default function Payment(props) {
    const dispatch = useDispatch();

    const router = useRouter();

    const [student, setStudent] = useState({});
    const [validatedDetails, setValidatedDetails] = useState(false);
    const [finalcouponCode, setFinalCouponCode] = useState("")
    const [finalBuyPrice, setFinalBuyPrice] = useState(Number(props.discountPrice.replace(/,/g, '')))
    const [isProcessing, setIsProcessing] = useState(false);
    const [couponType, setCouponType] = useState("");
    const [finalCouponDiscount, setFinalCouponDiscount] = useState("")
    const [purchaseStatus, setPurchaseStatus] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    const [modalTitle, setModalTitle] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchStudentDetails();
    }, []);

    async function fetchStudentDetails() {
        const token = localStorage.getItem("token");
        const student = await getStudentDetails(token);
        if(student.success){
            setStudent(student.student);
            dispatch(studentDetails(student.student));
            if(student.student.name && student.student.email && student.student.phone && student.student.gender && student.student.dob && student.student.address && student.student.area && student.student.city && student.student.state){
                setValidatedDetails(true);
            }
            student.student.purchases.forEach(async (purchase) => {
                if(purchase.product._id.toString() === props._id.toString()){
                    setPurchaseStatus(true);
                }
            });
        }else{
          localStorage.removeItem("token")
          router.push("/login")
        }
    }

    async function buyNow(purchaseData){
        setIsProcessing(true);
        try{
            const response = await fetch("/api/create-order", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`,
              },
              body: JSON.stringify({
                amount: purchaseData.finalPrice,
                couponCode: purchaseData.couponCode,
              }),
            })
            
            const data = await response.json();
            const options = {
              key: data.key || process.env.RAZORPAY_KEY_ID,
              amount: finalBuyPrice * 100,
              currency: "INR",
              name: "Vichar Group",
              description: props.title,
              image: "/vicharlogo.png",
              order_id: data.id,
              handler: async function (response) {
                setIsLoading(true);
                const token = localStorage.getItem("token")
                const data = {
                  token: token,
                  couponCode: purchaseData.couponCode,
                  amountPaid: purchaseData.finalPrice,
                  initialDiscountAmount: props.discountPrice.replace(/,/g, ''),
                  couponType: purchaseData.couponType,
                  couponDiscount: purchaseData.couponDiscount,
                  paymentStatus: "success",
                  productId: props._id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature
                }
                const purchaseDetails = await productPurchase(data)
                setIsLoading(false);
                if(purchaseDetails.success){
                  setModalMessage(purchaseDetails.message);
                  setShowModal(true);
                  setModalTitle("Payment Successful");
                  setPurchaseStatus(true);
                }else{
                  setModalMessage(purchaseDetails.message);
                  setModalTitle("Payment Failed");
                  setShowModal(true);
                }
              },
              prefill: {
                name: student.name,
                email: student.email,
                contact: student.phone,
              },
              notes: {
                address: student.address,
              },
              theme: {
                color: "#1d77bc",
              },
            }

            const razorpay = new window.Razorpay(options);
            razorpay.on('payment failed', function (response){
              alert(response.error.description)
            })
            razorpay.open();
            setIsProcessing(false);
        }catch(error){
            setModalMessage("There is a problem with payment gateway, please try later");
            setShowModal(true);
            setIsProcessing(false);
        }finally{
            setIsProcessing(false);
        }
    }

    if (!props || isLoading) {
      return <LoadingSpinner />
    }

    return(
        <section className="min-h-screen pt-32 pb-20 px-4 md:px-8 bg-gradient-to-b from-white via-gray-200 to-white">
            <div className="max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-3 gap-8">
                    <MainCard props={props} student={student} setValidatedDetails={setValidatedDetails} validatedDetails={validatedDetails} />
                    <EnrollmentCard 
                        price={props.price} 
                        discountPrice={props.discountPrice} 
                        duration={props.duration} 
                        buyNow={buyNow} 
                        validatedDetails={validatedDetails} 
                        purchaseStatus={purchaseStatus}
                    />
                </div>
            </div>
            {showModal && <PaymentModal showModal={showModal} setShowModal={setShowModal} isSuccess={purchaseStatus} modalMessage={modalMessage}  />}
        </section>
    )
}


// MainCard.js
function MainCard({props, student, setValidatedDetails, validatedDetails}) {
    const [name, setName] = useState(student.name || "");
    const [email, setEmail] = useState(student.email || "");
    const [phone, setPhone] = useState(student.phone || "");
    const [gender, setGender] = useState(student.gender || "");
    const [dob, setDob] = useState(student.dob || "");
    const [address, setAddress] = useState(student.address || "");
    const [area, setArea] = useState(student.area || "");
    const [city, setCity] = useState(student.city || "");
    const [state, setState] = useState(student.state || "");
    const [showModal, setShowModal] = useState(false);
    const [success, setSuccess] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    const [updateDetails, setUpdateDetails] = useState("Update Details");
    async function updateStudent(){

        setUpdateDetails("Updating Details...");
        const finalName = student.name || name;
        const finalEmail = student.email || email;
        const finalPhone = student.phone || phone;
        const finalGender = student.gender || gender;
        const finalDob = student.dob || dob;
        const finalAddress = student.address || address;
        const finalArea = student.area || area;
        const finalCity = student.city || city;
        const finalState = student.state || state;

        if (!finalName || !finalEmail || !finalPhone || !finalGender || !finalDob || !finalAddress || !finalArea || !finalCity || !finalState) {
            setModalMessage("Please fill all the fields");
            setShowModal(true);
            return;
        }

        const token = localStorage.getItem("token");
        const data = {
            name: finalName,
            email: finalEmail,
            phone: finalPhone,
            gender: finalGender,
            dob: finalDob,
            address: finalAddress,
            area: finalArea,
            city: finalCity,
            state: finalState,
            token
        }
        try{
            const response = await updateStudentDetails(data);
            if(response.success){
                setModalMessage(response.message);
                setSuccess(true);
                setShowModal(true);
                setValidatedDetails(true);
                // disable input fields 
                setUpdateDetails("Details Updated");
            }else{
                setModalMessage(response.message);
                setSuccess(false);
                setShowModal(true);
                setUpdateDetails("Update Details");
            }
        }catch(error){
            setModalMessage("Error in updating student details");
            setSuccess(false);
            setShowModal(true);
        }
    }
    return (
      <div className="lg:col-span-2 space-y-6">
        <Modal showModal={showModal} setShowModal={setShowModal} isSuccess={success} modalMessage={modalMessage} />
        <div className="bg-white rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#1d77bc]"></div>
          <div className="p-5 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5 relative">
              <div className="flex items-center gap-4">
                <div className="w-1.5 h-12 bg-gradient-to-b from-[#1d77bc] to-[#2488d8] rounded-full"></div>
                <h2 className="text-2xl sm:text-2xl md:text-3xl font-bold text-gray-800 leading-tight">
                  {props.title}
                </h2>
              </div>
              <div className="sm:absolute sm:right-0 bg-gradient-to-r from-[#22863a] to-[#2ea043] text-white px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-medium shadow-lg backdrop-blur-sm">
                {props.examMode}
              </div>
            </div>
            <div className="flex flex-wrap gap-3 sm:gap-4">
              <div className="flex items-center bg-gray-100 rounded-xl px-4 py-2.5 shadow-sm backdrop-blur-sm">
                <div className="flex items-center">
                  <span className="text-xs text-gray-600 font-semibold uppercase tracking-wider mr-2">
                    Class:
                  </span>
                  <span className="text-sm font-bold text-gray-800">
                    {props.class}
                  </span>
                </div>
              </div>
              <div className="flex items-center bg-gray-100 rounded-xl px-4 py-2.5 shadow-sm backdrop-blur-sm">
                <div className="flex items-center">
                  <span className="text-xs text-gray-600 font-semibold uppercase tracking-wider mr-2">
                    Duration:
                  </span>
                  <span className="text-sm font-bold text-gray-800">
                    {props.duration}
                  </span>
                </div>
              </div>
              <div className="flex items-center bg-gray-100 rounded-xl px-4 py-2.5 shadow-sm backdrop-blur-sm">
                <div className="flex items-center">
                  <span className="text-xs text-gray-600 font-semibold uppercase tracking-wider mr-2">
                    Language:{" "}
                  </span>
                  <span className="text-sm font-bold text-gray-800">
                    {props.language}
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <h3 className="text-md text-gray-600">Subjects (PCM):</h3>
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-md font-bold text-gray-800">
                    {props.subjects}
                  </span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <h3 className="text-md text-gray-600">Test Start Date:</h3>
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-sm text-white bg-[#e96030] px-4 py-1.5 rounded-full">
                    {props.testStartDate}
                  </span>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-8 bg-gradient-to-b from-[#1d77bc] to-[#2488d8] rounded-full"></div>
                  <h3 className="text-xl font-bold text-gray-800">
                    Student Details
                  </h3>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4 shadow-sm">
                    <span className="text-xs text-gray-600 font-semibold uppercase tracking-wider">
                      Name
                    </span>
                    {student.name ? (
                      <div className="mt-1 font-medium text-gray-800">
                        {student.name}
                      </div>
                    ) : (
                      <input
                        type="text"
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#e96030]"
                      />
                    )}
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 shadow-sm">
                    <span className="text-xs text-gray-600 font-semibold uppercase tracking-wider">
                      Email
                    </span>
                    {student.email ? (
                      <div className="mt-1 font-medium text-gray-800">
                        {student.email}
                      </div>
                    ) : (
                      <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#e96030]"
                      />
                    )}
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 shadow-sm">
                    <span className="text-xs text-gray-600 font-semibold uppercase tracking-wider">
                      Phone
                    </span>
                    {student.phone ? (
                      <div className="mt-1 font-medium text-gray-800">
                        {student.phone}
                      </div>
                    ) : (
                      <input
                        type="tel"
                        placeholder="Enter your phone number"
                        value={phone}
                        onChange={(e) => {
                          if(e.target.value.length <= 10) {
                            setPhone(e.target.value.replace(/\D/g, ''))
                          }
                        }}
                        className="mt-1 w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#e96030]"
                      />
                    )}
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 shadow-sm">
                    <span className="text-xs text-gray-600 font-semibold uppercase tracking-wider">
                      Gender
                    </span>
                    {student.gender ? (
                      <div className="mt-1 font-medium text-gray-800">
                        {student.gender}
                      </div>
                    ) : (
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="mt-1 w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#e96030]"
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    )}
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 shadow-sm">
                    <span className="text-xs text-gray-600 font-semibold uppercase tracking-wider">
                      Date of Birth
                    </span>
                    {student.dob ? (
                      <div className="mt-1 font-medium text-gray-800">
                        {new Date(student.dob).toLocaleDateString()}
                      </div>
                    ) : (
                      <input
                        type="date"
                        value={dob}
                        onChange={(e) => {
                          if(e.target.value >= new Date().toISOString().split('T')[0]) {
                            setDob(new Date().toISOString().split('T')[0]);
                          } else {
                            setDob(e.target.value);
                          }
                        }}
                        className="mt-1 w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#e96030]"
                      />
                    )}
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 shadow-sm">
                    <span className="text-xs text-gray-600 font-semibold uppercase tracking-wider">
                      Address
                    </span>
                    {student.address ? (
                      <div className="mt-1 font-medium text-gray-800">
                        {student.address}
                      </div>
                    ) : (
                      <input
                        type="text"
                        placeholder="Enter your address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="mt-1 w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#e96030]"
                      />
                    )}
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 shadow-sm">
                    <span className="text-xs text-gray-600 font-semibold uppercase tracking-wider">
                      Area
                    </span>
                    {student.area ? (
                      <div className="mt-1 font-medium text-gray-800">
                        {student.area}
                      </div>
                    ) : (
                      <input
                        type="text"
                        placeholder="Enter your area"
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        className="mt-1 w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#e96030]"
                      />
                    )}
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 shadow-sm">
                    <span className="text-xs text-gray-600 font-semibold uppercase tracking-wider">
                      City
                    </span>
                    {student.city ? (
                      <div className="mt-1 font-medium text-gray-800">
                        {student.city}
                      </div>
                    ) : (
                      <input
                        type="text"
                        placeholder="Enter your city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="mt-1 w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#e96030]"
                      />
                    )}
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 shadow-sm">
                    <span className="text-xs text-gray-600 font-semibold uppercase tracking-wider">
                      State
                    </span>
                    {student.state ? (
                      <div className="mt-1 font-medium text-gray-800">
                        {student.state}
                      </div>
                    ) : (
                      <input
                        type="text"
                        placeholder="Enter your state"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="mt-1 w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#e96030]"
                      />
                    )}
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    disabled={validatedDetails}
                    onClick={updateStudent}
                    className={`${!validatedDetails ? 'bg-[#1d77bc] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-[#1a69a7] transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg' : 'bg-[#1d77bc] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-[#1a69a7] transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg opacity-50 cursor-not-allowed'}`}
                  >
                    {updateDetails}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
}



// EnrollmentCard.js
function EnrollmentCard(props) {
    const [couponCode, setCouponCode] = useState("FIRST200");
    const [isCouponApplied, setIsCouponApplied] = useState(false);
    const [finalPrice, setFinalPrice] = useState(props.discountPrice.replace(/,/g, ''));
    const [couponDiscount, setCouponDiscount] = useState(0);
    const [applyButtonText, setApplyButtonText] = useState("Apply");
    const [couponType, setCouponType] = useState("");

    async function verifyCoupon(){
      setApplyButtonText("Applying...");
        const token =localStorage.getItem("token")
        const data = {
            token,
            couponCode
        }
        const response = await verifyCouponCode(data)
        if(response.success){
            setIsCouponApplied(true);
            setCouponCode(response.coupon.couponCode)
            setCouponDiscount(response.coupon.discountAmount);
            setFinalPrice(finalPrice - response.coupon.discountAmount);
            setCouponType(response.couponType);
            setApplyButtonText("Applied");
        }else{
            setApplyButtonText("Apply");
            alert(response.message)
        }
    }

    async function buyNow(){

      if(!isCouponApplied){
        setCouponCode("")
      }

      const purchaseData = {
        couponCode,
        finalPrice,
        couponType,
        couponDiscount,
      }
      
      props.buyNow(purchaseData)
    }

    return (
      <div className="lg:col-span-1">
        <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 sticky top-24 w-full sm:w-[288px] md:w-full lg:w-[252px] xl:w-[288px] mx-auto overflow-hidden md:flex md:flex-row lg:flex-col">
          <div className="relative w-full h-[180px] sm:h-[160px] md:h-[200px] md:w-1/2 lg:w-full">
            <img
              src="/course-photo/testSeries.jpeg"
              alt="Course Preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          </div>
          <div className="p-4 sm:p-5 space-y-3 md:w-1/2 lg:w-full md:flex md:flex-col md:justify-center">
            <div className="bg-gray-50 rounded-2xl p-3 shadow-sm">
              <div className="flex items-center justify-center">
                <div className="flex flex-col items-center">
                  <span className="text-sm text-gray-600 font-medium">
                    Price:{" "}
                    <span className="text-base text-red-600 line-through font-medium font-poppins">
                      ₹{props.price}
                    </span>
                  </span>
                  <span className="text-sm text-gray-600 font-medium mt-1">
                    Offer:{" "}
                    <span className="text-sm text-green-600 font-semibold">
                      {Math.round(
                        ((props.price.replace(/,/g, "") -
                          props.discountPrice.replace(/,/g, "")) /
                          props.price.replace(/,/g, "")) *
                          100
                      )}
                      % OFF
                    </span>
                  </span>
                  {isCouponApplied && (
                    <span className="text-sm text-gray-600 font-medium mt-1">
                      Coupon Discount:{" "}
                      <span className="text-sm text-green-600 font-semibold">
                        - ₹{couponDiscount}
                      </span>
                    </span>
                  )}
                  <span className="text-sm text-gray-600 font-medium mt-1">
                    Final Price:{" "}
                    <span className="text-2xl font-extrabold text-gray-900 font-poppins">
                      ₹{finalPrice}
                    </span>
                  </span>
                  <span className="text-gray-600 text-sm font-semibold mt-2 bg-gray-100 px-4 py-1 rounded-full shadow-inner">
                    {props.duration}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Coupon or Referral Code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#e96030] focus:border-transparent"
                disabled={isCouponApplied}
              />
              <button
                className={`px-4 py-2 ${
                  isCouponApplied
                    ? "bg-green-500 cursor-not-allowed"
                    : "bg-[#1d77bc] hover:bg-[#1a69a7]"
                } text-white rounded-lg text-sm font-medium transition-colors`}
                onClick={verifyCoupon}
                disabled={isCouponApplied}
              >
                {applyButtonText}
              </button>
            </div>
            {props.purchaseStatus ? (
              <button
                className="w-full bg-[#4CAF50] text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-[#45a049] hover:shadow-lg flex items-center justify-center text-lg"
                onClick={() => buyNow()}
                disabled={props.purchaseStatus}
                style={{
                  opacity: props.validatedDetails ? 1 : 0.5,
                  cursor: props.validatedDetails ? "pointer" : "not-allowed",
                }}
              >
                <svg
                  className="w-5 h-5 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Purchased
              </button>
            ) : (
              <button
                className="w-full bg-[#e96030] text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-[#d54e22] hover:shadow-lg flex items-center justify-center text-lg"
                onClick={() => buyNow()}
                disabled={!props.validatedDetails}
                style={{
                  opacity: props.validatedDetails ? 1 : 0.5,
                  cursor: props.validatedDetails ? "pointer" : "not-allowed",
                }}
              >
                <svg
                  className="w-5 h-5 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                {props.validatedDetails ? "Buy Now" : "Fill Details To Buy"}
              </button>
            )}
            <div className="pt-3 border-t border-gray-200">
              <div className="flex flex-col items-center space-y-2">
                <div className="flex items-center space-x-2">
                  <svg
                    className="w-4 h-4 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <span className="text-xs text-gray-600 font-medium">
                    Secure payment via Razorpay
                  </span>
                </div>
                <p className="text-xs text-gray-500 font-medium">
                  Get instant access after payment
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
}