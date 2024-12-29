import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "MHT-CET",
  description: "MHT-CET",
};

export default function Root({ children }) {
  return (
    <>
    {children}
    </>
  );
}