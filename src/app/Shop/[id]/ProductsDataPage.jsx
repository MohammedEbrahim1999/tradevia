"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Box, Container, Paper, Stack, Skeleton, Alert, Button, Tooltip, IconButton, CircularProgress, Typography, Link as MLink,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import { Snackbar } from "@mui/material";
import ProductHero from "./components/ProductHero";
import ProductGallery from "./components/ProductGallary";
import ProductHighlights from "./components/ProductHighlights";
import ProductCheckout from "./components/ProductCheckout";
import ProductInfoCard from "./components/ProductInfoCard";
import ProductDetailsAccordions from "./components/ProductDetailsAccordions";
import ReviewsSection from "./components/ReviewsSection";
import ZoomDialog from "./components/ZoomDialog";
import MobileCTA from "./components/MobileCTA";
import useProductData from "./hooks/useProductData";
import useUserData from "./hooks/useUserData";
import useWishlist from "./hooks/useWishlist";
import useCart from "./hooks/useCart";
import { safeNumber, formatSAR } from "./utils/format";
import Loading from "@/app/loading";
export default function ProductPage() {
    const { id } = useParams();
    const router = useRouter();
    const theme = useTheme();
    const API_TOTALPRICE = "http://localhost:5000/totalPrice";
    const API_PRODUCTS = "http://localhost:5000/products";
    const API_LOGGED = "http://localhost:5000/loggedCustomers";
    const API_WISHLIST = "http://localhost:5000/wishList";
    const API_CART = "http://localhost:5000/cart";
    const heroBg = useMemo(
        () => `
      linear-gradient(180deg,
        ${alpha(theme.palette.common.white, 1)} 0%,
        ${alpha(theme.palette.grey[50], 1)} 100%
      )
    `,
        [theme]
    );
    const softOutline = useMemo(() => alpha(theme.palette.common.black, 0.08), [theme]);
    const surface = useMemo(
        () => ({
            borderRadius: 6,
            border: "1px solid",
            borderColor: softOutline,
            bgcolor: theme.palette.common.white,
            boxShadow: "none",
        }),
        [theme, softOutline]
    );
    const pill = useMemo(
        () => ({
            borderRadius: 99,
            fontWeight: 800,
            borderColor: alpha(theme.palette.common.black, 0.12),
            bgcolor: "transparent",
        }),
        [theme]
    );
    const iconBtnGlass = useMemo(
        () => ({
            border: "1px solid",
            borderColor: softOutline,
            bgcolor: theme.palette.common.white,
            "&:hover": { transform: "translateY(-1px)" },
            transition: "all .16s ease",
        }),
        [softOutline, theme]
    );
    const ctaPrimary = useMemo(
        () => ({
            py: 1.4,
            fontWeight: 900,
            borderRadius: 3.2,
            textTransform: "none",
            bgcolor: theme.palette.common.black,
            color: "common.white",
            boxShadow: "none",
            "&:hover": { bgcolor: alpha(theme.palette.common.black, 0.85) },
        }),
        [theme]
    );
    const [snack, setSnack] = useState({ open: false, msg: "" });
    const closeSnack = useCallback(() => setSnack({ open: false, msg: "" }), []);
    const {
        product,
        loading,
        error,
        refreshing,
        fetchProducts,
        galleryImages,
        specsEntries,
        derived,
    } = useProductData({
        id,
        API_PRODUCTS,
    });
    const { loggedCustomers, totalPrice } = useUserData({
        API_TOTALPRICE,
        API_LOGGED,
    });
    const { isFav, toggleFavorite } = useWishlist({
        product,
        loggedCustomers,
        API_WISHLIST,
        setSnack,
    });
    const {
        qty,
        setQty,
        clampQty,
        maxQty,
        handleAddToCart,
    } = useCart({
        id,
        product,
        loggedCustomers,
        API_CART,
        API_TOTALPRICE,
        setSnack,
        stock: derived.stock,
        hasStock: derived.hasStock,
    });
    const [openZoom, setOpenZoom] = useState(false);
    const [activeImg, setActiveImg] = useState(0);
    const [imgError, setImgError] = useState(false);
    useEffect(() => {
        setActiveImg(0);
        setImgError(false);
    }, [id, galleryImages?.length]);
    const imageSrc =
        !imgError && galleryImages?.[activeImg]
            ? galleryImages[activeImg]
            : "https://via.placeholder.com/1400x1000?text=No+Image";
    const handleThumbClick = useCallback((idx) => {
        setActiveImg(idx);
        setImgError(false);
    }, []);
    const handleShare = useCallback(async () => {
        try {
            const url = typeof window !== "undefined" ? window.location.href : "";
            if (navigator.share) {
                await navigator.share({ title: derived.title, text: derived.title, url });
                setSnack({ open: true, msg: "Shared!" });
            } else {
                await navigator.clipboard.writeText(url);
                setSnack({ open: true, msg: "Link copied" });
            }
        } catch { }
    }, [derived.title]);
    const reviews = useMemo(() => {
        const base = [
            { name: "A. Khalid", rate: 5, text: "Premium quality and fast delivery. Exactly as described." },
            { name: "M. Sara", rate: 4.5, text: "Great value for money. Packaging was excellent." },
            { name: "N. Omar", rate: 4, text: "Nice product, wish there were more color options." },
            { name: "F. Lina", rate: 4.5, text: "Smooth experience. Would buy again." },
        ];
        return derived.rating > 0 ? base : base.slice(0, 2);
    }, [derived.rating]);
    if (loading) {
        return (
            <>
                <Loading />
            </>
        );
    }
    if (error) {
        return (
            <Container sx={{ py: 8 }}>
                <Paper sx={{ p: { xs: 3, md: 4 }, borderRadius: 4, border: "1px solid", borderColor: "divider", boxShadow: "none" }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                        <Typography variant="h6" fontWeight={900}>Couldn’t load product</Typography>
                        <Tooltip title="Back">
                            <IconButton onClick={() => router.back()} aria-label="Back">
                                <ArrowBackRoundedIcon />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                    <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                        <Button
                            variant="contained"
                            onClick={() => fetchProducts(true)}
                            disabled={refreshing}
                            startIcon={refreshing ? <CircularProgress size={18} /> : <RefreshRoundedIcon />}
                            sx={{
                                textTransform: "none",
                                borderRadius: 3,
                                fontWeight: 900,
                                bgcolor: theme.palette.common.black,
                                "&:hover": { bgcolor: alpha(theme.palette.common.black, 0.85) },
                                boxShadow: "none",
                            }}
                        >
                            {refreshing ? "Retrying..." : "Retry"}
                        </Button>
                        <Button variant="outlined" onClick={() => router.back()} sx={{ textTransform: "none", borderRadius: 3, fontWeight: 900 }}>
                            Go back
                        </Button>
                    </Stack>
                </Paper>
            </Container>
        );
    }
    if (!product) {
        return (
            <Container sx={{ py: 10 }}>
                <Paper sx={{ p: { xs: 3, md: 4 }, borderRadius: 4, border: "1px solid", borderColor: "divider", boxShadow: "none" }}>
                    <Stack spacing={1}>
                        <Typography variant="h6" fontWeight={900}>Product not found</Typography>
                        <Typography color="text.secondary">The product may have been removed, or the link is incorrect.</Typography>
                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} sx={{ pt: 2 }}>
                            <Button variant="outlined" onClick={() => router.back()} startIcon={<ArrowBackRoundedIcon />} sx={{ textTransform: "none", borderRadius: 3, fontWeight: 900 }}>
                                Back
                            </Button>
                            <Button
                                variant="contained"
                                onClick={() => router.push("/")}
                                sx={{
                                    textTransform: "none",
                                    borderRadius: 3,
                                    fontWeight: 900,
                                    bgcolor: theme.palette.common.black,
                                    "&:hover": { bgcolor: alpha(theme.palette.common.black, 0.85) },
                                    boxShadow: "none",
                                }}
                            >
                                Go Home
                            </Button>
                        </Stack>
                    </Stack>
                </Paper>
            </Container>
        );
    }
    return (
        <Box sx={{ minHeight: "100vh", bgcolor: alpha(theme.palette.grey[50], 0.9), pb: { xs: 11, md: 10 } }}>
            <ProductHero
                router={router}
                title={derived.title}
                category={derived.category}
                brand={derived.brand}
                type={derived.type}
                slug={derived.slug}
                sku={derived.sku}
                rating={derived.rating}
                reviewCount={derived.reviewCount}
                hasStock={derived.hasStock}
                inStock={derived.inStock}
                stock={derived.stock}
                isOnSale={derived.isOnSale}
                discount={derived.discount}
                pill={pill}
                iconBtnGlass={iconBtnGlass}
                heroBg={heroBg}
                softOutline={softOutline}
                isFav={isFav}
                onToggleFav={toggleFavorite}
                onShare={handleShare}
                onRefresh={() => fetchProducts(true)}
                refreshing={refreshing}
            />
            <Container sx={{ mt: { xs: 2.2, md: 3 }, pb: 8 }}>
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", md: "1.15fr 0.85fr" },
                        gap: { xs: 2, md: 2.2 },
                        alignItems: "start",
                    }}
                >
                    <Stack spacing={2.2}>
                        <ProductGallery
                            title={derived.title}
                            galleryImages={galleryImages}
                            activeImg={activeImg}
                            onThumbClick={handleThumbClick}
                            imageSrc={imageSrc}
                            onImgError={() => setImgError(true)}
                            onOpenZoom={() => setOpenZoom(true)}
                            releaseDate={derived.releaseDate}
                            isOnSale={derived.isOnSale}
                            pill={pill}
                            softOutline={softOutline}
                            surface={surface}
                        />
                        <ProductHighlights
                            rating={derived.rating}
                            pill={pill}
                            softOutline={softOutline}
                            surface={surface}
                        />
                    </Stack>
                    <Stack spacing={2.2} sx={{ position: { md: "sticky" }, top: { md: 16 }, alignSelf: "start" }}>
                        <ProductCheckout
                            product={product}
                            hasStock={derived.hasStock}
                            inStock={derived.inStock}
                            stock={derived.stock}
                            isOnSale={derived.isOnSale}
                            discount={derived.discount}
                            saving={derived.saving}
                            price={derived.price}
                            salePrice={derived.salePrice}
                            qty={qty}
                            setQty={setQty}
                            clampQty={clampQty}
                            maxQty={maxQty}
                            total={derived.unitPrice * qty}
                            formatSAR={formatSAR}
                            softOutline={softOutline}
                            surface={surface}
                            pill={pill}
                            ctaPrimary={ctaPrimary}
                            onAddToCart={() => handleAddToCart(product)}
                            isFav={isFav}
                            onToggleFav={toggleFavorite}
                            onShare={handleShare}
                        />
                        <ProductInfoCard
                            sku={derived.sku}
                            category={derived.category}
                            brand={derived.brand}
                            pill={pill}
                            surface={surface}
                        />
                    </Stack>
                </Box>
                <Stack spacing={2.2} sx={{ mt: 2.2 }}>
                    <ProductDetailsAccordions
                        description={derived.description}
                        productId={product.id}
                        hasStock={derived.hasStock}
                        stock={derived.stock}
                        sku={derived.sku}
                        category={derived.category}
                        specsEntries={specsEntries}
                        softOutline={softOutline}
                        surface={surface}
                    />
                    <ReviewsSection reviews={reviews} rating={derived.rating} softOutline={softOutline} pill={pill} />
                </Stack>
                <ZoomDialog open={openZoom} onClose={() => setOpenZoom(false)} title={derived.title} imageSrc={imageSrc} 
                softOutline={softOutline}
                />
            </Container>
            <MobileCTA inStock={derived.inStock} qty={qty} total={derived.unitPrice * qty} formatSAR={formatSAR} clampQty={clampQty}
                maxQty={maxQty}
                setQty={setQty}
                onAddToCart={() => handleAddToCart(product)}
                isFav={isFav}
                onToggleFav={toggleFavorite}
                softOutline={softOutline}
            />
            <Snackbar open={snack.open} autoHideDuration={1800} onClose={closeSnack} message={snack.msg} />
        </Box>
    );
}