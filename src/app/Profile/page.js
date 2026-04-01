
// import ProfileVerticalTabs from "./components/ProfileVerticalTabs";



// export const metadata = {
//     title: 'Tradevia / Profile',
//     description: 'Manage your shopping cart on Tradevia. Easily review products, adjust quantities, and move to a fast and secure checkout experience.',
//     icons:{
//         icon: "/icons/profile.svg",
//     }
// }
// export default function ProfilePage() {
//     return (
//         <div className="min-h-screen bg-[url(/imgs/11.jpg)] py-10 px-4">
//             {/* <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow p-6 "> */}
//                 <ProfileVerticalTabs />
//             {/* </div> */}
//         </div>
//     );
// }
import ProfileVerticalTabs from "./components/ProfileVerticalTabs";

export async function generateMetadata() {
    try {
        // 1. Fetch both endpoints at the same time
        const [loggedRes, customersRes] = await Promise.all([
            fetch("http://localhost:5000/loggedCustomers"),
            fetch("http://localhost:5000/customers")
        ]);

        const loggedCustomers = await loggedRes.json();
        const customers = await customersRes.json();

        // 2. Get the ID of the first logged-in user
        const loggedId = loggedCustomers?.[0]?.id;

        // 3. Find that user in the customers list
        const user = customers.find(c => c.id === loggedId);

        return {
            title: user ? `${user.name}` : 'Tradevia / Profile',
            description:  `Manage your profile and preferences on Tradevia, ${user.name}. Update your information, view your order history, and customize your shopping experience with ease.`, 
            icons: {
                icon: "/icons/profile.svg",
            }
        };
    } catch (error) {
        // Fallback if the server is down
        return {
            title: 'Tradevia / Profile',
        };
    }
}

export default function ProfilePage() {
    return (
        <div className="min-h-screen bg-[url(/imgs/11.jpg)] py-10 px-4">
            <ProfileVerticalTabs />
        </div>
    );
}