export function Icon({ name }) {
    const common = "h-5 w-5 text-gray-700";
    switch (name) {
        case "box":
            return (
                <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M21 8.5l-9 5-9-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    <path
                        d="M3.5 7.5L12 3l8.5 4.5V17a2 2 0 0 1-1 1.73L12 23l-7.5-4.27A2 2 0 0 1 3.5 17V7.5Z"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinejoin="round"
                    />
                    <path d="M12 13.5V23" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
            );

        case "truck":
            return (
                <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M3 7h11v10H3V7Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                    <path d="M14 10h4l3 3v4h-7v-7Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                    <path d="M7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M18 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" stroke="currentColor" strokeWidth="1.6" />
                </svg>
            );

        case "return":
            return (
                <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M9 10H4V5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    <path
                        d="M4 10c2.2-4.4 7-6.6 11.7-5.1C19.6 6.3 22 9.8 22 14c0 5-4 9-9 9"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                    />
                </svg>
            );

        case "shield":
            return (
                <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                        d="M12 2l8 4v6c0 5-3.4 9.4-8 10-4.6-.6-8-5-8-10V6l8-4Z"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinejoin="round"
                    />
                    <path d="M9 12l2 2 4-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            );

        case "spark":
            return (
                <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M12 2l1.3 5.2L18 9l-4.7 1.8L12 16l-1.3-5.2L6 9l4.7-1.8L12 2Z" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M5 14l.8 3.2L9 18l-3.2.8L5 22l-.8-3.2L1 18l3.2-.8L5 14Z" stroke="currentColor" strokeWidth="1.6" />
                </svg>
            );

        default:
            return (
                <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M12 7v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    <path d="M12 16.5h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
            );
    }
}
