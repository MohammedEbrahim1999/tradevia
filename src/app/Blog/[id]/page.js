// import BlogPosts from './BlogPosts';




// export const metadata = {
//     title: 'Tradevia / Blog Posts Hello',
//     description: 'Manage your shopping cart on Tradevia. Easily review products, adjust quantities, and move to a fast and secure checkout experience.',
//     icons:{
//         icon: "/icons/blog-svg.svg",
//     }
// }

// const page = async ({params}) => {
//     return <BlogPosts />;
// };

// export default page;
import { Suspense } from 'react';
import BlogPosts from './BlogPosts';
import Loading from '../../loading';
// 1. Corrected generateMetadata with awaited params
export async function generateMetadata({ params }) {
  // FIX: Await params before accessing .id
  const { id } = await params;

  try {
    const response = await fetch(`http://localhost:5000/blogPosts/${id}`);
    console.log("Fetched post data for ID:", id, response); // Debug log to verify fetch response
    if (!response.ok) {
      return { title: 'Post Not Found | Tradevia' };
    }

    const post = await response.json();

    return {
      title: `${post.title} | Tradevia`,
      description: post.excerpt?.substring(0, 160) || "Read our latest blog post.",
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
  // Pass the id down to your client or server component if needed
  return (
    <>
      <Suspense fallback={<Loading />}>
        <BlogPosts id={id} />
      </Suspense>
    </>
  );
};

export default page;