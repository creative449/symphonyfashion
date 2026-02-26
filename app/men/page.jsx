"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import ProductCard from "../../components/ProductCard";
import Footer from "../../components/Footer";
import { useCart } from "../../components/CartContext";

export default function MenCollection() {
    const { addItem, itemCount } = useCart();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [sortOption, setSortOption] = useState("default");

    useEffect(() => {
        async function fetchProducts() {
            try {
                const response = await fetch('/api/products');
                const data = await response.json();

                // Show Men specific and Unisex items
                setProducts(data.filter(p => p.section === 'men' || p.section === 'unisex'));
            } catch (error) {
                console.error("Error fetching products:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchProducts();
    }, []);

    const sortedProducts = [...products].sort((a, b) => {
        if (sortOption === "price_asc") return a.price - b.price;
        if (sortOption === "price_desc") return b.price - a.price;
        if (sortOption === "newest") return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
        return 0; // Default order
    });

    return (
        <div className="page" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            <Navbar cartCount={itemCount} />

            <main className="container" style={{ padding: "1.5rem 0", flex: 1, maxWidth: "1400px", margin: "0 auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", padding: "0 1rem", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
                    <div>
                        <h1 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text)", margin: 0 }}>Men's Collection</h1>
                        <p style={{ color: "var(--muted)", fontSize: "0.85rem", margin: "0.2rem 0 0 0" }}>Curated essentials for him.</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
                        <span style={{ color: "var(--muted)", fontSize: "0.9rem", fontWeight: 600 }}>Sort By:</span>
                        <select
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value)}
                            style={{
                                background: "#fff", color: "var(--text)", border: "1px solid var(--border-subtle)",
                                padding: "0.6rem 1rem", borderRadius: "4px", fontSize: "0.9rem", cursor: "pointer", outline: "none", fontWeight: 500
                            }}
                        >
                            <option value="default">Featured</option>
                            <option value="newest">New Arrivals</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: "center", padding: "5rem 0", color: "var(--muted)", fontSize: "1.1rem" }}>Loading inventory...</div>
                ) : sortedProducts.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "8rem 0", background: "rgba(255, 63, 108, 0.03)", borderRadius: "8px", border: "1px dashed var(--border-subtle)", margin: "0 1rem" }}>
                        <h3 style={{ fontSize: "1.5rem", color: "var(--text)", marginBottom: "0.5rem" }}>No items found</h3>
                        <p style={{ color: "var(--muted)" }}>Check back soon for new arrivals.</p>
                    </div>
                ) : (
                    <div className="product-grid">
                        {sortedProducts.map((product) => (
                            <ProductCard key={product._id} product={product} onAddToCart={addItem} source="men" />
                        ))}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
