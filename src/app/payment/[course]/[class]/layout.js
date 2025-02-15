import { Inter } from "next/font/google";

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
    {children}
    </>
  );
}