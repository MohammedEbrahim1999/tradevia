"use client";

import React from "react";
import {
    Paper,
    Stack,
    Typography,
    Chip,
    Divider,
    Box,
    IconButton,
    TextField,
    Button,
    LinearProgress,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

import DiscountRoundedIcon from "@mui/icons-material/DiscountRounded";
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import ShareRoundedIcon from "@mui/icons-material/ShareRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import SupportAgentRoundedIcon from "@mui/icons-material/SupportAgentRounded";

export default function ProductCheckout({
    product,
    hasStock,
    inStock,
    stock,
    isOnSale,
    discount,
    saving,
    price,
    salePrice,
    qty,
    setQty,
    clampQty,
    maxQty,
    total,
    formatSAR,
    softOutline,
    surface,
    pill,
    ctaPrimary,
    onAddToCart,
    isFav,
    onToggleFav,
    onShare,
}) {
    const theme = useTheme();

    return (
        <Paper sx={{ ...surface, p: 2.6 }}>
            <Stack spacing={1.2}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="overline" color="text.secondary" fontWeight={900} sx={{ letterSpacing: 1.1 }}>
                        Checkout
                    </Typography>
                    {isOnSale && (
                        <Chip
                            icon={<DiscountRoundedIcon />}
                            label={`Save ${discount}% • ${formatSAR(saving)}`}
                            variant="outlined"
                            sx={pill}
                        />
                    )}
                </Stack>

                <Stack direction="row" spacing={1.2} alignItems="baseline" flexWrap="wrap" useFlexGap>
                    {isOnSale ? (
                        <>
                            <Typography variant="h3" fontWeight={950} sx={{ lineHeight: 1 }}>
                                {formatSAR(salePrice)}
                            </Typography>
                            <Typography color="text.secondary" sx={{ textDecoration: "line-through" }}>
                                {formatSAR(price)}
                            </Typography>
                        </>
                    ) : (
                        <Typography variant="h3" fontWeight={950} sx={{ lineHeight: 1 }}>
                            {formatSAR(price)}
                        </Typography>
                    )}
                </Stack>

                {hasStock && (
                    <Box sx={{ pt: 0.3 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="body2" color="text.secondary">
                                Availability
                            </Typography>
                            <Typography variant="body2" fontWeight={850}>
                                {inStock ? `In stock (${stock})` : "Out of stock"}
                            </Typography>
                        </Stack>
                        <LinearProgress
                            variant="determinate"
                            value={Math.min(100, Math.max(6, (Number(stock || 0) / 30) * 100))}
                            sx={{
                                mt: 0.8,
                                height: 8,
                                borderRadius: 99,
                                bgcolor: alpha(theme.palette.common.black, 0.06),
                                "& .MuiLinearProgress-bar": { bgcolor: alpha(theme.palette.common.black, 0.55) },
                            }}
                        />
                    </Box>
                )}

                <Divider sx={{ my: 0.6 }} />

                <Stack direction="row" spacing={1.2} alignItems="center" justifyContent="space-between">
                    <Typography fontWeight={850}>Quantity</Typography>

                    <Stack direction="row" spacing={0.7} alignItems="center">
                        <IconButton
                            onClick={() => setQty((q) => clampQty(q - 1))}
                            disabled={!inStock || qty <= 1}
                            sx={{ border: "1px solid", borderColor: softOutline, bgcolor: "common.white" }}
                        >
                            <RemoveRoundedIcon />
                        </IconButton>

                        <TextField
                            size="small"
                            value={qty}
                            onChange={(e) => setQty(clampQty(e.target.value))}
                            inputProps={{ inputMode: "numeric", style: { textAlign: "center", fontWeight: 900, width: 60 } }}
                        />

                        <IconButton
                            onClick={() => setQty((q) => clampQty(q + 1))}
                            disabled={!inStock || qty >= maxQty}
                            sx={{ border: "1px solid", borderColor: softOutline, bgcolor: "common.white" }}
                        >
                            <AddRoundedIcon />
                        </IconButton>
                    </Stack>
                </Stack>

                <Paper variant="outlined" sx={{ p: 1.4, borderRadius: 4, borderColor: softOutline, bgcolor: "common.white" }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Typography color="text.secondary" fontWeight={800}>
                            Total
                        </Typography>
                        <Typography fontWeight={900}>{formatSAR(total)}</Typography>
                    </Stack>
                    {isOnSale && (
                        <Typography variant="caption" color="text.secondary">
                            You’re saving {formatSAR(saving * qty)} on this order
                        </Typography>
                    )}
                </Paper>

                <Stack spacing={1.1}>
                    <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        disabled={!inStock}
                        startIcon={<ShoppingCartRoundedIcon />}
                        sx={ctaPrimary}
                        onClick={onAddToCart}
                    >
                        {inStock ? "Add to cart" : "Out of stock"}
                    </Button>

                    <Stack direction="row" spacing={1.2}>
                        <Button
                            fullWidth
                            variant={isFav ? "contained" : "outlined"}
                            onClick={onToggleFav}
                            startIcon={isFav ? <FavoriteRoundedIcon /> : <FavoriteBorderRoundedIcon />}
                            sx={{
                                borderRadius: 3.2,
                                textTransform: "none",
                                fontWeight: 850,
                                py: 1.1,
                                boxShadow: "none",
                                ...(isFav
                                    ? {
                                        bgcolor: alpha(theme.palette.common.black, 0.9),
                                        color: "common.white",
                                        "&:hover": { bgcolor: alpha(theme.palette.common.black, 0.8) },
                                    }
                                    : {}),
                            }}
                        >
                            {isFav ? "Saved" : "Save"}
                        </Button>

                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={onShare}
                            startIcon={<ShareRoundedIcon />}
                            sx={{ borderRadius: 3.2, textTransform: "none", fontWeight: 850, py: 1.1 }}
                        >
                            Share
                        </Button>
                    </Stack>
                </Stack>

                <Divider sx={{ my: 0.8 }} />

                <Stack spacing={1}>
                    <Stack direction="row" spacing={1.2} alignItems="center">
                        <CheckCircleRoundedIcon fontSize="small" />
                        <Typography color="text.secondary">Verified listing • secure checkout</Typography>
                    </Stack>
                    <Stack direction="row" spacing={1.2} alignItems="center">
                        <LocalShippingRoundedIcon fontSize="small" />
                        <Typography color="text.secondary">Fast delivery (varies by location)</Typography>
                    </Stack>
                    <Stack direction="row" spacing={1.2} alignItems="center">
                        <SupportAgentRoundedIcon fontSize="small" />
                        <Typography color="text.secondary">Support available for issues & returns</Typography>
                    </Stack>
                </Stack>
            </Stack>
        </Paper>
    );
}
