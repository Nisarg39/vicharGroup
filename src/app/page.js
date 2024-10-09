"use client"
import { useSelector, useDispatch } from "react-redux";
import { loggedIn, loggedOut } from "../../features/login/LoginSlice";
import HeroSection from "../../components/home/HeroSection";
import Courses from "../../components/home/Courses";
import ContactUs from "../../components/home/ContactUs";
import AboutUs from "../../components/home/AboutUs";
import DirectorMessage from "../../components/home/DirectorMessage";
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
      <AboutUs />
      <ContactUs />
    </>
  );
}
