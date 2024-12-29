import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "JEE",
  description: "JEE",
};

export default function Root({ children }) {
  return (
    <>
    {children}
    </>
  );
}