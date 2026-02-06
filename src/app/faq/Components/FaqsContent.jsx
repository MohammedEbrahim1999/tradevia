"use client";

import React, { useState } from "react";
import {
    Container,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    TextField,
    InputAdornment,
    Box,
    Card,
    Button,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import LocalPostOfficeIcon from "@mui/icons-material/LocalPostOffice";
import EditIcon from "@mui/icons-material/Edit";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
const categories = ["All", "Returns", "Shipping", "Orders", "Discounts"];

const FaqsContent = ({ faqs }) => {
    const [search, setSearch] = useState("");
    const [expanded, setExpanded] = useState(false);
    const [activeCategory, setActiveCategory] = useState("All");

    const handleChange = (panel) => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
    };

    const highlightText = (text) => {
        if (!search) return text;
        const regex = new RegExp(`(${search})`, "gi");
        return text.split(regex).map((part, index) =>
            regex.test(part) ? (
                <span
                    key={index}
                    style={{
                        backgroundColor: "#ffe58f",
                        borderRadius: 2,
                        padding: "0 2px",
                        transition: "0.3s",
                    }}
                >
                    {part}
                </span>
            ) : (
                part
            )
        );
    };

    const filteredFaqs = faqs.filter(
        (faq) =>
            (activeCategory === "All" || faq.category === activeCategory) &&
            (faq.question.toLowerCase().includes(search.toLowerCase()) ||
                faq.answer.toLowerCase().includes(search.toLowerCase()))
    );

    const toggleAll = () => {
        if (expanded === "all") setExpanded(false);
        else setExpanded("all");
    };
    const iconMap = {
        AutorenewIcon:AutorenewIcon,
        LocalShippingIcon:LocalShippingIcon,
        LocalPostOfficeIcon:LocalPostOfficeIcon,
        EditIcon:EditIcon,
        AttachMoneyIcon:AttachMoneyIcon,
    };
    return (
        <Container
            maxWidth="lg"
            sx={{
                py: { xs: 6, md: 10 },
                borderRadius: 3,
                px: { xs: 2, md: 4 },
            }}
        >
            {/* Search */}
            <Box mb={3}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search FAQs..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon color="action" />
                            </InputAdornment>
                        ),
                    }}
                    sx={{
                        borderRadius: 3,
                        backgroundColor: "background.paper",
                        boxShadow: 1,
                        "& .MuiOutlinedInput-root": { borderRadius: 3 },
                    }}
                />
            </Box>

            {/* Category Filter */}
            <Box mb={5} display="flex" gap={2} justifyContent="center" flexWrap="wrap">
                {categories.map((cat) => (
                    <Button
                        key={cat}
                        size="small"
                        variant={activeCategory === cat ? "contained" : "outlined"}
                        color="primary"
                        onClick={() => setActiveCategory(cat)}
                        sx={{
                            borderRadius: 2,
                            textTransform: "none",
                            px: 3,
                            py: 1,
                            fontWeight: activeCategory === cat ? 600 : 500,
                            transition: "0.3s",
                            "&:hover": { opacity: 0.8 },
                        }}
                    >
                        {cat}
                    </Button>
                ))}
            </Box>

            {/* Expand/Collapse All */}
            <Box mb={3} textAlign="center">
                <Button
                    variant="text"
                    color="secondary"
                    onClick={toggleAll}
                    sx={{ textTransform: "none", fontWeight: 500 }}
                >
                    {expanded === "all" ? "Collapse All" : "Expand All"}
                </Button>
            </Box>

            {/* FAQ List */}
            <Box display="grid" gap={3}>
                {filteredFaqs.length > 0 ? (
                    filteredFaqs.map((faq, index) => {
                        const isExpanded = expanded === "all" || expanded === index;
                        const Icon = iconMap[faq.icon];
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
                                {/* Animated Accent Line */}
                                <Box
                                    sx={{
                                        width: 6,
                                        backgroundColor: faq.color,
                                        transition: "height 0.5s",
                                        height: isExpanded ? "100%" : "60%",
                                    }}
                                />

                                <Accordion
                                    expanded={isExpanded}
                                    onChange={handleChange(index)}
                                    disableGutters
                                    sx={{
                                        flex: 1,
                                        "&.Mui-expanded": { margin: 0 },
                                        "& .MuiAccordionSummary-root": {
                                            px: 3,
                                            py: 2,
                                            "& .MuiTypography-root": { fontWeight: 600, fontSize: "1.1rem" },
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
                                            opacity: isExpanded ? 1 : 0,
                                            transform: isExpanded ? "translateY(0px)" : "translateY(-10px)",
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
                                        aria-controls={`panel${index}-content`}
                                        id={`panel${index}-header`}
                                    >
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                            <Box
                                                sx={{
                                                    color: faq.color,
                                                    transition: "transform 0.3s",
                                                    "&:hover": { transform: "scale(1.2)" },
                                                }}
                                            >
                                                {Icon && <Icon />}
                                            </Box>
                                            <Typography>{highlightText(faq.question)}</Typography>
                                        </Box>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Typography>{highlightText(faq.answer)}</Typography>
                                    </AccordionDetails>
                                </Accordion>
                            </Card>
                        );
                    })
                ) : (
                    <Typography align="center" color="text.secondary" fontStyle="italic" sx={{ mt: 5 }}>
                        No FAQs found 😕
                    </Typography>
                )}
            </Box>
        </Container>
    );
};

export default FaqsContent;
