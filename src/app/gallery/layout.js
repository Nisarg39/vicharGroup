import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Gallery",
  description: "Gallery",
};

export default function Root({ children }) {
  return (
    <>
    {children}
    </>
  );
}