"use client";
import {
    Box, Container, Typography, Grid, Card, CardMedia, CardContent, Chip, Breadcrumbs, Link, Rating, Button
} from "@mui/material";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CategoryIcon from '@mui/icons-material/Category';
import { MailOutline } from "@mui/icons-material";
import Loading from "@/app/loading";

const SellerPage = () => {
    const { id } = useParams();
    const [seller, setSeller] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_sellers = "http://localhost:5000/sellers";
    const API_products = "http://localhost:5000/products";

    useEffect(() => {
        const fetchSellerData = async () => {
            try {
                await new Promise((resolve) => setTimeout(resolve, 3000));
                const [sellersRes, productsRes] = await Promise.all([
                    fetch(API_sellers),
                    fetch(API_products)
                ]);

                if (!sellersRes.ok || !productsRes.ok) throw new Error("Failed to fetch data");

                const sellersData = await sellersRes.json();
                const productsData = await productsRes.json();

                const selectedSeller = sellersData.find(s => String(s.id) === id);
                if (!selectedSeller) {
                    setSeller(null);
                    return;
                }

                const sellerProducts = productsData.filter(p => p.sellerId === selectedSeller.id);
                setSeller({ ...selectedSeller, products: sellerProducts });
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchSellerData();
    }, [id]);

    if (loading) return(
        <>
            <Loading />
        </>
    );
    if (error) return <Typography align="center" sx={{ mt: 10, color: "red" }}>{error}</Typography>;
    if (!seller) return <Typography align="center" sx={{ mt: 10 }}>Seller not found</Typography>;

    return (
        <Container sx={{ py: 5 }}>
            {/* Breadcrumb */}
            <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
                <Link underline="hover" color="inherit" href="/">Home</Link>
                <Link underline="hover" color="inherit" href="/sellers">Sellers</Link>
                <Typography color="text.primary">{seller.name}</Typography>
            </Breadcrumbs>

            {/* Seller Header */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    p: 4,
                    mb: 6,
                    backgroundColor: "#f4f6f8",
                    borderRadius: 3,
                    flexWrap: "wrap",
                    boxShadow: 1
                }}
            >
                {/* Seller Image */}
                {seller.image && (
                    <Box
                        component="img"
                        src={seller.image}
                        alt={seller.name}
                        sx={{ width: 140, height: 140, borderRadius: "50%", objectFit: "cover", border: "3px solid #1976d2" }}
                    />
                )}

                {/* Seller Info */}
                <Box sx={{ flex: 1 }}>
                    <Typography variant="h4" fontWeight="bold" display="flex" alignItems="center" gap={1}>
                        {seller.storeName} ({seller.name})
                        {seller.verified && <CheckCircleIcon sx={{ color: "#4caf50", fontSize: 28 }} />}
                    </Typography>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 1, flexWrap: "wrap" }}>
                        <Chip icon={<CategoryIcon />} label={seller.mainCategory} color="primary" />
                        <Rating value={seller.rating} precision={0.1} readOnly />
                        <Typography variant="body2" color="text.secondary">{seller.products.length} Products</Typography>
                    </Box>

                    {/* Contact & Location */}
                    <Box sx={{ mt: 2, display: "flex", gap: 3, flexWrap: "wrap" }}>
                        <Box display="flex" alignItems="center" gap={1}>
                            <EmailIcon sx={{ color: "gray" }} />
                            <Typography variant="body2">{seller.email}</Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1}>
                            <LocationOnIcon sx={{ color: "gray" }} />
                            <Typography variant="body2">{seller.location}</Typography>
                        </Box>
                    </Box>

                    {/* Description */}
                    {seller.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, maxWidth: 600 }}>
                            {seller.description}
                        </Typography>
                    )}

                    <Button variant="contained" color="primary" sx={{ mt: 3 }}>
                        <MailOutline className="me-2" /> Contact Seller
                    </Button>
                </Box>
            </Box>

            {/* Products Grid */}
            {/* Products Grid */}
            <Grid container spacing={3}>
                {seller.products.length > 0 ? seller.products.map(product => (
                    <Grid item xs={12} sm={6} md={4} key={product.id}>
                        <Card className="relative flex flex-col"
                            sx={{
                                height: "100%",
                                transition: "transform 0.3s, box-shadow 0.3s",
                                "&:hover": { transform: "translateY(-8px)", boxShadow: 8 }
                            }}
                        >
                            {product.category && (
                                <Chip
                                    label={product.category}
                                    size="small"
                                    className="absolute top-2 left-2 z-50"
                                    sx={{ mt: 1, backgroundColor: "#0587A7", color: "#fff" }}
                                />
                            )}
                            {product.image && (
                                <CardMedia
                                    component="img"
                                    image={product.image}
                                    alt={product.name}
                                    sx={{ height: 220, objectFit: "contain" }}
                                />
                            )}
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Typography variant="h6" fontWeight="medium">{product.name}</Typography>

                                {/* Price & Sale */}
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                                    {product.salePrice && product.salePrice > 0 ? (
                                        <>
                                            <Typography variant="subtitle1" color="text.secondary" sx={{ textDecoration: "line-through" }}>
                                                ${product.price.toLocaleString()}
                                            </Typography>
                                            <Typography variant="subtitle1" color="primary">
                                                ${product.salePrice.toLocaleString()}
                                            </Typography>
                                        </>
                                    ) : (
                                        <Typography variant="subtitle1" color="primary">
                                            ${product.price.toLocaleString()}
                                        </Typography>
                                    )}
                                </Box>

                                {/* Category */}


                                {/* Stock */}
                                <Typography variant="body2" color={product.stock > 0 ? "green" : "error"} sx={{ mt: 1 }}>
                                    {product.stock > 0 ? `In Stock: ${product.stock}` : "Out of Stock"}
                                </Typography>

                                {/* Description */}
                                {product.description && (
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                        {product.description.length > 80
                                            ? product.description.substring(0, 80) + "..."
                                            : product.description
                                        }
                                    </Typography>
                                )}
                            </CardContent>

                            <Box sx={{ p: 2 }}>
                                <a href="" className="bg-blue-500 p-2 rounded text-white" variant="contained" fullWidth color="primary">
                                    View Product
                                </a>
                            </Box>
                        </Card>
                    </Grid>
                )) : (
                    <Typography variant="body1" sx={{ mt: 3 }}>
                        This seller has no products.
                    </Typography>
                )}
            </Grid>

        </Container>
    );
};

export default SellerPage;
