import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Image Upload",
  description: "Image upload",
};

export default function Root({ children }) {
  return (
    <>
    {children}
    </>
  );
}