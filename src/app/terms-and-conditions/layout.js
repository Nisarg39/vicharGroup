import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Terms and Conditions",
  description: "Terms and Conditions",
};

export default function Root({ children }) {
  return (
    <div>
      {children}
    </div>
  );
}