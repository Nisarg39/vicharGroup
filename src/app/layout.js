import { Inter } from "next/font/google";
import "./globals.css";
import { ReduxProvider } from "./redux-provider";
import Navbar from "../../components/home/Navbar"
import Script from "next/script";
const inter = Inter({ subsets: ["latin"] });
import Footer from "../../components/home/Footer";
import VicharApp from "../../components/home/VicharApp";
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Toaster } from "react-hot-toast";
export const metadata = {
  title: "Vichar Group - Official Homepage",
  description: "Best Online Learning Platform for competitive exams like JEE, NEET,MHT-CET and Foundation.",
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
          `
        }}
      />
      
      {/* PROGRESSIVE COMPUTATION: Service Worker Registration */}
      <Script 
        id="progressive-scoring-sw"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw-progressive-scoring.js')
                  .then(function(registration) {
                    console.log('✅ Progressive Scoring Service Worker registered:', registration.scope);
                  })
                  .catch(function(error) {
                    console.warn('⚠️ Progressive Scoring Service Worker registration failed:', error);
                  });
              });
            } else {
              console.warn('⚠️ Service Worker not supported - progressive computation will fallback to server');
            }
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
            <SpeedInsights />
          </div>
          <VicharApp />
          <Footer />
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: 'white',
                color: '#fff',
                padding: '16px',
                borderRadius: '10px',
                marginTop: '40px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1)',
                transform: 'translateY(0) scale(1)',
                transition: 'all 0.2s ease-in-out',
                fontSize: '14px'
              },
              success: {
                style: {
                  background: '#1d77bc',
                  border: '1px solid rgba(255,255,255,0.1)',
                },
              },
              error: {
                style: {
                  background: '#ef4444',
                  border: '1px solid rgba(255,255,255,0.1)',
                },
              }
            }}
          />
        </ReduxProvider>
      </body>
    </html>
  );
}
