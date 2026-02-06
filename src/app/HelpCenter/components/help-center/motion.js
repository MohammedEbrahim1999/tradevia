export const EASE = [0.16, 1, 0.3, 1];

export const fadeUp = {
    hidden: { opacity: 0, y: 10 },
    show: (d = 0) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: EASE, delay: d },
    }),
};

export const scaleIn = {
    hidden: { opacity: 0, scale: 0.985, y: 8 },
    show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.25, ease: EASE } },
    exit: { opacity: 0, scale: 0.985, y: 8, transition: { duration: 0.18, ease: EASE } },
};
