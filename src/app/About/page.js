import { Suspense } from 'react';
import AboutComponent from './AboutComponent';
import Loading from '../loading';

export const metadata = {
    title: 'Tradevia / About Us',
    description: 'Manage your shopping cart on Tradevia. Easily review products, adjust quantities, and move to a fast and secure checkout experience.',
    icons: {
        icon: "/icons/about-svg.svg",
    }
}

const ComponentName = () => {
    return (
        <>
            <Suspense fallback={<Loading />}>
                <AboutComponent />
            </Suspense>
        </>
    )
};

export default ComponentName;