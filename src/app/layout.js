import { Inter } from "next/font/google";
import "./globals.css";
import { ReduxProvider } from "./redux-provider";
import Navbar from "../../components/home/Navbar"
import Script from "next/script";
const inter = Inter({ subsets: ["latin"] });
import Footer from "../../components/home/Footer";
import VicharApp from "../../components/home/VicharApp";
import { Analytics } from "@vercel/analytics/react"
export const metadata = {
  title: "Vichar Group - Official Homepage",
  description: "Best Online Learning Platform for competitive exams like JEE, NEET,MHT-CET and Foundation.",
  other: {
    // 'fast2sms': 'qVKm62QLJgPIrbtC6IHWatGyxCZwX5pM'
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* Google Tag Manager */}
      <Script 
        id="gtm-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-5LHN5XWP');
          `,
        }}
      />
      <body className={inter.className}>

        {/* Google Tag Manager (noscript) */}
        <iframe src="https://www.googletagmanager.com/ns.html?id=GTM-5LHN5XWP"
          height="0" width="0" style={{ display: 'none', visibility: 'hidden' }}>   
        </iframe>

        <ReduxProvider>
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000 }}>
          
            <Navbar />
          </div>
          <div style={{ paddingTop: 'navbarHeight', marginTop: 'navbarHeight' }}>
            {children}
            <Analytics />
          </div>
          <VicharApp />
          <Footer />
        </ReduxProvider>
      </body>
    </html>
  );
}
