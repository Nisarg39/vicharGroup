"use client"
import { useSelector, useDispatch } from "react-redux";
import { loggedIn, loggedOut } from "../../features/login/LoginSlice";
import HeroSection from "../../components/home/HeroSection";
import Courses from "../../components/home/Courses";
import DirectorMessage from "../../components/home/DirectorMessage";
import StudentEnquiryForm from '../../components/home/StudentEnquiryForm'
import VicharApp  from '../../components/home/VicharApp'
import WhyChooseUs from '../../components/home/WhyChooseUs'
import AllTestimonials from "../../components/home/AllTestimonials"
import { Analytics } from "@vercel/analytics/react"

export default function Home() {
  const isLoggedIn = useSelector(state => state.login.loginStatus);
  const dispatch = useDispatch();

  const login = () => {
    dispatch(loggedIn());
  };

  const logout = () => {
    dispatch(loggedOut());
  };

  return (
    <div>

      <div className="bg-gradient-to-b from-white to-gray-200 transition-colors duration-500 ease-in-out">
        <HeroSection />
      </div>

      <div className="bg-gradient-to-b from-gray-200 to-gray-50 transition-colors duration-500 ease-in-out">
        <Courses />
      </div>

      <div className="bg-gradient-to-b from-gray-50 to-gray-200 transition-colors duration-500 ease-in-out">
        <DirectorMessage />
      </div>

      <div className="bg-gradient-to-b from-gray-200 to-white transition-colors duration-500 ease-in-out">
        <WhyChooseUs />
      </div>

      <div className="bg-gradient-to-b from-white to-gray-200 transition-colors duration-500 ease-in-out">
        <AllTestimonials />
      </div>

      <div className="bg-gradient-to-b from-gray-200 to-white transition-colors duration-500 ease-in-out">
        <StudentEnquiryForm />
      </div>
      {/* <VicharApp /> */}
    </div>
  );
}
