import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Login to Vichar Group",
  description: "Login to Vichar Group",
};

export default function Root({ children }) {
  return (
    <>
    {children}
    </>
  );
}