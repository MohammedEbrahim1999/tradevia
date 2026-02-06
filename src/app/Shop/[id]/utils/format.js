export const safeNumber = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
};

export const formatSAR = (n) =>
    safeNumber(n).toLocaleString("en-US", { maximumFractionDigits: 0 }) + " SAR";
