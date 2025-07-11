import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Teacher Portal",
  description: "Teacher Portal",
};

export default function Root({ children }) {
  return (
    <>
    {children}
    </>
  );
}