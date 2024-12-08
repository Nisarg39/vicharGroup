"use client"
import HeroSection from "../../../components/stockMarket/HeroSection"
import StockCourses from "../../../components/stockMarket/StockCourses"
import ContactUs from "../../../components/home/ContactUs"
import Faq from "../../../components/stockMarket/Faq"
import StockTestimonials from "../../../components/stockMarket/StockTestimonials"
import Whatyoulearn from "../../../components/stockMarket/Whatyoulearn"
import WhyChooseUs from "../../../components/stockMarket/WhyChooseUs"
import Instructor from "../../../components/stockMarket/Instructor"
export default function StockMarketHome(){
    return(
        <>
            <HeroSection />
            <StockCourses />
            <Instructor />
            <Whatyoulearn />
            <WhyChooseUs />
            <Faq />
            <StockTestimonials />
            <ContactUs />
        </>
    )
}