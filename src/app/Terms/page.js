import TermsClient from "./Components/TermsClient";

export const metadata = {
    title: "TRADEVIA | Terms of Service",
    description: 'Read our terms of service to understand the rules and guidelines for using the TRADEVIA platform. By accessing or using our services, you agree to be bound by these terms and conditions. We encourage you to review them carefully to ensure a safe and enjoyable shopping experience. If you have any questions or concerns about our terms, please contact our support team for assistance.',
    icons: {
        icon: "/icons/term.svg",
    }   
};

export default function Page() {
    return <TermsClient />;
}
