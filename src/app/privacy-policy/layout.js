import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Privacy Policy for Vichar Group",
  description: "Privacy Policy for Vichar Group",
};

export default function Root({ children }) {
  return (
    <>
    {children}
    </>
  );
}