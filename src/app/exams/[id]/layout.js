import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Exam Page",
  description: "Exam Page",
};

export default function Root({ children }) {
  return (
    <>
    {children}
    </>
  );
}