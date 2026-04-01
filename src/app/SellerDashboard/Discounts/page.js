import DiscountData from "./DiscountData";

/** * 1. Dynamic Metadata Generation
 * Next.js calls this on the server before rendering the page.
 */
export async function generateMetadata() {
    try {
        // Fetch the logged-in users from your local server
        const response = await fetch("http://localhost:5000/loggedUsers", {
            cache: 'no-store' // Ensure we get the latest login status
        });

        const loggedUsers = await response.json();

        // Find the user who is actually logged in (loginStatus: true)
        const activeUser = loggedUsers.find(user => user.loginStatus === true);

        // Fallback if no user is logged in
        const storeName = activeUser ? activeUser.store : "Seller";

        return {
            title: `${storeName} Dashboard | Coupons & Discounts `,
            description: `Manage your coupons and discounts in your ${storeName} dashboard. Create new promotions, update existing ones, and attract more customers to grow your business on our platform.`,
            icons: {
                icon: "/icons/discounts.svg",
            }
        };
    } catch (error) {
        // Fallback metadata if the server at :5000 is down
        return {
            title: "Tradevia | Seller Dashboard",
            description: "Manage your products and sales",
        };
    }
}

export default function page({ }) {
    return <DiscountData/>;
}