import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Exams",
  description: "Exams",
};

export default function Root({ children }) {
  return (
    <>
    {children}
    </>
  );
}