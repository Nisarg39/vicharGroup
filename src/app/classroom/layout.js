import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Classroom",
  description: "Classroom",
};

export default function Root({ children }) {
  return (
    <>
    {children}
    </>
  );
}