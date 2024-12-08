import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Vichar Group - Vichar Gallery",
  description: "Vichar Group - Vichar Gallery",
};

export default function Root({ children }) {
  return (
    <>
    {children}
    </>
  );
}