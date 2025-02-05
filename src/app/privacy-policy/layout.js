import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy",
};

export default function Root({ children }) {
  return (
    <div className="bg-black">
    {children}
    </div>
  );
}