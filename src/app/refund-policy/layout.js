import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Privacy Policy - Vichar Group",
  description: "Privacy Policy - Vichar Group",
};

export default function Root({ children }) {
  return (
    <div>
      {children}
    </div>
  );
}