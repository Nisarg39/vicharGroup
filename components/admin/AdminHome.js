"use client"
import SignIn from "./SignIn";
import Dashboard from "./Dashboard";
import { useEffect, useState } from "react";
import Modal from "../common/Modal";
import Sidebar from './Sidebar'
import AdminStats from "./AdminStats";
import AdminControls from "./AdminControls";

export default function AdminHome() {

      const [isAdmin, setIsAdmin] = useState(false);
      const [success, setSuccess] = useState(false);
      const [message, setMessage] = useState("");
      const [showModal, setShowModal] = useState(false);
      const [dashBoardName, setDashBoardName] = useState("dashboard");


      async function successHandler(status, message){
          setSuccess(status);
          setMessage(message);
          setShowModal(true);
      }

      async function adminStatus(status){
          setIsAdmin(status);
      }

      useEffect(() => { 
        if(localStorage.getItem("isAdmin")){
          setIsAdmin(true);
        }
      }, []);
    return (
      <div>
        {isAdmin ? (
          <>
            <Sidebar setDashBoardName={setDashBoardName} />
            {dashBoardName === "dashboard" && <Dashboard />}
            {dashBoardName === "statistics" && <AdminStats />}
            {dashBoardName === "adminControls" && <AdminControls />}

          </>
        ) : (
          <SignIn adminStatus={adminStatus} successHandler={successHandler} />
        )}
        {showModal && (
          <Modal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            isSuccess={success}
            modalMessage={message}
            showModal={showModal}
            setShowModal={setShowModal}
          />
        )}
      </div>
    );
}