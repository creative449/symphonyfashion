"use client";

import { useCart } from "../../../components/CartContext";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { useParams, useRouter } from "next/navigation";

export default function ProductDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { id } = params;
    const { addItem, itemCount } = useCart();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedSize, setSelectedSize] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchProduct() {
            try {
                const response = await fetch(`/api/products/${id}`);
                if (!response.ok) {
                    throw new Error("Product not found");
                }
                const data = await response.json();
                setProduct(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchProduct();
    }, [id]);

    const handleAddToCart = () => {
        if (!selectedSize && product.sizes && product.sizes.length > 0) {
            alert("Please select a size first!");
            return;
        }
        addItem({ ...product, selectedSize });
        alert("Added to cart!");
    };

    if (loading) {
        return (
            <div className="page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#fff', fontSize: '1.2rem' }}>
                Loading product...
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--text)' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '1rem', fontWeight: 700 }}>Product Not Found</h1>
                <Link href="/" className="btn-primary" style={{ textDecoration: "none" }}>Back to Shop</Link>
            </div>
        );
    }

    return (
        <div className="page">
            <Navbar cartCount={itemCount} />
            <main className="container" style={{ padding: "4rem 0", maxWidth: "1200px", margin: "0 auto" }}>

                <div style={{ padding: '0 1rem', marginBottom: '2rem' }}>
                    <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, padding: 0 }}>
                        ← Back to products
                    </button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "start", padding: '0 1rem' }}>
                    {/* Left: Image Gallery */}
                    <div style={{ position: "relative", width: "100%", aspectRatio: "3/4", borderRadius: "12px", overflow: "hidden", background: "#f1f2f4", border: '1px solid var(--border-subtle)' }}>
                        <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            style={{ objectFit: 'cover' }}
                            priority
                        />
                        {(product.isNew || product.isOnSale) && (
                            <div style={{ position: "absolute", top: "1.5rem", left: "1.5rem", display: "flex", gap: "0.5rem" }}>
                                {product.isNew && (
                                    <span style={{ background: "#10b981", color: "white", padding: "0.4rem 0.8rem", borderRadius: "4px", fontSize: "0.75rem", fontWeight: "bold" }}>NEW</span>
                                )}
                                {product.isOnSale && (
                                    <span style={{ background: "var(--accent)", color: "white", padding: "0.4rem 0.8rem", borderRadius: "4px", fontSize: "0.75rem", fontWeight: "bold" }}>SALE</span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right: Details */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

                        <div>
                            <div style={{ fontSize: "0.9rem", color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: "700", marginBottom: "0.5rem" }}>
                                {product.category}
                            </div>
                            <h1 style={{ fontSize: "2.5rem", fontWeight: 800, color: "var(--text)", lineHeight: 1.1, marginBottom: "1rem" }}>{product.name}</h1>
                            <p style={{ fontSize: "1.2rem", color: "var(--muted)", lineHeight: 1.5 }}>
                                {product.tagline}
                            </p>
                        </div>

                        <div style={{ display: "flex", alignItems: "baseline", gap: "1rem", borderBottom: '1px solid var(--border-subtle)', paddingBottom: '2rem' }}>
                            <span style={{ fontSize: "2.2rem", fontWeight: "800", color: "var(--text)" }}>₹{product.price.toLocaleString("en-IN")}</span>
                            {product.originalPrice > product.price && (
                                <span style={{ fontSize: "1.2rem", color: "var(--muted)", textDecoration: "line-through", fontWeight: 400 }}>
                                    ₹{product.originalPrice.toLocaleString("en-IN")}
                                </span>
                            )}
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: '1rem' }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                                <span style={{ fontWeight: "700", fontSize: "1rem", color: "var(--text)" }}>Select Size</span>
                                <button style={{ background: "none", border: "none", color: "var(--accent)", fontWeight: 600, textDecoration: "none", cursor: "pointer", fontSize: "0.85rem" }}>Size Guide</button>
                            </div>

                            <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap", marginBottom: "1rem" }}>
                                {product.sizes?.map(size => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        style={{
                                            width: "3.5rem", height: "3.5rem", borderRadius: "4px",
                                            border: selectedSize === size ? "2px solid var(--accent)" : "1px solid var(--border-subtle)",
                                            background: selectedSize === size ? "var(--accent-soft)" : "#fff",
                                            color: selectedSize === size ? "var(--accent)" : "var(--text)",
                                            fontSize: "1rem", fontWeight: "600", cursor: "pointer", transition: "all 0.2s"
                                        }}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleAddToCart}
                            className="btn-primary"
                            style={{ padding: "1.2rem", fontSize: "1.1rem", justifyContent: "center", width: "100%", marginTop: '1rem' }}
                        >
                            Add to Cart
                        </button>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid rgba(148,163,184,0.2)' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                                <span style={{ fontSize: '1.5rem' }}>🚚</span>
                                <div>
                                    <h4 style={{ fontSize: '0.9rem', marginBottom: '0.2rem' }}>Free Shipping</h4>
                                    <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>On all orders over ₹1,499</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                                <span style={{ fontSize: '1.5rem' }}>🔄</span>
                                <div>
                                    <h4 style={{ fontSize: '0.9rem', marginBottom: '0.2rem' }}>Easy Returns</h4>
                                    <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>7-day hassle-free returns</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
