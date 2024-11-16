import NeetHero from "../../../../components/vicharEducation/Neet/NeetHero"
import NeetInfo from "../../../../components/vicharEducation/neet/NeetInfo"
import NeetAnswerMarking from "../../../../components/vicharEducation/neet/NeetAnswerMarking"
import NeetConclusion from "../../../../components/vicharEducation/neet/NeetConclusion"
import StudentEnquiryForm from "../../../../components/home/StudentEnquiryForm"
import NeetTestimonials from "../../../../components/vicharEducation/Neet/NeetTestimonials"
const Contact = () => {
    
    return (
        <>
            <NeetHero title="NEET Preparation Course"/>
            <NeetInfo />
            <NeetAnswerMarking />
            <NeetConclusion />
            <NeetTestimonials />
            <StudentEnquiryForm />
        </>
    )
}

export default Contact