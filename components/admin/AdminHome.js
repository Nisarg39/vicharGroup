"use client"
import SignIn from "./SignIn";
import Dashboard from "./Dashboard";
import { useEffect, useState } from "react";
import Modal from "../common/modal";
import { set } from "mongoose";
export default function AdminHome() {

      const [isAdmin, setIsAdmin] = useState(false);
      const [success, setSuccess] = useState(false);
      const [message, setMessage] = useState("");
      const [showModal, setShowModal] = useState(false);

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
          <Dashboard />
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