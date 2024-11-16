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
    <>
      <HeroSection />
      <Courses />
      <DirectorMessage />
      <WhyChooseUs />
      <AllTestimonials />
      <StudentEnquiryForm />
      <VicharApp />
    </>
  );
}
