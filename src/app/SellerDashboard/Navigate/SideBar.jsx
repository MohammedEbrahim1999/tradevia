"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
// MUI Icons
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import InventoryIcon from "@mui/icons-material/Inventory";
import PeopleIcon from "@mui/icons-material/People";
import BarChartIcon from "@mui/icons-material/BarChart";
import DiscountIcon from "@mui/icons-material/LocalOffer";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from '@mui/icons-material/Add';
import BrandingWatermarkOutlinedIcon from '@mui/icons-material/BrandingWatermarkOutlined';
export default function Sidebar() {
    const [open, setOpen] = useState(false);
    const [seller, setSeller] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const router = useRouter();
    useEffect(() => {
        fetch('http://localhost:5000/loggedUsers')
            .then(res => {
                if (!res.ok) throw new Error(`Fetch error: ${res.status}`)
                return res.json()
            })
            .then(data => setSeller(data))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false))
    }, [])
    const handleLogout = async () => {
        try {
            // Clear all logged users
            const res = await fetch("http://localhost:5000/loggedUsers");
            const users = await res.json();

            // Delete each logged user
            for (const u of users) {
                await fetch(`http://localhost:5000/loggedUsers/${u.id}`, {
                    method: "DELETE",
                });
            }

            router.push("/SellerLogin"); // Redirect
        } catch (err) {
            console.error("Logout failed:", err);
        }
    };

    return (
        <div className="flex h-screen">
            {/* Sidebar */}
            <div
                className={`${open ? "w-64" : "w-20"
                    } bg-gray-900 text-white h-full p-5 transition-all duration-300 border-r border-gray-800`}
            >
                {/* Toggle Button */}
                <div className="flex justify-end mb-5">
                    <button
                        onClick={() => setOpen(!open)}
                        className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700"
                    >
                        <MenuIcon />
                    </button>
                </div>

                {/* User */}
                <div className="flex items-center gap-3 mb-6">
                    <img
                        src="https://i.pravatar.cc/100"
                        alt="avatar"
                        className="w-12 h-12 rounded-full object-cover border border-gray-700"
                    />
                    {open && (
                        <div>
                            <h3 className="font-bold text-lg">{seller[0]?.store}</h3>
                            <p className="text-sm text-gray-400">{seller[0]?.email}</p>
                        </div>
                    )}
                </div>

                {/* Search */}
                <div className="bg-gray-800 flex items-center gap-2 px-3 py-2 rounded-lg mb-6">
                    {open && (
                        <input
                            type="text"
                            placeholder="Search..."
                            className="bg-transparent outline-none text-sm w-full"
                        />
                    )}
                    <SearchIcon className="text-gray-400" fontSize="small" />
                </div>

                {/* Menu */}
                <div className="space-y-1">
                    <SidebarItem icon={<DashboardIcon />} text="Dashboard" open={open} link={"/SellerDashboard"} />
                    <SidebarItem icon={<ShoppingCartIcon />} text="Orders" open={open} link={"/SellerDashboard/Orders"} />
                    <SidebarItem icon={<InventoryIcon />} text="Products" open={open} link={"/SellerDashboard/products"} />
                    <SidebarItem icon={<AddIcon />} text="AddProducts" open={open} link={"/SellerDashboard/AddNewProduct"} />
                    <SidebarItem icon={<BrandingWatermarkOutlinedIcon  />} text="Brands" open={open} link={"/SellerDashboard/Brands"} />
                    <SidebarItem icon={<PeopleIcon />} text="Customers" open={open} link={"/SellerDashboard/Customers"} />
                    <SidebarItem icon={<BarChartIcon />} text="Analytics" open={open} link={"/SellerDashboard/Analytics"} />
                    <SidebarItem icon={<DiscountIcon />} text="Discounts" open={open} link={"/SellerDashboard/Discounts"} />

                    <div className="border-t border-gray-700 my-4"></div>
                    <SidebarItem
                        icon={<LogoutIcon />}
                        text="Logout"
                        open={open}
                        onClick={handleLogout}
                    />
                </div>
            </div>
        </div>
    );
}

function SidebarItem({ icon, text, open, link, onClick }) {
    return (
        <div
            className="p-3 cursor-pointer hover:bg-gray-800 rounded-lg transition-colors"
            onClick={onClick}
        >
            <a href={link} className="flex items-center gap-3">
                <div className="text-gray-300">{icon}</div>
                {open && <span className="text-sm">{text}</span>}
            </a>
        </div>
    );
}
