import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "About Vichar Group",
  description: "About Vichar Group",
};

export default function Root({ children }) {
  return (
    <>
    {children}
    </>
  );
}