"use client";

import React from "react";
import {
    Box,
    Container,
    Typography,
    Stack,
    Chip,
    Tooltip,
    IconButton,
    CircularProgress,
    Breadcrumbs,
    Link as MLink,
} from "@mui/material";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import ShareRoundedIcon from "@mui/icons-material/ShareRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import { Rating, alpha } from "@mui/material";

export default function ProductHero({
    router,
    title,
    category,
    brand,
    type,
    slug,
    sku,
    rating,
    reviewCount,
    hasStock,
    inStock,
    stock,
    isOnSale,
    discount,
    pill,
    iconBtnGlass,
    heroBg,
    softOutline,
    isFav,
    onToggleFav,
    onShare,
    onRefresh,
    refreshing,
}) {
    return (
        <Box sx={{ background: heroBg, borderBottom: "1px solid", borderColor: "divider" }}>
            <Container sx={{ py: { xs: 3.5, md: 4.5 } }}>
                <Stack spacing={1.2}>
                    <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={2}>
                        <Box sx={{ minWidth: 0 }}>
                            <Typography
                                variant="overline"
                                color="text.secondary"
                                sx={{ letterSpacing: 1.2, fontWeight: 900 }}
                            >
                                {category ? `${category} •` : ""} Premium product
                            </Typography>

                            <Typography
                                variant="h3"
                                fontWeight={950}
                                sx={{
                                    lineHeight: 1.05,
                                    letterSpacing: -0.8,
                                    wordBreak: "break-word",
                                    mt: 0.4,
                                }}
                            >
                                {title}
                            </Typography>

                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                                {brand && <Chip label={brand} variant="outlined" sx={pill} />}
                                {type && <Chip label={type} variant="outlined" sx={pill} />}
                                {slug && <Chip label={slug} variant="outlined" sx={pill} />}
                                {sku && <Chip label={`SKU: ${sku}`} variant="outlined" sx={pill} />}
                                {isOnSale && (
                                    <Chip
                                        icon={<LocalOfferRoundedIcon />}
                                        label={`Save ${discount}%`}
                                        variant="outlined"
                                        sx={pill}
                                    />
                                )}
                                {hasStock && (
                                    <Chip
                                        icon={<Inventory2RoundedIcon />}
                                        label={inStock ? `In stock (${stock})` : "Out of stock"}
                                        variant="outlined"
                                        sx={pill}
                                    />
                                )}
                            </Stack>

                            <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                                flexWrap="wrap"
                                useFlexGap
                                sx={{ mt: 1.1 }}
                            >
                                {rating > 0 ? (
                                    <>
                                        <Rating value={Math.min(5, rating)} precision={0.5} readOnly />
                                        <Typography variant="body2" color="text.secondary">
                                            {Math.min(5, rating).toFixed(1)} / 5{" "}
                                            {reviewCount > 0 ? `• ${reviewCount} reviews` : ""}
                                        </Typography>
                                        <Chip icon={<StarRoundedIcon />} label="Top rated" variant="outlined" sx={pill} />
                                    </>
                                ) : (
                                    <Typography variant="body2" color="text.secondary">
                                        No ratings yet
                                    </Typography>
                                )}
                            </Stack>
                        </Box>

                        <Stack direction="row" spacing={0.8} alignItems="center">
                            <Tooltip title={isFav ? "Remove from favorites" : "Add to favorites"}>
                                <IconButton onClick={onToggleFav} sx={iconBtnGlass}>
                                    {isFav ? <FavoriteRoundedIcon color="error" /> : <FavoriteBorderRoundedIcon />}
                                </IconButton>
                            </Tooltip>

                            <Tooltip title="Share">
                                <IconButton onClick={onShare} sx={iconBtnGlass}>
                                    <ShareRoundedIcon />
                                </IconButton>
                            </Tooltip>

                            <Tooltip title="Refresh">
                                <span>
                                    <IconButton
                                        onClick={onRefresh}
                                        disabled={refreshing}
                                        aria-label="Refresh"
                                        sx={{
                                            border: "1px solid",
                                            borderColor: softOutline,
                                            bgcolor: "common.white",
                                            "&:hover": { transform: "translateY(-1px)" },
                                            transition: "all .16s ease",
                                        }}
                                    >
                                        {refreshing ? <CircularProgress size={20} /> : <RefreshRoundedIcon />}
                                    </IconButton>
                                </span>
                            </Tooltip>

                            <Tooltip title="Back">
                                <IconButton
                                    onClick={() => router.back()}
                                    aria-label="Back"
                                    sx={{
                                        border: "1px solid",
                                        borderColor: alpha("#000", 0.08),
                                        bgcolor: "common.white",
                                    }}
                                >
                                    <ArrowBackRoundedIcon />
                                </IconButton>
                            </Tooltip>
                        </Stack>
                    </Stack>

                    <Breadcrumbs aria-label="breadcrumb" sx={{ mt: 0.5 }}>
                        <MLink
                            component="button"
                            underline="hover"
                            color="inherit"
                            onClick={() => router.push("/")}
                            sx={{ fontSize: 13 }}
                        >
                            Home
                        </MLink>
                        <MLink
                            component="button"
                            underline="hover"
                            color="inherit"
                            onClick={() => router.push("/shop")}
                            sx={{ fontSize: 13 }}
                        >
                            Shop
                        </MLink>
                        <Typography color="text.secondary" sx={{ fontSize: 13 }}>
                            {title}
                        </Typography>
                    </Breadcrumbs>
                </Stack>
            </Container>
        </Box>
    );
}
