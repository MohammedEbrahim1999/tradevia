"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import "./globals.css";

const TopBar = dynamic(() => import("./LayoutComponant/TopBar"));
const MainHeader = dynamic(() => import("./LayoutComponant/MainHeader"));
const Footer = dynamic(() => import("./LayoutComponant/Footer"));
const GoTop = dynamic(() => import("./LayoutComponant/GoTop"));

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const [isNotFoundPage, setIsNotFoundPage] = useState(false);

  const isAuthPage =
    pathname?.toLowerCase().includes("/sellersignup") ||
    pathname?.toLowerCase().includes("/sellerlogin") ||
    pathname?.toLowerCase().includes("/sellerdashboard") ||
    pathname?.toLowerCase().includes("/login");

  useEffect(() => {
    // detect 404 page safely
    setIsNotFoundPage(document.body.classList.contains("not-found-page"));

    const redirect = sessionStorage.getItem("logoutRedirect");
    if (redirect) {
      sessionStorage.removeItem("logoutRedirect");
      window.location.replace(redirect);
    }
  }, []);

  const hideLayout = isAuthPage || isNotFoundPage;

  return (
    <html lang="en">
      <head>
        <title>Tradevia</title>
        <link rel="icon" href="/TDC.png" />
      </head>
      <body>
        {!hideLayout && (
          <>
            <TopBar />
            <MainHeader />
          </>
        )}

        {children}

        {!hideLayout && <Footer />}

        <div className="relative">
          <GoTop />
        </div>
      </body>
    </html>
  );
}