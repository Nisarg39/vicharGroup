import { useState, useEffect } from "react";
import { addSegment, segmentDetails } from "../../../server_actions/actions/adminActions"
import SegmentEditor from "./segmentPanel/SegmentEditor"

export default function SegmentControls() {
    const [segmentName, setSegmentName] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [segments, setSegments] = useState([])
    const [products, setProducts] = useState([])
    const [productUpdated, setProductUpdated] = useState(false)

    const handleAddSegment = async () => {

        const details = {
            name: segmentName
        }

        if(segmentName === ""){
            alert("Please enter a segment name")
            return
        }
        if(segmentName.length < 3){
            alert("Segment name should be at least 3 characters long")
            return
        }
        

        if(localStorage.getItem("isAdmin")){
            setIsLoading(true)
            const segment = await addSegment(details)
            if(segment.success){
                alert(segment.message)
                setSegmentName("")
                setIsLoading(false)
                fetchData()
            }else{
                alert(segment.message)
                setIsLoading(false)
            }
        }
    }

    async function fetchData(){
        const fetchSegments = await segmentDetails()
        setProducts(fetchSegments.products)
        setSegments(fetchSegments.segments)
        setProductUpdated(false)
        // console.log(fetchSegments)
    }

    useEffect(() => {
        fetchData()
    }, [productUpdated])
    return(
        <div className="min-h-full w-full">
            <div className="mb-4">
                <h2 className="text-lg font-semibold">Add Segment</h2>
                <div className="p-4 border rounded">
                    <div className="flex gap-4">
                        <input
                            type="text"
                            placeholder="Enter segment name"
                            className="flex-1 px-3 py-2 border rounded"
                            value={segmentName}
                            onChange={(e) => setSegmentName(e.target.value)}
                        />
                        <button
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
                            onClick={handleAddSegment}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Adding Segment...' : 'Add Segment'}
                        </button>
                    </div>
                </div>
            </div>
            <div>
                <SegmentEditor 
                segments={segments}
                products={products}
                setProductUpdated={setProductUpdated}
                setSegments={setSegments}
                setProducts={setProducts}
            />
            </div>
        </div>
    )
}