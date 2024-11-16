import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Vichar Group - Vichar MHT-CET",
  description: "Vichar Group - Vichar MHT-CET",
};

export default function Root({ children }) {
  return (
    <>
    {children}
    </>
  );
}