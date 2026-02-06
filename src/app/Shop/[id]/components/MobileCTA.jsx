"use client";

import React from "react";
import { Box, Container, Stack, Typography, IconButton, Button } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";

export default function MobileCTA({
    inStock,
    qty,
    total,
    formatSAR,
    clampQty,
    maxQty,
    setQty,
    onAddToCart,
    isFav,
    onToggleFav,
    softOutline,
}) {
    const theme = useTheme();

    return (
        <Box
            sx={{
                display: { xs: "block", md: "none" },
                position: "fixed",
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 1200,
                p: 1.2,
                background: theme.palette.common.white,
                borderTop: "1px solid",
                borderColor: softOutline,
            }}
        >
            <Container>
                <Stack direction="row" spacing={1.1} alignItems="center">
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography fontWeight={900} noWrap>
                            {formatSAR(total)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>
                            {inStock ? `Qty ${qty} • Ready to ship` : "Out of stock"}
                        </Typography>
                    </Box>

                    <IconButton
                        onClick={() => setQty((q) => clampQty(q - 1))}
                        disabled={!inStock || qty <= 1}
                        sx={{ border: "1px solid", borderColor: softOutline, bgcolor: "common.white" }}
                    >
                        <RemoveRoundedIcon />
                    </IconButton>

                    <IconButton
                        onClick={() => setQty((q) => clampQty(q + 1))}
                        disabled={!inStock || qty >= maxQty}
                        sx={{ border: "1px solid", borderColor: softOutline, bgcolor: "common.white" }}
                    >
                        <AddRoundedIcon />
                    </IconButton>

                    <Button
                        variant="contained"
                        disabled={!inStock}
                        startIcon={<ShoppingCartRoundedIcon />}
                        onClick={onAddToCart}
                        sx={{
                            borderRadius: 99,
                            px: 2.2,
                            py: 1.2,
                            fontWeight: 900,
                            textTransform: "none",
                            bgcolor: theme.palette.common.black,
                            color: "common.white",
                            boxShadow: "none",
                            "&:hover": { bgcolor: alpha(theme.palette.common.black, 0.85) },
                        }}
                    >
                        {inStock ? "Buy now" : "Unavailable"}
                    </Button>

                    <IconButton
                        onClick={onToggleFav}
                        sx={{ border: "1px solid", borderColor: softOutline, bgcolor: "common.white" }}
                    >
                        {isFav ? <FavoriteRoundedIcon color="error" /> : <FavoriteBorderRoundedIcon />}
                    </IconButton>
                </Stack>
            </Container>
        </Box>
    );
}
