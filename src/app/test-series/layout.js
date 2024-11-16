import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Vichar Group - Test Series",
  description: "Vichar Group - Test Series",
};

export default function Root({ children }) {
  return (
    <>
    {children}
    </>
  );
}