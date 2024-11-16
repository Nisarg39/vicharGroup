import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Vichar Group - Vichar JEE",
  description: "Vichar Group - Vichar JEE",
};

export default function Root({ children }) {
  return (
    <>
    {children}
    </>
  );
}