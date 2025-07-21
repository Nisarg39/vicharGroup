"use client"

import { useParams } from "next/navigation"
import ExamHome from "@/components/examPortal/examPageComponents/ExamHome"


const ExamPage = () => {

    const { id } = useParams()
    
    return (
        <div className="mt-20 bg-white">
            <ExamHome examId={id} />
        </div>
    )
}

export default ExamPage