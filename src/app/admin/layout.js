import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Admin Page",
  description: "Admin Page",
};

export default function Root({ children }) {
  return (
    <>
    {children}
    </>
  );
}