import TrackData from "./TrackData";

export const metadata = {
    title: "TRADEVIA | Track Your Order",
    description: 'Track your order on TRADEVIA with ease. Stay updated on the status of your purchases, from processing to delivery. Use our order tracking feature to know exactly when your items will arrive and enjoy a seamless shopping experience.',
    icons: {
        icon: "/icons/track .svg",
    }   
};

export default function Page() {
    return <TrackData />;
}
