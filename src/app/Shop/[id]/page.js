import ProductsDataPage from './ProductsDataPage';

// 1. Corrected generateMetadata with awaited params
export async function generateMetadata({ params }) {
  // FIX: Await params before accessing .id
  const { id } = await params;

  try {
    const response = await fetch(`http://localhost:5000/products/${id}`);
    console.log("Fetched product data for ID:", id, response); // Debug log to verify fetch response
    if (!response.ok) {
      return { title: 'Product Not Found | Tradevia' };
    }

    const post = await response.json();

    return {
      title: `${post.name}`,
      description: post.description?.substring(0, 160) || "Read our latest blog post.",
      icons: {
        icon: "/icons/product.svg",
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
  return <ProductsDataPage id={id} />;
};

export default page;