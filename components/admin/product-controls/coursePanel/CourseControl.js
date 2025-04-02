import { useEffect, useState } from "react"
import { showCourses, updateCourse } from "../../../../server_actions/actions/adminActions"
import CourseDetails from "./CourseDetails"
export default function CourseControl() {
    const [products, setProducts] = useState([])
    const [productSelected, setProductSelected] = useState({})
    const [editingId, setEditingId] = useState(null)
    const [updatedName, setUpdatedName] = useState("")
    const [updatedImage, setUpdatedImage] = useState("")

    async function fetchCourses(){
        const productList = await showCourses()
        setProducts(productList.products)
        // console.log(productList.courses[0]._id)
    }

    useEffect(() => {
        fetchCourses()
    }, [])

    const handleUpdate = async(product) => {
        const details={
            id: product._id,
            name: updatedName,
            image: updatedImage,
        }
        try {
            const updateDetails = await updateCourse(details)
            if(updateDetails.success){
                alert(updateDetails.message)
                setEditingId(null)
                fetchCourses()
            }
        } catch (error) {
            alert("Error in updating course")
        }
    }

    const handleEdit = (product) => {
        if (editingId === product._id) {
            setEditingId(null)
        } else {
            setEditingId(product._id)
            setUpdatedName(product.name)
            setUpdatedImage(product.image)
        }
    }

    return(
        <div className="h-full w-full">
            {Object.keys(productSelected).length === 0 ? (
                <div className="grid grid-cols-1 gap-4">
                    {products.map((product) => (
                        <div 
                            key={product._id} 
                            className="p-4 border rounded-lg shadow hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200 cursor-pointer bg-white hover:bg-gray-50"
                            onClick={() => !editingId && setProductSelected(product)}
                        >
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <img 
                                        src={product.image} 
                                        alt={product.name}
                                        className="w-16 h-16 object-cover rounded"
                                    />
                                    <h3 className="text-lg font-semibold">{product.name}</h3>
                                </div>
                                <button 
                                    className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleEdit(product)
                                    }}
                                >
                                    Edit
                                </button>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">Click here to see more details</p>
                            {editingId === product._id && (
                                <div className="mt-2">
                                    <input
                                        type="text"
                                        value={updatedName}
                                        onChange={(e) => setUpdatedName(e.target.value)}
                                        className="w-full p-2 border rounded mb-2"
                                        onClick={(e) => e.stopPropagation()}
                                        placeholder="Course Name"
                                    />
                                    <input
                                        type="text"
                                        value={updatedImage}
                                        onChange={(e) => setUpdatedImage(e.target.value)}
                                        className="w-full p-2 border rounded"
                                        onClick={(e) => e.stopPropagation()}
                                        placeholder="Image URL"
                                    />
                                    <button 
                                        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleUpdate(product)
                                        }}
                                    >
                                        Update
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <CourseDetails 
                    product={productSelected} 
                />
            )}
        </div>
    )
}