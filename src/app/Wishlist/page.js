import React from 'react'
import WishlistPage from './Components/WishlistPage';
export const metadata = {
    title: "TRADEVIA | Wishlist",
    description: 'Discover your personalized wishlist on TRADEVIA, where you can save and manage your favorite products for easy access and future purchases. Create your wishlist today and never miss out on the items you love!',
    icons: {
        icon: "/icons/wishlist 000.svg",
    }   
};

const page = () => {
    return (
        <>
            {/* Wishlist Page */}
            <WishlistPage />
        </>
    )
}

export default page
