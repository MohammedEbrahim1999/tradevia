// import SellerPage from "./SellerPage";
// export const metadata = {
//     title: "Seller |  ",
//     description: 'Learn how Tradevia uses cookies to enhance your browsing experience. Discover how we collect, use, and manage cookies to improve functionality, personalize content, and ensure a secure and seamless shopping journey.',
//     icons: {
//         icon: "/icons/seller.svg",
//     }   
// };


// export default function CookiesPage() {
//     return <SellerPage />;
// }
import SellerPage from './SellerPage';

// 1. Corrected generateMetadata with awaited params
export async function generateMetadata({ params }) {
  // FIX: Await params before accessing .id
  const { id } = await params;

  try {
    const response = await fetch(`http://localhost:5000/sellers/${id}`);
    console.log("Fetched post data for ID:", id, response); // Debug log to verify fetch response
    if (!response.ok) {
      return { title: 'Post Not Found | Tradevia' };
    }

    const post = await response.json();

    return {
      title: `${post.name} | Tradevia`,
      description: `Discover ${post.name} on Tradevia, offering a wide range of products with exceptional service and reliability. Shop with confidence from our trusted sellers.`,
      icons: {
        icon: post.icons,
      }
    };
  } catch (error) {
    return { title: 'Tradevia Blog' };
  }
}

// 2. Corrected Page component with awaited params
const page = async ({ params }) => {
  // FIX: Await params here as well
  const { id } = await params;
  console.log("Received ID in page component:", id); // Debug log to verify ID is received
  // Pass the id down to your client or server component if needed
  return <SellerPage id={id} />;
};

export default page;