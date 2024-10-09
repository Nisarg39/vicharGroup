import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Terms and Conditions for Vichar Group",
  description: "Terms and Conditions for Vichar Group",
};

export default function Root({ children }) {
  return (
    <>
    {children}
    </>
  );
}