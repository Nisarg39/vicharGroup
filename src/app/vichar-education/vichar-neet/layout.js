import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Vichar Group - Vichar NEET",
  description: "Vichar Group - Vichar NEET",
};

export default function Root({ children }) {
  return (
    <>
    {children}
    </>
  );
}