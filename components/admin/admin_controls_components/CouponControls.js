"use client"
import { useState, useEffect } from "react";
import { addCouponCode, getAllCouponCodes } from "../../../server_actions/actions/adminActions";


function CouponList({ refreshTrigger }) {
    const [coupons, setCoupons] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [selectedDescription, setSelectedDescription] = useState(null);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchCoupons();
    }, [currentPage, refreshTrigger]);

    const fetchCoupons = async () => {
        const response = await getAllCouponCodes();
        if(response.success){
            setCoupons(response.couponCodes);
            setTotalPages(response.pagination.totalPages);
        }else{
            alert(response.message);
        }
    };

    return (
        <div className="list-section">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Coupon List</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coupon Code</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount (₹) </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Used Count</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Password</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {coupons.map((coupon, index) => (
                            <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap">{coupon.couponCode}</td>
                                <td className="px-6 py-4 whitespace-nowrap">₹ {coupon.discountAmount}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{new Date(coupon.expiryDate).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{coupon.status}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{coupon.usedCount || 0}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <button 
                                        onClick={() => setSelectedDescription(selectedDescription === index ? null : index)}
                                        className="text-blue-600 hover:text-blue-900"
                                    >
                                        View
                                    </button>
                                    {selectedDescription === index && (
                                        <div className="absolute bg-white border p-4 rounded-lg shadow-lg mt-2">
                                            {coupon.description}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">{coupon.password}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <button className="text-red-600 hover:text-red-900">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="mt-4 flex justify-center space-x-2">
                <button 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border rounded-md disabled:opacity-50"
                >
                    Previous
                </button>
                <span className="px-4 py-2">Page {currentPage} of {totalPages}</span>
                <button 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border rounded-md disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </div>
    )
}

export default function CouponControls() {
    const [couponCode, setCouponCode] = useState("");
    const [discountAmount, setDiscountAmount] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const [status, setStatus] = useState("active");
    const [description, setDescription] = useState("");
    const [password, setPassword] = useState("");
    const [codeError, setCodeError] = useState("");
    const [refreshList, setRefreshList] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(){
        if (!couponCode || !discountAmount || !expiryDate || !status || !description || !password) {
            setModalMessage("All fields are mandatory");
            setShowModal(true);
            return;
        }
        if (!couponCode.match(/^(?=.*[0-9])(?=.*[a-zA-Z])[a-zA-Z0-9]{5,}$/)) {
            setCodeError("Coupon code must have at least 5 characters, contain at least 1 number, and no spaces");
            return;
        }
        setCodeError("");
        setIsSubmitting(true);
        const couponDetails = await addCouponCode({
            couponCode,
            discountAmount,
            expiryDate,
            status,
            description,
            password
        })
        if(couponDetails.success){
            setCouponCode("");
            setDiscountAmount("");
            setExpiryDate("");
            setStatus("");
            setDescription("");
            setPassword("");
            setRefreshList(prev => prev + 1);
            setModalMessage("Coupon added successfully");
        }else{
            setModalMessage(couponDetails.message);
        }
        setIsSubmitting(false);
        setShowModal(true);
    }

    return(
        <div className="p-6 bg-white rounded-lg shadow-lg">
            <div className="add-section mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Add Coupon</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="input-group">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Coupon Code:*</label>
                        <input 
                            type="text" 
                            required 
                            pattern="^(?=.*[0-9])(?=.*[a-zA-Z])[a-zA-Z0-9]{5,}$"
                            title="Minimum 5 characters with at least 1 number and no spaces"
                            value={couponCode}
                            onChange={(e) => {
                                let value = e.target.value;
                                value = value.replace(/[^a-zA-Z0-9]/g, '');
                                setCouponCode(value);
                                setCodeError("");
                            }}
                            className={`w-full px-4 py-2 border ${codeError ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                        />
                        {codeError && <p className="mt-1 text-sm text-red-500">{codeError}</p>}
                    </div>
                    <div className="input-group">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Discount Amount (₹):*</label>
                        <input 
                            type="number" 
                            required 
                            min="0"
                            step="1"
                            value={discountAmount}
                            onChange={(e) => {
                                let value = e.target.value;
                                value = value.replace(/[^0-9]/g, '');
                                setDiscountAmount(value);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === '.' || e.key === '-' || e.key === 'e' || e.key === '+') {
                                    e.preventDefault();
                                }
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div className="input-group">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date:*</label>
                        <input 
                            type="date" 
                            required 
                            value={expiryDate}
                            onChange={(e) => setExpiryDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div className="input-group">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status:*</label>
                        <select 
                            required
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="active">Active</option>
                            <option value="expired">Expired</option>
                            <option value="used">Used</option>
                        </select>
                    </div>
                    <div className="input-group">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Password:*</label>
                        <input 
                            type="password" 
                            required 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div className="input-group md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description:*</label>
                        <textarea 
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            rows="3"
                            placeholder="Enter coupon description..."
                        />
                    </div>
                </div>
                <button 
                    onClick={() => handleSubmit()}
                    disabled={isSubmitting}
                    className="mt-6 px-6 py-2 bg-[#1d77bc] text-white font-medium rounded-md hover:bg-[#0056b3] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                    {isSubmitting ? 'Adding Coupon...' : 'Add Coupon'}
                </button>
            </div>
            
            <CouponList refreshTrigger={refreshList} />

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-xl">
                        <p className="text-lg">{modalMessage}</p>
                        <button 
                            onClick={() => setShowModal(false)}
                            className="mt-4 px-4 py-2 bg-[#1d77bc] text-white rounded-md hover:bg-[#0056b3]"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}