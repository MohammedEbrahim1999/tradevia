"use client";

import React from "react";
import { Paper, Accordion, AccordionSummary, AccordionDetails, Stack, Typography, Divider, Box } from "@mui/material";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";

export default function ProductDetailsAccordions({
    description,
    productId,
    hasStock,
    stock,
    sku,
    category,
    specsEntries,
    softOutline,
    surface,
}) {
    return (
        <Paper sx={{ ...surface, p: { xs: 1.2, md: 1.4 } }}>
            <Accordion defaultExpanded sx={{ bgcolor: "transparent", boxShadow: "none" }}>
                <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <InfoOutlinedIcon fontSize="small" />
                        <Typography fontWeight={900}>Overview</Typography>
                    </Stack>
                </AccordionSummary>
                <AccordionDetails>
                    <Typography color="text.secondary" sx={{ lineHeight: 2, fontSize: { xs: 15.5, md: 16 } }}>
                        {description}
                    </Typography>
                </AccordionDetails>
            </Accordion>

            <Divider />

            <Accordion sx={{ bgcolor: "transparent", boxShadow: "none" }}>
                <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Inventory2RoundedIcon fontSize="small" />
                        <Typography fontWeight={900}>Details</Typography>
                    </Stack>
                </AccordionSummary>
                <AccordionDetails>
                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" }, gap: 1 }}>
                        <PaperBox label="Product ID" value={productId} softOutline={softOutline} />
                        {hasStock && <PaperBox label="Stock" value={stock} softOutline={softOutline} />}
                        {sku && <PaperBox label="SKU" value={sku} softOutline={softOutline} />}
                        {category && <PaperBox label="Category" value={category} softOutline={softOutline} />}
                    </Box>
                </AccordionDetails>
            </Accordion>

            <Divider />

            <Accordion sx={{ bgcolor: "transparent", boxShadow: "none" }}>
                <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <WorkspacePremiumRoundedIcon fontSize="small" />
                        <Typography fontWeight={900}>Specifications</Typography>
                    </Stack>
                </AccordionSummary>
                <AccordionDetails>
                    {specsEntries.length > 0 ? (
                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(3, 1fr)" },
                                gap: 1.2,
                            }}
                        >
                            {specsEntries.map(([k, v]) => (
                                <PaperBox key={k} label={k} value={v} softOutline={softOutline} big />
                            ))}
                        </Box>
                    ) : (
                        <Typography color="text.secondary">No specifications provided.</Typography>
                    )}
                </AccordionDetails>
            </Accordion>
        </Paper>
    );
}

function PaperBox({ label, value, softOutline, big }) {
    return (
        <Paper
            variant="outlined"
            sx={{
                p: big ? 2 : 1.6,
                borderRadius: big ? 5 : 4,
                borderColor: softOutline,
                bgcolor: "common.white",
                boxShadow: "none",
            }}
        >
            <Typography variant="caption" color="text.secondary" fontWeight={850}>
                {label}
            </Typography>
            <Typography fontWeight={900} sx={{ mt: 0.7 }}>
                {String(value)}
            </Typography>
        </Paper>
    );
}
