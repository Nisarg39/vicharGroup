import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "College Teacher Portal",
  description: "College Teacher Portal",
};

export default function Root({ children }) {
  return (
    <>
    {children}
    </>
  );
}