import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Test Series",
  description: "Test Series",
};

export default function Root({ children }) {
  return (
    <>
    {children}
    </>
  );
}