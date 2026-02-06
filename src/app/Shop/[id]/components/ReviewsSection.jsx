"use client";

import React from "react";
import { Paper, Stack, Typography, Divider, Box, Avatar, Rating, Chip } from "@mui/material";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import { alpha } from "@mui/material/styles";

const ReviewsSection = React.memo(function ReviewsSection({ reviews, rating, softOutline, pill }) {
    return (
        <Paper sx={{ borderRadius: 6, border: "1px solid", borderColor: softOutline, bgcolor: "common.white", boxShadow: "none", p: 2.2 }}>
            <Stack spacing={1.4}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack>
                        <Typography fontWeight={900}>Customer feedback</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Full-width reviews for a balanced layout
                        </Typography>
                    </Stack>
                    {rating > 0 && (
                        <Chip icon={<StarRoundedIcon />} label={`${Math.min(5, rating).toFixed(1)} / 5`} variant="outlined" sx={pill} />
                    )}
                </Stack>

                <Divider />

                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 1.2 }}>
                    {reviews.map((r, idx) => (
                        <Paper key={idx} variant="outlined" sx={{ p: 1.6, borderRadius: 4, borderColor: softOutline, bgcolor: "common.white" }}>
                            <Stack direction="row" spacing={1.2} alignItems="center">
                                <Avatar sx={{ width: 34, height: 34, fontWeight: 900, bgcolor: alpha("#000", 0.06), color: "text.primary" }}>
                                    {String(r.name || "?").slice(0, 1).toUpperCase()}
                                </Avatar>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
                                        <Typography fontWeight={850} noWrap>{r.name}</Typography>
                                        <Rating value={r.rate} precision={0.5} readOnly size="small" />
                                    </Stack>
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.4 }}>
                                        {r.text}
                                    </Typography>
                                </Box>
                            </Stack>
                        </Paper>
                    ))}
                </Box>
            </Stack>
        </Paper>
    );
});

export default ReviewsSection;
