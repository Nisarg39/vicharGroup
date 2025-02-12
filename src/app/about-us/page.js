"use client"
import AboutUs from "../../../components/home/AboutUs"
import DirectorMessage from "../../../components/home/DirectorMessage"
import ContactUs from "../../../components/home/ContactUs"
import WhyChooseUs from "../../../components/home/WhyChooseUs"
const Contact = () => {
    
    return (
        <section id="about-us" className="pt-24">
            <DirectorMessage />
            <WhyChooseUs />
            <AboutUs />
            <ContactUs />
        </section>
    )
}

export default Contact