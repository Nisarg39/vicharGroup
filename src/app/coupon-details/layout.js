import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Vouchar Details",
  description: "Vouchar Details",
};

export default function Root({ children }) {
  return (
    <>
    {children}
    </>
  );
}