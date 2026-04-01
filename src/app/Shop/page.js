import { Suspense } from "react";
import ShopData from "./ShopData";

export const metadata = {
    title: "TRADEVIA | Shop ",
    description: 'Learn about TRADEVIA\'s shipping policies, delivery options, and estimated delivery times. We are committed to providing a seamless and reliable shipping experience for our customers. Find out how we handle shipping, including international orders, tracking information, and any associated fees. Shop with confidence knowing that your purchases will be delivered safely and on time.',
    icons: {
        icon: "/icons/shop.svg",
    }
};


export default function CookiesPage() {
    return (
        <>
            <ShopData />
        </>
    );
}