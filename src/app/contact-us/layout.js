import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Contact Us Vichar Group",
  description: "Contact Us Vichar Group",
};

export default function Root({ children }) {
  return (
    <>
    {children}
    </>
  );
}