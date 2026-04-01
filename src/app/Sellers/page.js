import SellersData from "./SellersData";
export const metadata = {
    title: "TRADEVIA | Sellers ",
    description: 'Discover top-rated sellers on Tradevia, offering a wide range of products with exceptional service and reliability. Shop with confidence from our trusted sellers.',
    icons: {
        icon: "/icons/seller.svg",
    }   
};


export default function CookiesPage() {
    return <SellersData />;
}
