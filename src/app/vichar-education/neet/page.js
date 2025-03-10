"use client"
import NeetHero from "../../../../components/vicharEducation/neet/NeetHero"
import NeetInfo from "../../../../components/vicharEducation/neet/NeetInfo"
import NeetAnswerMarking from "../../../../components/vicharEducation/neet/NeetAnswerMarking"
import NeetConclusion from "../../../../components/vicharEducation/neet/NeetConclusion"
import StudentEnquiryForm from "../../../../components/home/StudentEnquiryForm"
import NeetTestimonials from "../../../../components/vicharEducation/neet/NeetTestimonials"
import WhyChooseUs from "../../../../components/home/WhyChooseUs"
const Contact = () => {
    
    return (
        <>
            <NeetHero title="NEET Preparation Course"/>
            <NeetInfo />
            <NeetAnswerMarking />
            <NeetConclusion />
            <WhyChooseUs />
            <NeetTestimonials />
            <StudentEnquiryForm />
        </>
    )
}

export default Contact