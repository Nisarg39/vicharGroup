import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Jee Test Series - Buy Now",
  description: "Test Series - Buy Now",
};

export default function Root({ children }) {
  return (
    <>
    {children}
    </>
  );
}