import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Vichar Group - Vichar Foundation",
  description: "Vichar Group - Vichar Foundation",
};

export default function Root({ children }) {
  return (
    <>
    {children}
    </>
  );
}