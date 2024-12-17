import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Admin Page - Vichar Group",
  description: "Admin Page - Vichar Group",
};

export default function Root({ children }) {
  return (
    <>
    {children}
    </>
  );
}