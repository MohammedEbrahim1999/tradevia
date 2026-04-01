import CartPage from './CartPage';

export const metadata = {
    title: 'Tradevia / Cart',
    description: 'Manage your shopping cart on Tradevia. Easily review products, adjust quantities, and move to a fast and secure checkout experience.',
    icons:{
        icon: "/icons/cart-shopping.svg",
    }
}

const ComponentName = () => {
    return <CartPage />;
};

export default ComponentName;