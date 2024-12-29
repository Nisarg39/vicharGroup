import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Login",
  description: "Login",
};

export default function Root({ children }) {
  return (
    <>
    {children}
    </>
  );
}