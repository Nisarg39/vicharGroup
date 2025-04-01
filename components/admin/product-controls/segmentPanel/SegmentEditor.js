import { useState } from "react";
import { updateSegment } from "../../../../server_actions/actions/adminActions"

export default function SegmentEditor({segments, products, setProductUpdated}) {
    const [selectedProducts, setSelectedProducts] = useState({})
    const [productSegmentMap, setProductSegmentMap] = useState({})
    const [isUpdating, setIsUpdating] = useState({})

    const handleProductSelection = (segmentId, productId, checked) => {
        // console.log(`Segment ${segmentId} product ${productId} selected:`, checked)
        setSelectedProducts(prev => {
            const newState = {
                ...prev,
                [segmentId]: [...(prev[segmentId] || [])]
            }
            if (checked) {
                newState[segmentId].push(productId);
                setProductSegmentMap(prev => ({
                    ...prev,
                    [productId]: segmentId
                }));
            } else {
                newState[segmentId] = newState[segmentId].filter(id => id !== productId);
                setProductSegmentMap(prev => {
                    const newMap = { ...prev };
                    delete newMap[productId];
                    return newMap;
                });
            }
            // console.log('Selected products:', newState)
            return newState
        })
        if (checked) {
            // console.log('Selected product ID:', productId)
        }
    }

    const handleUpdate = async (segmentId) => {
        setIsUpdating(prev => ({ ...prev, [segmentId]: true }));
        try {
            // console.log('Updating segment:', segmentId, 'with products:', selectedProducts[segmentId] || []);
            const details = {
                segmentId: segmentId,
                productIds: selectedProducts[segmentId] || []
            }
            const segment = await updateSegment(details)
            if(segment.success){
                setProductUpdated(true)
                setSelectedProducts(prev => {
                    const newState = { ...prev };
                    delete newState[segmentId];
                    return newState;
                });
                alert(segment.message)
            }else{
                alert(segment.message)
            }
        } finally {
            setIsUpdating(prev => ({ ...prev, [segmentId]: false }));
        }
    }

    return(
        <>
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Segment Details</h2>
        <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
            <div className="grid grid-cols-1 gap-6">
                {Object.entries(segments).map(([id, segment]) => (
                    <div key={segment._id} className="p-6 bg-gray-50 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-lg font-semibold text-gray-900">{segment.name}</p>
                                <p className="text-sm text-gray-500 mt-1">ID: {segment._id}</p>
                                <div className="text-sm text-gray-600 mt-2">
                                    <p className="font-medium">Currently included products:</p>
                                    {segment.products && segment.products.length > 0 ? (
                                        <div className="ml-2">
                                            {segment.products.map(product => (
                                                <div key={product._id} className="text-gray-700">
                                                    {product.name}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="ml-2 text-gray-500 italic">No products currently included</p>
                                    )}
                                </div>
                                {selectedProducts[segment._id]?.length > 0 && (
                                    <div className="text-sm text-blue-600 mt-1">
                                        Selected products: 
                                        {selectedProducts[segment._id]?.map(productId => (
                                            <div key={productId} className="ml-2">
                                                {products.find(p => p._id === productId)?.name}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="space-x-2">
                                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                                    Edit Details
                                </button>
                            </div>
                        </div>
                        <div className="mt-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Select Products</label>
                            <details className="w-full">
                                <summary className="px-3 py-2 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm cursor-pointer">
                                    Click to select products
                                </summary>
                                <div className="mt-1 border border-gray-300 rounded-lg p-3 bg-white">
                                    {products.map((product) => (
                                        <label key={`${product._id}`} className="flex items-center py-2 px-3 hover:bg-blue-50 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                value={product.id}
                                                checked={selectedProducts[segment._id]?.includes(product._id) || false}
                                                disabled={productSegmentMap[product._id] && productSegmentMap[product._id] !== segment._id}
                                                onChange={(e) => handleProductSelection(segment._id, product._id, e.target.checked)}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                            <span className="ml-2">{product.name}</span>
                                        </label>
                                    ))}
                                    <div className="mt-4 flex justify-end">
                                        <button 
                                            onClick={() => handleUpdate(segment._id)}
                                            disabled={!selectedProducts[segment._id]?.length || isUpdating[segment._id]}
                                            className={`px-4 py-2 text-white rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${!selectedProducts[segment._id]?.length || isUpdating[segment._id] ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}>
                                            {isUpdating[segment._id] ? 'Updating...' : 'Update'}
                                        </button>
                                    </div>
                                </div>
                            </details>
                        </div>
                    </div>
                ))}
            </div>
        </div>
        </>
    )
}