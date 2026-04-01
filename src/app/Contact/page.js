import ContactPage from './ContactPage';

export const metadata = {
    title: 'Tradevia / Contact Us',
    description: 'Manage your shopping cart on Tradevia. Easily review products, adjust quantities, and move to a fast and secure checkout experience.',
    icons: {
        icon: "/icons/contact-us.svg",
    }
}

const page = () => {
    return <ContactPage />;
};

export default page;