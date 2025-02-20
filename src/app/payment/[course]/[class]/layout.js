import { Inter } from "next/font/google";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata({ params }) {
  return {
    title: `Checkout ${params.course} - ${params.class} Test Series`,
    description: `Checkout ${params.course} ${params.class} Test Series`,
  };
}

export default function Root({ children }) {
  return (
    <>
    {/* Razorpay Checkout JS Script . This is used to enable the payment gateway in payment.js component*/}
    <Script id="razorpay-checkout-js" src="https://checkout.razorpay.com/v1/checkout.js" />
    {children}
    </>
  );
}