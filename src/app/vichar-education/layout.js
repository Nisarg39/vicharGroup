import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Vichar Group - Vichar Education ",
  description: "Vichar Group - Vichar Education",
};

export default function Root({ children }) {
  return (
    <>
    {children}
    </>
  );
}