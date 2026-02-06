"use client";

import React from "react";
import { Paper, Stack, Typography, Divider, Chip } from "@mui/material";

export default function ProductInfoCard({ sku, category, brand, pill, surface }) {
    return (
        <Paper sx={{ ...surface, p: 2 }}>
            <Stack spacing={1}>
                <Typography fontWeight={900}>Product info</Typography>
                <Divider />
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {sku && <Chip label={`SKU: ${sku}`} variant="outlined" sx={pill} />}
                    {category && <Chip label={category} variant="outlined" sx={pill} />}
                    {brand && <Chip label={brand} variant="outlined" sx={pill} />}
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.9 }}>
                    Quick checkout on the right, full details below for a balanced layout.
                </Typography>
            </Stack>
        </Paper>
    );
}
