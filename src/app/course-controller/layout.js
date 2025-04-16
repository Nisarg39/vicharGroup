import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Course Controller",
  description: "Course Controller",
};

export default function Root({ children }) {
  return (
    <>
    {children}
    </>
  );
}