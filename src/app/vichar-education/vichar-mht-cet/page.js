import MhtCetHero from "../../../../components/vicharEducation/mht-cet/MhtCetHero"
import MhtCetInfo from "../../../../components/vicharEducation/mht-cet/MhtCetInfo"
import MhtCetAnswerMarking from "../../../../components/vicharEducation/mht-cet/MhtCetAnswerMarking"
import MhtConclusion from "../../../../components/vicharEducation/mht-cet/MhtConclusion"
import StudentEnquiryForm from "../../../../components/home/StudentEnquiryForm"
import NeetTestimonials from "../../../../components/vicharEducation/Neet/NeetTestimonials"
const Contact = () => {
    
    return (
        <>
            <MhtCetHero title="MHT-CET Preparation Courses"/>
            <MhtCetInfo />
            <MhtCetAnswerMarking />
            <MhtConclusion />
            <NeetTestimonials />
            <StudentEnquiryForm />
        </>
    )
}

export default Contact