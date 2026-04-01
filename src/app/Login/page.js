import LoginPage from './LoginPage';

export const metadata = {
    title: 'Tradevia / Login ',
    description: 'Access your Tradevia account securely. Sign in to manage your orders, track shipments, save favorites, and enjoy a faster, more personalized shopping experience.',
    icons:{
        icon: "/icons/login 11.svg",
    }
}

const ComponentName = () => {
    return <LoginPage />;
};

export default ComponentName;