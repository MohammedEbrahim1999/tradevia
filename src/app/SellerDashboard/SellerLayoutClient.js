"use client";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
const Sidebar = dynamic(() => import("./Navigate/SideBar"), { ssr: false });
const Header = dynamic(() => import("./Navigate/Header"), { ssr: false });
export default function SellerLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const router = useRouter();
    useEffect(() => {
        fetch("http://localhost:5000/loggedUsers")
            .then(res => res.json())
            .then(data => {

                if (data.length === 0) {
                    router.push("/SellerLogin"); // ❌ Not logged → redirect
                }
            });
    }, []);

    return (
        <div className="flex bg-gray-900 text-white">
            <div className="flex gap-3 flex-row w-full">
                <Sidebar />
                <div className="flex gap-3 w-full flex-col">
                    <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
                    <main className="">{children}</main>
                </div>
            </div>
        </div>
    );
}
