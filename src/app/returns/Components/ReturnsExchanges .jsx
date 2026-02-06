"use client";
import React, { useState } from "react";
import {
    Container,
    Typography,
    Box,
    Stack,
    Divider,
    Card,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Alert,
    Fade,
} from "@mui/material";

import ReplayIcon from "@mui/icons-material/Replay";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import ScheduleIcon from "@mui/icons-material/Schedule";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import CancelIcon from "@mui/icons-material/Cancel";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import PublicIcon from "@mui/icons-material/Public";
import PaidIcon from "@mui/icons-material/Paid";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import GavelIcon from "@mui/icons-material/Gavel";

const ReturnsExchanges = ({ returnData }) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const selectedPolicy = returnData[selectedIndex];

    const iconMap = {
        ReplayIcon: ReplayIcon,
        SwapHorizIcon: SwapHorizIcon,
        ScheduleIcon: ScheduleIcon,
        ReceiptLongIcon: ReceiptLongIcon,
        LocalShippingIcon: LocalShippingIcon,
        CancelIcon: CancelIcon,
        ReportProblemIcon: ReportProblemIcon,
        PublicIcon: PublicIcon,
        PaidIcon: PaidIcon,
        HourglassTopIcon: HourglassTopIcon,
        AccountBalanceWalletIcon: AccountBalanceWalletIcon,
    };

    const SelectedIcon = iconMap[selectedPolicy.icon];

    return (
        <Box sx={{ backgroundColor: "#fafafa", py: 8 }}>
            <Container maxWidth="lg">

                <Alert severity="info" sx={{ mb: 4 }}>
                    Select a policy title to view its details.
                </Alert>

                <Stack direction={{ xs: "column", md: "row" }} spacing={3}>

                    {/* Titles */}
                    <Card sx={{ width: { md: 320 }, p: 1 }}>
                        <List>
                            {returnData.map((policy, index) => {
                                const Icon = iconMap[policy.icon];

                                return (
                                    <ListItemButton
                                        key={index}
                                        selected={selectedIndex === index}
                                        onClick={() => setSelectedIndex(index)}
                                        sx={{
                                            borderRadius: 1,
                                            mb: 0.5,
                                            color: "text.primary",

                                            "& .MuiListItemIcon-root": {
                                                color: "text.secondary",
                                            },

                                            "&.Mui-selected": {
                                                backgroundColor: "#4D96FF",
                                                color: "#fff",

                                                "& .MuiListItemIcon-root": {
                                                    color: "#fff",
                                                },
                                            },

                                            "&.Mui-selected:hover": {
                                                backgroundColor: "#3b7ce0",
                                            },

                                            "&:hover": {
                                                backgroundColor: "#f5f7fa",
                                            },
                                        }}
                                    >
                                        <ListItemIcon>
                                            <Icon />
                                        </ListItemIcon>
                                        <ListItemText primary={policy.title} />
                                    </ListItemButton>
                                );
                            })}
                        </List>
                    </Card>

                    {/* Content with animation */}
                    <Fade in timeout={1500} key={selectedIndex}>
                        <Card
                            sx={{
                                flex: 1,
                                p: 4,
                                maxHeight: "fit-content",
                                boxShadow: "0 0 10px rgba(0,0,0,0.1)",
                            }}
                        >
                            <Box display="flex" alignItems="center" gap={1} mb={2}>
                                <SelectedIcon color="primary" />
                                <Typography variant="h6" fontWeight={600}>
                                    {selectedPolicy.title}
                                </Typography>
                            </Box>

                            <Divider sx={{ mb: 2 }} />

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                lineHeight={2.8}
                            >
                                {selectedPolicy.details}
                            </Typography>
                        </Card>
                    </Fade>

                </Stack>

                {/* Legal */}
                <Card sx={{ mt: 6, p: 3 }}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <GavelIcon color="action" />
                        <Typography fontWeight={600}>
                            Legal Disclaimer
                        </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                        The company reserves the right to modify this policy at
                        any time without prior notice.
                    </Typography>
                </Card>

            </Container>
        </Box>
    );
};

export default ReturnsExchanges;
