"use client"
import HeroSection from "../../../components/stockMarket/HeroSection"
import StockCourses from "../../../components/stockMarket/StockCourses"
import ContactUs from "../../../components/home/ContactUs"
import Faq from "../../../components/stockMarket/Faq"
import StockTestimonials from "../../../components/stockMarket/StockTestimonials"
import Whatyoulearn from "../../../components/stockMarket/whatyoulearn"
import WhyChooseUs from "../../../components/stockMarket/WhyChooseUs"
export default function StockMarketHome(){
    return(
        <>
            <HeroSection />
            <StockCourses />
            <Whatyoulearn />
            <WhyChooseUs />
            <Faq />
            <StockTestimonials />
            <ContactUs />
        </>
    )
}