"use client"
import { useState, useEffect } from 'react'
import { getTestSeries } from '../../../server_actions/actions/studentActions'
import { 
    TagIcon,
    CurrencyRupeeIcon,
    StarIcon,
    ShoppingCartIcon,
    CheckCircleIcon,
    AcademicCapIcon,
    ClockIcon,
    UserGroupIcon
} from '@heroicons/react/24/outline'
import { useSelector } from 'react-redux'


export default function AvailableTests() {
    const student = useSelector(state => state.login.studentDetails)
    const [loading, setLoading] = useState(false)
    const [testSeries, setTestSeries] = useState([])

    const fetchTestSeries = async () => {
        setLoading(true)
        const res = await getTestSeries()
        console.log("Test Series Response:", res) // For debugging
        if (res.success) {
            setTestSeries(res.testSeries)
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchTestSeries()
    }, [])

    // Check if student has purchased the test
    const isPurchased = (testId) => {
        if (!student?.purchases) return false
        return student.purchases.some(purchase => 
            purchase.product._id === testId || purchase.product === testId
        )
    }

    return (
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold bg-clip-text text-[#1d77bc] mb-3">
                    Available Test Series
                </h2>
                <p className="text-gray-600 text-lg">Choose from our premium collection of test series</p>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : testSeries.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {testSeries.map((test) => (
                        <div key={test._id} 
                            className="bg-gradient-to-br from-white to-gray-50 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
                        >
                            <div className="p-6">
                                <div className="flex flex-wrap gap-2 mb-4">
                                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold flex items-center gap-1">
                                        <TagIcon className="w-4 h-4" />
                                        {test.class}
                                    </span>
                                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold flex items-center gap-1">
                                        <TagIcon className="w-4 h-4" />
                                        {test.type}
                                    </span>
                                </div>

                                <h3 className="text-xl font-bold text-gray-800 mb-3">{test.name}</h3>
                                <p className="text-gray-600 text-sm mb-4">{test.description || "Comprehensive test series with detailed solutions"}</p>

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <div className="p-2.5 bg-blue-500/10 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                            <AcademicCapIcon className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <span>{test.subjects?.map(subject => subject.name).join(', ') || 'Multiple Subjects'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <div className="p-2.5 bg-purple-500/10 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                            <ClockIcon className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <span>{test.duration}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="p-2.5 bg-orange-500/10 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                            <StarIcon className="w-5 h-5 text-orange-600" />
                                        </div>
                                        <span className="font-semibold">{test.rating || 4.5}</span>
                                        <div className="flex items-center gap-1 text-gray-600">
                                            <div className="p-2.5 bg-green-500/10 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                                <UserGroupIcon className="w-4 h-4 text-green-600" />
                                            </div>
                                            <span>{test.students || 0} enrolled</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 mb-6">
                                    {test.features?.map((feature, index) => (
                                        <div key={index} className="flex items-start gap-2">
                                            <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5" />
                                            <span className="text-gray-600">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                    <div className="flex items-center gap-1">
                                        <CurrencyRupeeIcon className="w-5 h-5 text-gray-700" />
                                        <span className="text-2xl font-bold text-gray-800">
                                            {test.discountPrice || test.price}
                                        </span>
                                        {test.discountPrice && (
                                            <span className="text-sm text-gray-500 line-through ml-2">
                                                {test.price}
                                            </span>
                                        )}
                                    </div>
                                    
                                    {isPurchased(test._id) ? (
                                        <div className="bg-green-100 text-green-700 py-2 px-6 rounded-lg font-semibold flex items-center gap-2">
                                            <CheckCircleIcon className="w-5 h-5" />
                                            Purchased
                                        </div>
                                    ) : (
                                        <button className="bg-gradient-to-r from-[#1d77bc] to-[#2d8bd4] text-white py-2 px-6 rounded-lg font-semibold hover:from-[#1d77bc]/90 hover:to-[#2d8bd4]/90 transform hover:scale-[1.02] transition-all duration-200 flex items-center gap-2 shadow-lg">
                                            <ShoppingCartIcon className="w-5 h-5" />
                                            Purchase
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <p className="text-gray-600 text-lg">No test series available at the moment.</p>
                </div>
            )}
        </div>
    )
}
