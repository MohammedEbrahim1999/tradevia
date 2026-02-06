import React, { useState } from "react";
import {
    Container,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Box,
    Card,
    TextField,
    Button,
    InputAdornment,
    Stack,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import ScheduleIcon from "@mui/icons-material/Schedule";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import PublicIcon from "@mui/icons-material/Public";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

// Helper function to highlight matching text
const highlightText = (text, query) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, index) =>
        regex.test(part) ? (
            <span key={index} style={{ backgroundColor: "#FFFB91" }}>
                {part}
            </span>
        ) : (
            part
        )
    );
};

// Map icon names to actual components
const iconMap = {
    LocalShippingIcon: LocalShippingIcon,
    AttachMoneyIcon: AttachMoneyIcon,
    PublicIcon: PublicIcon,
    ScheduleIcon: ScheduleIcon,
    ErrorOutlineIcon: ErrorOutlineIcon,
};

const ShippingDelivery = ({ shippingConditions }) => {
    const [expanded, setExpanded] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState("all");

    const handleChange = (panel) => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
    };

    // Filtered by search AND filter button
    const filteredConditions = shippingConditions.filter((condition) => {
        const matchesSearch =
            condition.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            condition.details.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filter === "all" ? true : condition.category === filter;
        return matchesSearch && matchesFilter;
    });

    return (
        <Container
            maxWidth="lg"
            sx={{ py: { xs: 6, md: 10 }, borderRadius: 3, px: { xs: 2, md: 4 } }}
        >
            {/* Search Input */}
            <Box mb={3} textAlign="center">
                <TextField
                    className="rounded-xl shadow-2xl"
                    fullWidth
                    variant="outlined"
                    placeholder="Search Shipping Info ......"
                    label="Search Shipping Info"
                    value={searchQuery}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon color="action" />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </Box>

            {/* Filter Buttons */}
            <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                justifyContent="center"
                mb={4}
            >
                {["all", "method", "charge", "international", "time", "issue"].map((cat) => (
                    <Button
                        key={cat}
                        variant={filter === cat ? "contained" : "outlined"}
                        color="primary"
                        onClick={() => setFilter(cat)}
                    >
                        {cat === "all" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </Button>
                ))}
            </Stack>
            {/* Shipping FAQ List */}
            <Box display="grid" gap={3}>
                {filteredConditions.length > 0 ? (
                    filteredConditions.map((condition, index) => {
                        const Icon = iconMap[condition.icon];
                        return (
                            <Card
                                key={index}
                                sx={{
                                    display: "flex",
                                    borderRadius: 3,
                                    boxShadow: 2,
                                    transition: "transform 0.3s, box-shadow 0.3s",
                                    "&:hover": { transform: "translateY(-3px)", boxShadow: 6 },
                                    overflow: "hidden",
                                    background: "rgba(255,255,255,0.9)",
                                    backdropFilter: "blur(5px)",
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 6,
                                        backgroundColor: condition.color,
                                        transition: "height 0.5s",
                                        height: expanded === index ? "100%" : "60%",
                                    }}
                                />
                                <Accordion
                                    expanded={expanded === index}
                                    onChange={handleChange(index)}
                                    disableGutters
                                    sx={{
                                        flex: 1,
                                        "&.Mui-expanded": { margin: 0 },
                                        "& .MuiAccordionSummary-root": {
                                            px: 3,
                                            py: 2,
                                            "& .MuiTypography-root": {
                                                fontWeight: 600,
                                                fontSize: "1.1rem",
                                            },
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1,
                                            transition: "0.3s",
                                        },
                                        "& .MuiAccordionDetails-root": {
                                            px: 3,
                                            py: 2,
                                            color: "text.secondary",
                                            fontSize: "0.95rem",
                                            opacity: expanded === index ? 1 : 0,
                                            transform:
                                                expanded === index
                                                    ? "translateY(0px)"
                                                    : "translateY(-10px)",
                                            transition: "all 0.3s",
                                        },
                                    }}
                                >
                                    <AccordionSummary
                                        expandIcon={
                                            <ExpandMoreIcon
                                                sx={{
                                                    transition: "transform 0.3s",
                                                    "&.Mui-expanded": { transform: "rotate(180deg) scale(1.1)" },
                                                }}
                                            />
                                        }
                                    >
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                            {Icon && (
                                                <Box
                                                    sx={{
                                                        color: condition.color,
                                                        transition: "transform 0.3s",
                                                        "&:hover": { transform: "scale(1.2)" },
                                                    }}
                                                >
                                                    <Icon />
                                                </Box>
                                            )}
                                            <Typography>{highlightText(condition.title, searchQuery)}</Typography>
                                        </Box>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Typography>{highlightText(condition.details, searchQuery)}</Typography>
                                    </AccordionDetails>
                                </Accordion>
                            </Card>
                        );
                    })
                ) : (
                    <Typography textAlign="center" color="text.secondary">
                        No results found for "{searchQuery}"
                    </Typography>
                )}
            </Box>
        </Container>
    );
};

export default ShippingDelivery;
