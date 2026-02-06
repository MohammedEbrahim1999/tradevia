'use client';
import dynamic from "next/dynamic";

const Main = dynamic(() => import("./PageComponant/Main"), { ssr: false });
const Categories = dynamic(() => import("./PageComponant/Categories"), { ssr: false });
const FeaturedProducts = dynamic(() => import("./PageComponant/FeaturedProducts"), { ssr: false });
const WhyChooseUs = dynamic(() => import("./PageComponant/WhyChooseUs"), { ssr: false });
const CTABanner = dynamic(() => import("./PageComponant/CTABanner"), { ssr: false });
const Testimonials = dynamic(() => import("./PageComponant/Testimonials"), { ssr: false });
const Newsletter = dynamic(() => import("./PageComponant/Newsletter"), { ssr: false });
export default function Home() {
  
  return (
    <>
      <Main />
      <Categories />
      <FeaturedProducts />
      <WhyChooseUs />
      <CTABanner />
      <Testimonials />
      <Newsletter />
    </>
  );
}
