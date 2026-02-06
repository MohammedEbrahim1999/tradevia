"use client";
import { useState,useEffect } from "react";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import MenuIcon from "@mui/icons-material/Menu";
export default function Header({ toggleSidebar }) {
       const [seller, setSeller] = useState([])
        const [loading, setLoading] = useState(true)
        const [error, setError] = useState(null)
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
    return (
        <header className="h-16 hidden md:flex shadow-md px-6 items-center justify-between border-b border-gray-200">

            {/* Left Section */}
            <div className="flex items-center gap-4">
                {/* Sidebar Toggle (visible in mobile) */}
                <button
                    onClick={toggleSidebar}
                    className="lg:hidden block p-2 rounded-md bg-gray-100 hover:bg-gray-200"
                >
                    <MenuIcon />
                </button>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-6">
                <button className="relative">
                    <NotificationsNoneIcon className="text-gray-700 hover:text-black" />
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">
                        3
                    </span>
                </button>

                <button>
                    <ChatBubbleOutlineIcon className="text-gray-700 hover:text-black" />
                </button>

                {/* Profile */}
                <div className="flex items-center gap-2 cursor-pointer hover:bg-red-100 hover:text-black p-2 rounded-lg transition">
                    <AccountCircleIcon fontSize="large" className="text-gray-700" />
                    <div className="hidden md:block">
                        <p className="text-sm font-semibold">{seller[0]?.store}</p>
                        <p className="text-xs text-gray-500">Admin Panel</p>
                    </div>
                    <ArrowDropDownIcon />
                </div>
            </div>
        </header>
    );
}
