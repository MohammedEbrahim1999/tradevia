import ReturnPage from './ReturnPage';

export const metadata = {
    title: 'Tradevia / Returns & Exchanges',
    description: 'Easily manage your returns and exchanges with our hassle-free process. Our dedicated support team is here to assist you every step of the way, ensuring a smooth and convenient experience.',
    icons:{
        icon: "/icons/return.svg",
    }
}

const page = () => {
    return <ReturnPage />;
};

export default page;