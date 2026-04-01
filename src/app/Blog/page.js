import { Suspense } from 'react';
import BlogComponent from './BlogComponent';
import Loading from '../loading';

export const metadata = {
    title: 'Tradevia / Blog',
    description: 'Manage your shopping cart on Tradevia. Easily review products, adjust quantities, and move to a fast and secure checkout experience.',
    icons:{
        icon: "/icons/blog-svg.svg",
    }
}

const page = () => {
    return(
        <>
            <Suspense fallback={<Loading />}>
                <BlogComponent />
            </Suspense>
        </>
    ) ;
};

export default page;