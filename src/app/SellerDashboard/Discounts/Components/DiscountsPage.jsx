"use client";

import { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

export default function DiscountsPage() {
    const [discounts, setDiscounts] = useState([]);
    const [loggedUser, setLoggedUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [open, setOpen] = useState(false);
    const [newDiscount, setNewDiscount] = useState({
        code: "",
        description: "",
        discountPercentage: "",
        validFrom: "",
        validTo: "",
        usageLimit: "",
    });

    const API_DISCOUNTS = "http://localhost:5000/discounts";
    const API_LOGGED_USER = "http://localhost:5000/loggedUsers";

    // FETCH DATA
    useEffect(() => {
        const fetchData = async () => {
            try {
                const userRes = await fetch(API_LOGGED_USER);
                if (!userRes.ok) throw new Error("Failed to fetch logged user");
                const userData = await userRes.json();
                const user = userData[0];
                setLoggedUser(user);

                const discountRes = await fetch(API_DISCOUNTS);
                if (!discountRes.ok) throw new Error("Failed to fetch discounts");
                const discountData = await discountRes.json();

                const filtered = discountData.filter(
                    (d) => d.sellerId === user.sellerId
                );
                setDiscounts(filtered);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // DELETE DISCOUNT
    const handleDelete = async (id) => {
        try {
            await fetch(`${API_DISCOUNTS}/${id}`, { method: "DELETE" });
            setDiscounts(discounts.filter((d) => d.id !== id));
        } catch {
            alert("Failed to delete discount");
        }
    };

    // ADD DISCOUNT
    const handleAddDiscount = async () => {
        const payload = {
            ...newDiscount,
            sellerId: loggedUser.sellerId,
            id: String(Date.now()), // unique id
            discountPercentage: Number(newDiscount.discountPercentage),
            usageLimit: Number(newDiscount.usageLimit),
            timesUsed: 0,
        };

        try {
            const res = await fetch(API_DISCOUNTS, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error("Failed to add discount");

            setDiscounts([...discounts, payload]);
            setOpen(false);

            // reset form
            setNewDiscount({
                code: "",
                description: "",
                discountPercentage: "",
                validFrom: "",
                validTo: "",
                usageLimit: "",
            });
        } catch (err) {
            alert(err.message);
        }
    };

    if (loading) return <Typography>Loading...</Typography>;
    if (error) return <Typography color="error">{error}</Typography>;

    return (
        <Box p={4}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">My Discounts</Typography>

                {/* ADD DISCOUNT BUTTON */}
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpen(true)}
                >
                    Add Discount
                </Button>
            </Box>

            {/* TABLE */}
            {discounts.length === 0 ? (
                <Typography>No discounts found for your account.</Typography>
            ) : (
                <Table>
                    <TableHead>
                        <TableRow className="text-white">
                            <TableCell style={{color: "#FFF"}}>Code</TableCell>
                            <TableCell style={{color: "#FFF"}}>Description</TableCell>
                            <TableCell style={{color: "#FFF"}}>Discount %</TableCell>
                            <TableCell style={{color: "#FFF"}}>Valid From</TableCell>
                            <TableCell style={{color: "#FFF"}}>Valid To</TableCell>
                            <TableCell style={{color: "#FFF"}}>Usage</TableCell>
                            <TableCell style={{color: "#FFF"}}>Actions</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {discounts.map((d) => (
                            <TableRow key={d.id}>
                                <TableCell style={{color: "#FFF"}} >{d.code}</TableCell>
                                <TableCell style={{color: "#FFF"}}>{d.description}</TableCell>
                                <TableCell style={{color: "#FFF"}}>{d.discountPercentage}%</TableCell>
                                <TableCell style={{color: "#FFF"}}>{d.validFrom}</TableCell>
                                <TableCell style={{color: "#FFF"}}>{d.validTo}</TableCell>
                                <TableCell style={{color: "#FFF"}}>
                                    {d.timesUsed} / {d.usageLimit}
                                </TableCell>
                                <TableCell>
                                    <Button
                                        size="small"
                                        color="error"
                                        startIcon={<DeleteIcon />}
                                        onClick={() => handleDelete(d.id)}
                                    >
                                        Delete
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}

            {/* ADD DISCOUNT MODAL */}
            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                fullWidth
                maxWidth="sm"
                PaperProps={{
                    sx: {
                        borderRadius: "16px",
                        p: 1,
                    },
                }}
            >
                <DialogTitle
                    sx={{
                        fontSize: "1.4rem",
                        fontWeight: 600,
                        textAlign: "center",
                        pb: 1,
                    }}
                >
                    Add New Discount
                </DialogTitle>

                <DialogContent
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2.5,
                        mt: 1,
                        px: 3,
                        pb: 1,
                    }}
                >
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: 2,
                        }}
                    >
                        <TextField
                            label="Code"
                            variant="outlined"
                            size="small"
                            fullWidth
                            value={newDiscount.code}
                            onChange={(e) =>
                                setNewDiscount({ ...newDiscount, code: e.target.value })
                            }
                        />

                        <TextField
                            label="Discount Percentage"
                            type="number"
                            variant="outlined"
                            size="small"
                            fullWidth
                            value={newDiscount.discountPercentage}
                            onChange={(e) =>
                                setNewDiscount({
                                    ...newDiscount,
                                    discountPercentage: e.target.value,
                                })
                            }
                        />
                    </Box>

                    <TextField
                        label="Description"
                        multiline
                        rows={3}
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={newDiscount.description}
                        onChange={(e) =>
                            setNewDiscount({
                                ...newDiscount,
                                description: e.target.value,
                            })
                        }
                    />

                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: 2,
                        }}
                    >
                        <TextField
                            label="Valid From"
                            type="date"
                            size="small"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            value={newDiscount.validFrom}
                            onChange={(e) =>
                                setNewDiscount({ ...newDiscount, validFrom: e.target.value })
                            }
                        />

                        <TextField
                            label="Valid To"
                            type="date"
                            size="small"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            value={newDiscount.validTo}
                            onChange={(e) =>
                                setNewDiscount({ ...newDiscount, validTo: e.target.value })
                            }
                        />
                    </Box>

                    <TextField
                        label="Usage Limit"
                        type="number"
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={newDiscount.usageLimit}
                        onChange={(e) =>
                            setNewDiscount({
                                ...newDiscount,
                                usageLimit: e.target.value,
                            })
                        }
                    />
                </DialogContent>

                <DialogActions
                    sx={{
                        px: 3,
                        pb: 2,
                        display: "flex",
                        justifyContent: "space-between",
                    }}
                >
                    <Button
                        onClick={() => setOpen(false)}
                        variant="outlined"
                        sx={{ borderRadius: "10px", textTransform: "none" }}
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="contained"
                        onClick={handleAddDiscount}
                        sx={{
                            borderRadius: "10px",
                            textTransform: "none",
                            px: 4,
                        }}
                    >
                        Add Discount
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
