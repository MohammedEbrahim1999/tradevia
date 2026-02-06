"use client";

import { useEffect, useState } from "react";
import PeopleIcon from "@mui/icons-material/People";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import InventoryIcon from "@mui/icons-material/Inventory";
import AssignmentIcon from "@mui/icons-material/Assignment";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, PieChart, Pie, Cell, Legend } from "recharts";

const AnalyticsPage = () => {
    // Example data
    const [stats, setStats] = useState({
        totalCustomers: 320,
        totalOrders: 150,
        totalRevenue: 12500,
        growth: 12, // %
        pendingOrders: 25,
        deliveredOrders: 100,
        cancelledOrders: 25,
    });

    const lineData = [
        { name: "Jan", revenue: 400 },
        { name: "Feb", revenue: 800 },
        { name: "Mar", revenue: 700 },
        { name: "Apr", revenue: 1000 },
        { name: "May", revenue: 900 },
        { name: "Jun", revenue: 1200 },
    ];

    const barData = [
        { name: "Iphone 17 Pro Max", sales: 40 },
        { name: "Samsung Galaxy X", sales: 30 },
        { name: "Macbook Pro 2025", sales: 25 },
        { name: "Dell Inspiron", sales: 20 },
    ];

    const pieData = [
        { name: "Pending", value: stats.pendingOrders, color: "#facc15" },
        { name: "Delivered", value: stats.deliveredOrders, color: "#10b981" },
        { name: "Cancelled", value: stats.cancelledOrders, color: "#ef4444" },
    ];

    const COLORS = pieData.map(d => d.color);

    return (
        <div className="p-6 bg-gray-900 min-h-screen">
            <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>

            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-gray-800 border border-gray-700 p-4 rounded-2xl flex items-center justify-between shadow-lg">
                    <div>
                        <p className="text-gray-400 text-sm">Total Customers</p>
                        <p className="text-xl font-bold">{stats.totalCustomers}</p>
                    </div>
                    <PeopleIcon className="text-blue-500" fontSize="large" />
                </div>

                <div className="bg-gray-800 border border-gray-700 p-4 rounded-2xl flex items-center justify-between shadow-lg">
                    <div>
                        <p className="text-gray-400 text-sm">Total Orders</p>
                        <p className="text-xl font-bold">{stats.totalOrders}</p>
                    </div>
                    <ShoppingBagIcon className="text-green-500" fontSize="large" />
                </div>

                <div className="bg-gray-800 border border-gray-700 p-4 rounded-2xl flex items-center justify-between shadow-lg">
                    <div>
                        <p className="text-gray-400 text-sm">Total Revenue</p>
                        <p className="text-xl font-bold">SAR {stats.totalRevenue}</p>
                    </div>
                    <AccountBalanceWalletIcon className="text-yellow-500" fontSize="large" />
                </div>

                <div className="bg-gray-800 border border-gray-700 p-4 rounded-2xl flex items-center justify-between shadow-lg">
                    <div>
                        <p className="text-gray-400 text-sm">Growth</p>
                        <p className="text-xl font-bold flex items-center gap-1">
                            {stats.growth}% <TrendingUpIcon className="text-green-500" fontSize="small" />
                        </p>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Revenue Line Chart */}
                <div className="bg-gray-800 border border-gray-700 p-6 rounded-2xl shadow-lg">
                    <h2 className="text-xl font-semibold mb-4">Revenue Over Time</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={lineData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={3} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Top Selling Products Bar Chart */}
                <div className="bg-gray-800 border border-gray-700 p-6 rounded-2xl shadow-lg">
                    <h2 className="text-xl font-semibold mb-4">Top Selling Products</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={barData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="sales" fill="#10b981" radius={[5, 5, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Orders by Status Pie Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-800 border border-gray-700 p-6 rounded-2xl shadow-lg">
                    <h2 className="text-xl font-semibold mb-4">Orders by Status</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                                ))}
                            </Pie>
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Revenue vs Target */}
                <div className="bg-gray-800 border border-gray-700 p-6 rounded-2xl shadow-lg flex flex-col justify-center items-center">
                    <h2 className="text-xl font-semibold mb-4">Revenue vs Target</h2>
                    <p className="text-gray-400 mb-2">Target: SAR 15,000</p>
                    <div className="w-full bg-gray-700 rounded-full h-6">
                        <div
                            className="bg-green-500 h-6 rounded-full"
                            style={{ width: `${(stats.totalRevenue / 15000) * 100}%` }}
                        ></div>
                    </div>
                    <p className="text-gray-300 mt-2">{((stats.totalRevenue / 15000) * 100).toFixed(1)}% achieved</p>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsPage;
