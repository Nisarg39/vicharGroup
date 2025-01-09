import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Jee Test Series",
  description: "Jee Test Series",
};

export default function Root({ children }) {
  return (
    <>
    {children}
    </>
  );
}