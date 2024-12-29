import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Contact Us",
  description: "Contact Us",
};

export default function Root({ children }) {
  return (
    <>
    {children}
    </>
  );
}