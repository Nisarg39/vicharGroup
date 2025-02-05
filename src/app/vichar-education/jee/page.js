"use client"
import JeeHero from "../../../../components/vicharEducation/jee/JeeHero"
import JeeInfo from "../../../../components/vicharEducation/jee/JeeInfo"
import JeeAnswerMarking from "../../../../components/vicharEducation/jee/JeeAnswerMarking"
import JeeConclusion from "../../../../components/vicharEducation/jee/JeeConclusion"
import StudentEnquiryForm from "../../../../components/home/StudentEnquiryForm"
import JeeTestimonials from "../../../../components/vicharEducation/jee/JeeTestimonials"
import WhyChooseUs from "../../../../components/home/WhyChooseUs"
const Contact = () => {
    
    return (
        <>
            <JeeHero title="JEE Preparation Courses"/>
            <JeeInfo />
            <JeeAnswerMarking />
            <JeeConclusion />
            <WhyChooseUs />
            <JeeTestimonials />
            <StudentEnquiryForm />
        </>
    )
}

export default Contact