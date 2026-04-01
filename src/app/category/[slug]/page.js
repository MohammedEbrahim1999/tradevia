import CatContent from './catContent';
import { notFound } from 'next/navigation';

// 1. generateMetadata
export async function generateMetadata({ params }) {
    const { slug } = await params;

    try {
        // Fetch all categories to find the one matching the URL slug
        const response = await fetch(`http://localhost:5000/categories`, {
            next: { revalidate: 3600 } // Cache for 1 hour
        });

        if (!response.ok) return { title: 'Tradevia Store' };

        const categories = await response.json();

        // Match the slug from the URL to the 'link' property in your JSON
        const category = categories.find(cat => cat.link === `/category/${slug}`);

        if (!category) {
            return { title: 'Category Not Found | Tradevia' };
        }

        return {
            title: `Tradevia | ${category.title} `,
            description: `Browse our premium selection of ${category.title} at Tradevia.`,
            icons: [{ rel: 'icon', url: category.icon }],
            openGraph: {
                title: category.title,
                images: [{ url: category.image }],
            },
        };
    } catch (error) {
        return { title: 'Tradevia Blog' };
    }
}

// 2. Page Component
const Page = async ({ params }) => {
    const { slug } = await params;

    // Fetch data to get the ID associated with this slug
    const response = await fetch(`http://localhost:5000/categories`);
    const categories = await response.json();
    const category = categories.find(cat => cat.link === `/category/${slug}`);

    // If the category doesn't exist in your JSON, show 404
    if (!category) {
        notFound();
    }

    // Pass the actual database ID (e.g., "e476") to your content component
    return <CatContent id={category.id} />;
};

export default Page;