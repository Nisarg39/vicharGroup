"use client"
import VicharFoundationHero from "../../../../components/vicharEducation/vicharFoundation/VicharFoundationHero"
import FoundationTestimonials from "../../../../components/vicharEducation/vicharFoundation/FoundationTestimonials"
import FoundationCourses from "../../../../components/vicharEducation/vicharFoundation/FoundationCourses"
import WhyChooseUs from "../../../../components/home/WhyChooseUs"
import FullScreenBanner from "../../../../components/common/FullScreenBanner"
const Contact = () => {
    
    return (
        <>
            <FullScreenBanner url="/foundation-students/foundationBanner.gif"/>
            <VicharFoundationHero />
            <FoundationCourses title="Foundation Course"/>
            <WhyChooseUs />
            <FoundationTestimonials />
        </>
    )
}

export default Contact