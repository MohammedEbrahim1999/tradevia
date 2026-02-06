"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import "./globals.css";

const TopBar = dynamic(() => import("./LayoutComponant/TopBar"));
const MainHeader = dynamic(() => import("./LayoutComponant/MainHeader"));
const Footer = dynamic(() => import("./LayoutComponant/Footer"));
const GoTop = dynamic(() => import("./LayoutComponant/GoTop"));

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isAuthPage = pathname?.toLowerCase().includes("/sellersignup") || pathname?.toLowerCase().includes("/sellerlogin") || pathname?.toLocaleLowerCase().includes("/sellerdashboard") || pathname?.toLocaleLowerCase().includes("/login");
  useEffect(() => {
    const redirect = sessionStorage.getItem("logoutRedirect");

    if (redirect) {
      sessionStorage.removeItem("logoutRedirect");
      window.location.replace(redirect);
    }
  }, []);

  return (
    <html lang="en">
      <head>
        <title>Tradevia</title>
        <link rel="icon" type="image/png" sizes="32x32" href="../../public/TDC.png" />
        <link
          rel="stylesheet"
          type="text/css"
          charSet="UTF-8"
          href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick.min.css"
        />
        <link
          rel="stylesheet"
          type="text/css"
          href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick-theme.min.css"
        />
      </head>
      <body>
        {!isAuthPage && (
          <>
            <TopBar />
            <MainHeader />
          </>
        )}
        {children}
        {!isAuthPage && (
          <>
            <Footer />
          </>
        )}
        <div className="relative">
          <GoTop />
        </div>
      </body>
    </html>
  );
}
