"use client";

import React from "react";
import { Box, Paper, Stack, Typography, Chip, Tooltip, IconButton } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import ZoomInRoundedIcon from "@mui/icons-material/ZoomInRounded";

export default function ProductGallery({
    title,
    galleryImages,
    activeImg,
    onThumbClick,
    imageSrc,
    onImgError,
    onOpenZoom,
    releaseDate,
    isOnSale,
    pill,
    softOutline,
    surface,
}) {
    const theme = useTheme();

    return (
        <Paper sx={{ ...surface, overflow: "hidden" }}>
            <Box sx={{ p: { xs: 2, md: 2.2 } }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.2 }} gap={1}>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ minWidth: 0 }}>
                        <Chip icon={<WorkspacePremiumRoundedIcon />} label="Premium" variant="outlined" sx={pill} />
                        <Chip icon={<SecurityRoundedIcon />} label="Secure" variant="outlined" sx={pill} />
                        {releaseDate && <Chip label={`Release: ${releaseDate}`} variant="outlined" sx={pill} />}
                        {isOnSale && <Chip label="Limited offer" variant="outlined" sx={pill} />}
                    </Stack>

                    <Tooltip title="Zoom">
                        <IconButton
                            onClick={onOpenZoom}
                            sx={{
                                border: "1px solid",
                                borderColor: softOutline,
                                bgcolor: "common.white",
                                flexShrink: 0,
                            }}
                        >
                            <ZoomInRoundedIcon />
                        </IconButton>
                    </Tooltip>
                </Stack>

                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: {
                            xs: galleryImages.length > 1 ? "74px 1fr" : "1fr",
                            md: galleryImages.length > 1 ? "96px 1fr" : "1fr",
                        },
                        gap: 1.4,
                        alignItems: "start",
                    }}
                >
                    {galleryImages.length > 1 && (
                        <Box
                            sx={{
                                height: { xs: 340, md: 610 },
                                overflowY: "auto",
                                pr: 0.4,
                                scrollbarWidth: "thin",
                            }}
                        >
                            <Stack spacing={1}>
                                {galleryImages.map((src, idx) => {
                                    const active = idx === activeImg;
                                    return (
                                        <Box
                                            key={src + idx}
                                            onClick={() => onThumbClick(idx)}
                                            sx={{
                                                height: { xs: 62, md: 78 },
                                                borderRadius: 3,
                                                overflow: "hidden",
                                                cursor: "pointer",
                                                border: "1px solid",
                                                borderColor: active ? alpha(theme.palette.common.black, 0.35) : softOutline,
                                                bgcolor: "common.white",
                                                transition: "all .16s ease",
                                                "&:hover": { transform: "translateY(-1px)" },
                                            }}
                                        >
                                            <Box
                                                component="img"
                                                src={src}
                                                alt={`${title} ${idx + 1}`}
                                                loading="lazy"
                                                decoding="async"
                                                sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                                            />
                                        </Box>
                                    );
                                })}
                            </Stack>
                        </Box>
                    )}

                    <Box sx={{ minWidth: 0 }}>
                        <Paper
                            variant="outlined"
                            sx={{
                                borderRadius: 5,
                                overflow: "hidden",
                                bgcolor: "common.white",
                                position: "relative",
                                borderColor: softOutline,
                            }}
                        >
                            <Box
                                component="img"
                                src={imageSrc}
                                alt={title}
                                onError={onImgError}
                                loading="eager"
                                decoding="async"
                                fetchPriority="high"
                                style={{ contentVisibility: "auto" }}
                                sx={{
                                    width: "100%",
                                    height: { xs: 340, md: 610 },
                                    objectFit: "contain",
                                    display: "block",
                                }}
                            />
                        </Paper>

                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1.2, display: "block" }}>
                            Tap thumbnails • Zoom for details • Secure purchase
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </Paper>
    );
}
