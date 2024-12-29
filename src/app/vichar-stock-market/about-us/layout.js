import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "About Us - Stock Market",
  description: "About Us - Stock Market",
};

export default function Root({ children }) {
  return (
    <>
    {children}
    </>
  );
}