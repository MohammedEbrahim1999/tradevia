"use client";
import React, { useState } from "react";
import { Container, Typography, Accordion, AccordionSummary, AccordionDetails, Box, Stack, Divider, Button,} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SecurityIcon from "@mui/icons-material/Security";
import InfoIcon from "@mui/icons-material/Info";
import PeopleIcon from "@mui/icons-material/People";
import ShareIcon from "@mui/icons-material/Share";
import UpdateIcon from "@mui/icons-material/Update";
import ContactMailIcon from "@mui/icons-material/ContactMail";
export default function PrivacyPolicyPage({ policySections }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const handleNext = () => {
        if (currentIndex < policySections.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };
    const handlePrevious = ({ }) => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };
    const currentSection = policySections[currentIndex];
    const iconMap = {
        SecurityIcon: SecurityIcon,
        InfoIcon: InfoIcon,
        PeopleIcon: PeopleIcon,
        ShareIcon: ShareIcon,
        UpdateIcon: UpdateIcon,
        ContactMailIcon: ContactMailIcon
    };
    const IconComponent = iconMap[currentSection.icon];
    return (
        <Container maxWidth="md" sx={{ py: 6 }}>
            <Divider sx={{ mb: 4 }} />
            {/* Single Accordion Section */}
            <Accordion elevation={3} sx={{ borderRadius: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        {IconComponent && <IconComponent color="primary" />}

                        <Typography variant="h6" fontWeight={600}>
                            {currentSection.title}
                        </Typography>
                    </Stack>
                </AccordionSummary>
                <AccordionDetails>
                    <Typography variant="body1" color="text.secondary">
                        {currentSection.content}
                    </Typography>
                </AccordionDetails>
            </Accordion>
            {/* Navigation Buttons */}
            <Stack direction="row" justifyContent="space-between" mt={3}>
                <Button
                    variant="contained"
                    onClick={handlePrevious}
                    disabled={currentIndex === 0}
                >
                    Previous
                </Button>
                <Button
                    variant="contained"
                    onClick={handleNext}
                    disabled={currentIndex === policySections.length - 1}
                >
                    Next
                </Button>
            </Stack>
            {/* Pagination Indicator */}
            <Typography variant="body2" color="text.secondary" mt={1} align="center">
                {currentIndex + 1} of {policySections.length}
            </Typography>
        </Container>
    );
}