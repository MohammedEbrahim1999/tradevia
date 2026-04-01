import HelpCenterClient from "./HelpCenterClient";

export const metadata = {
    title: "TRADEVIA | Help Center ",
    description: 'Visit the Tradevia Help Center to get support and guidance whenever you need it. Browse articles, troubleshooting tips, and resources to resolve issues quickly and make the most of your shopping experience.',
    icons: {
        icon: "/icons/help.svg",
    }
};

export default function HelpCenterPage() {
    return <HelpCenterClient />;
}
