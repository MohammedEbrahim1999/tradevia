"use client";

import { useEffect, useMemo, useState } from "react";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import AddRoundedIcon from "@mui/icons-material/AddRounded";

import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Divider,
    Skeleton,
    Stack,
    Typography,
} from "@mui/material";

export default function TabWallet() {
    const API_WalletBalance = "http://localhost:5000/WalletBalance";
    const API_loggedUser = "http://localhost:5000/loggedCustomers";

    const [walletBalance, setWalletBalance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Format number nicely (supports decimals if you ever add them)
    const formattedBalance = useMemo(() => {
        const raw = walletBalance?.[0]?.balance ?? 0;
        const num = Number(raw) || 0;
        return new Intl.NumberFormat("en-US", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }).format(num);
    }, [walletBalance]);

    useEffect(() => {
        const fetchLoggedCustomers = async () => {
            try {
                setLoading(true);
                setError(null);

                const [resWallet, resLogged] = await Promise.all([
                    fetch(API_WalletBalance),
                    fetch(API_loggedUser),
                ]);

                if (!resWallet.ok || !resLogged.ok) {
                    throw new Error("Failed to fetch wallet data");
                }

                const data = await resWallet.json();
                const loggedCustomerData = await resLogged.json();

                const userToken = loggedCustomerData?.[0]?.userTokens;
                if (!userToken) {
                    setWalletBalance([]);
                    return;
                }

                const filtered = (Array.isArray(data) ? data : []).filter(
                    (row) => row.userTokens === userToken
                );

                setWalletBalance(filtered);
            } catch (err) {
                setError(err?.message || "Something went wrong");
            } finally {
                setLoading(false);
            }
        };

        fetchLoggedCustomers();
    }, []);

    return (
        <Box className="space-y-6">
            {/* Header card */}
            <Card
                elevation={0}
                sx={{
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "divider",
                    overflow: "hidden",
                }}
            >
                <CardContent sx={{ p: 2.5 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2} flexWrap={"wrap"}>
                        <Stack direction="row" alignItems="center" gap={1.5}>
                            <Box
                                sx={{
                                    width: 46,
                                    height: 46,
                                    borderRadius: 2.5,
                                    display: "grid",
                                    placeItems: "center",
                                    bgcolor: "grey.100",
                                    border: "1px solid",
                                    borderColor: "divider",
                                }}
                            >
                                <AccountBalanceWalletOutlinedIcon sx={{ color: "text.primary" }} />
                            </Box>

                            <Box>
                                <Typography variant="subtitle2" sx={{ color: "text.secondary", lineHeight: 1.2 }}>
                                    Wallet Balance
                                </Typography>

                                {loading ? (
                                    <Skeleton variant="text" width={140} height={36} />
                                ) : (
                                    <Stack direction="row" alignItems="baseline" gap={1}>
                                        <Typography variant="h4" sx={{ fontWeight: 800 }}>
                                            {formattedBalance}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                            SAR
                                        </Typography>
                                    </Stack>
                                )}
                            </Box>
                        </Stack>

                        {/* Status chip */}
                        <Box>
                            {loading ? (
                                <Skeleton variant="rounded" width={90} height={28} />
                            ) : error ? (
                                <Chip label="Issue" color="error" variant="outlined" />
                            ) : (
                                <Chip label="Active" color="success" variant="outlined" />
                            )}
                        </Box>
                    </Stack>

                    <Divider sx={{ my: 2 }} />

                    {/* Info + Actions */}
                    <Stack
                        direction={{ xs: "column", sm: "row" }}
                        alignItems={{ xs: "stretch", sm: "center" }}
                        justifyContent="space-between"
                        gap={2}
                    >
                        <Box>
                            <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                Add balance to complete purchases faster and track your spending easily.
                            </Typography>
                        </Box>

                        <Stack direction="row" gap={1} justifyContent="flex-end">
                            <Button
                                variant="contained"
                                startIcon={<AddRoundedIcon />}
                                disableElevation
                                sx={{
                                    borderRadius: 2,
                                    textTransform: "none",
                                    px: 2,
                                    py: 1,
                                    fontWeight: 700,
                                }}
                            >
                                Add Balance
                            </Button>
                        </Stack>
                    </Stack>
                </CardContent>
            </Card>

            {/* Error message */}
            {error && (
                <Alert
                    severity="error"
                    variant="outlined"
                    sx={{
                        borderRadius: 3,
                    }}
                >
                    {error}
                </Alert>
            )}

            {/* Optional: small tips card */}
            <Card
                elevation={0}
                sx={{
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "divider",
                }}
            >
                <CardContent sx={{ p: 2.5 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.5 }}>
                        Tips
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                        Keep a small wallet balance to speed up checkout. You can add or withdraw anytime (if you
                        enable withdrawals later).
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    );
}
