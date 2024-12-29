import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Education",
  description: "Education",
};

export default function Root({ children }) {
  return (
    <>
    {children}
    </>
  );
}