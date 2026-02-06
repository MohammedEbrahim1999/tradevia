"use client";

import React from "react";
import { Paper, Stack, Typography, Divider, Box } from "@mui/material";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import Chip from "@mui/material/Chip";

export default function ProductHighlights({ rating, pill, softOutline, surface }) {
    return (
        <Paper sx={{ ...surface, p: 2.2 }}>
            <Stack spacing={1.3}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography fontWeight={900}>Highlights</Typography>
                    {rating > 0 && (
                        <Chip
                            icon={<StarRoundedIcon />}
                            label={`${Math.min(5, rating).toFixed(1)} / 5`}
                            variant="outlined"
                            sx={pill}
                        />
                    )}
                </Stack>

                <Divider />

                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.2 }}>
                    <Paper variant="outlined" sx={{ p: 1.6, borderRadius: 4, borderColor: softOutline, bgcolor: "common.white" }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={800}>
                            Delivery
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.6 }}>
                            <LocalShippingRoundedIcon fontSize="small" />
                            <Typography fontWeight={850}>Fast shipping</Typography>
                        </Stack>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.4 }}>
                            Varies by location
                        </Typography>
                    </Paper>

                    <Paper variant="outlined" sx={{ p: 1.6, borderRadius: 4, borderColor: softOutline, bgcolor: "common.white" }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={800}>
                            Protection
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.6 }}>
                            <SecurityRoundedIcon fontSize="small" />
                            <Typography fontWeight={850}>Secure checkout</Typography>
                        </Stack>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.4 }}>
                            Verified listing
                        </Typography>
                    </Paper>
                </Box>
            </Stack>
        </Paper>
    );
}
