import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Stock Market",
  description: "Stock Market",
};

export default function Root({ children }) {
  return (
    <>
    {children}
    </>
  );
}