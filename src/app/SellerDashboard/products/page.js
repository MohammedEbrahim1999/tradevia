import ProductsPage from "./ProductsPage";

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
            title: `${storeName} Dashboard | Products `,
            description: `Manage your products in your ${storeName} dashboard. Add new products, update existing ones, and track inventory to grow your business on our platform.`,
            icons: {
                icon: "/icons/products 11.svg",
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
    return <ProductsPage/>;
}