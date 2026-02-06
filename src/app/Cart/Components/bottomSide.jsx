"use client";

import Link from "next/link";
import SecurityIcon from "@mui/icons-material/Security";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import ReplayIcon from "@mui/icons-material/Replay";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";

export default function BottomSide() {
    return (
        <div className=" border-gray-200 rounded-xl bg-white p-6">

            {/* Top Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">

                <Link
                    href="/shop"
                    className="text-sky-500 font-semibold hover:underline"
                >
                    ← Continue Shopping
                </Link>

                <p className="text-sm text-gray-500 text-center sm:text-right">
                    Need help?{" "}
                    <a href='/Contact' className="text-sky-500 font-medium cursor-pointer hover:underline">
                        Contact Support
                    </a>
                </p>
            </div>

            <hr className="mb-6" />

            {/* Trust & Benefits */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">

                <div className="flex flex-col items-center gap-2">
                    <LocalShippingIcon className="text-sky-500" />
                    <p className="text-sm font-medium text-gray-800">
                        Free Shipping
                    </p>
                    <span className="text-xs text-gray-500">
                        On all orders
                    </span>
                </div>

                <div className="flex flex-col items-center gap-2">
                    <ReplayIcon className="text-sky-500" />
                    <p className="text-sm font-medium text-gray-800">
                        Easy Returns
                    </p>
                    <span className="text-xs text-gray-500">
                        30-day policy
                    </span>
                </div>

                <div className="flex flex-col items-center gap-2">
                    <SecurityIcon className="text-sky-500" />
                    <p className="text-sm font-medium text-gray-800">
                        Secure Payment
                    </p>
                    <span className="text-xs text-gray-500">
                        SSL protected
                    </span>
                </div>

                <div className="flex flex-col items-center gap-2">
                    <SupportAgentIcon className="text-sky-500" />
                    <p className="text-sm font-medium text-gray-800">
                        24/7 Support
                    </p>
                    <span className="text-xs text-gray-500">
                        Always available
                    </span>
                </div>
            </div>
        </div>
    );
}
