import FaqPage from './faqPage';

export const metadata = {
    title: 'Tradevia / Faq Questions',
    description: 'Find answers to the most common questions about Tradevia. Explore helpful information on orders, payments, shipping, returns, and more to ensure a smooth and hassle-free shopping experience.',
    icons:{
        icon: "/icons/faq.svg",
    }
}

const page = () => {
    return <FaqPage />;
};

export default page;