import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "NEET",
  description: "NEET",
};

export default function Root({ children }) {
  return (
    <>
    {children}
    </>
  );
}