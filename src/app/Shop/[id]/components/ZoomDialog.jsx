"use client";

import React from "react";
import { Dialog, DialogContent, Stack, Typography, IconButton, Paper, Box, Fade } from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

export default function ZoomDialog({ open, onClose, title, imageSrc, softOutline }) {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth TransitionComponent={Fade}>
            <DialogContent sx={{ p: { xs: 1.5, md: 2.5 } }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Typography fontWeight={900} sx={{ pr: 2 }}>
                        {title}
                    </Typography>
                    <IconButton aria-label="Close" onClick={onClose}>
                        <CloseRoundedIcon />
                    </IconButton>
                </Stack>

                <Paper
                    variant="outlined"
                    sx={{ borderRadius: 4, overflow: "hidden", bgcolor: "common.white", borderColor: softOutline }}
                >
                    <Box
                        component="img"
                        src={imageSrc}
                        alt={title}
                        loading="eager"
                        decoding="async"
                        sx={{ width: "100%", height: { xs: 360, md: 600 }, objectFit: "contain", display: "block" }}
                    />
                </Paper>
            </DialogContent>
        </Dialog>
    );
}
