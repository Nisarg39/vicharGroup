"use client"
import HeroSection from "../../../components/stockMarket/HeroSection"
import StockCourses from "../../../components/stockMarket/StockCourses"
import Domains from "../../../components/stockMarket/Domains"
import ContactUs from "../../../components/home/ContactUs"
import Faq from "../../../components/stockMarket/Faq"
import StockTestimonials from "../../../components/stockMarket/StockTestimonials"
export default function StockMarketHome(){
    return(
        <>
            <HeroSection />
            <StockCourses />
            <Domains />
            <Faq />
            <StockTestimonials />
            <ContactUs />
        </>
    )
}