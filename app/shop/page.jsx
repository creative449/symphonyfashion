"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import ProductCard from "../../components/ProductCard";
import { useCart } from "../../components/CartContext";

function ShopContent() {
    const { addItem, itemCount } = useCart();
    const searchParams = useSearchParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter & Sort States
    const [searchQuery, setSearchQuery] = useState("");
    const defaultCategory = searchParams.get("category") || "All";
    const [categoryFilter, setCategoryFilter] = useState(defaultCategory);
    const [sortOption, setSortOption] = useState("default");

    useEffect(() => {
        async function fetchProducts() {
            try {
                const response = await fetch('/api/products');
                const data = await response.json();
                setProducts(data);
            } catch (error) {
                console.error("Error fetching products:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchProducts();
    }, []);

    // Derived filtered arrays
    const filteredAndSortedProducts = products
        .filter((product) => {
            // Category match
            if (categoryFilter !== "All") {
                const searchCat = categoryFilter.toLowerCase();
                const isMatch = product.section === searchCat || product.category?.toLowerCase() === searchCat;
                const isUnisex = product.section === "unisex" && (searchCat === "men" || searchCat === "women");

                if (!isMatch && !isUnisex) {
                    return false;
                }
            }
            // Search match
            if (searchQuery) {
                const searchLower = searchQuery.toLowerCase();
                const nameMatch = product.name.toLowerCase().includes(searchLower);
                const tagMatch = product.tagline && product.tagline.toLowerCase().includes(searchLower);
                if (!nameMatch && !tagMatch) return false;
            }
            return true;
        })
        .sort((a, b) => {
            if (sortOption === "price_asc") return a.price - b.price;
            if (sortOption === "price_desc") return b.price - a.price;
            if (sortOption === "newest") return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
            return 0; // Default order
        });

    return (
        <div className="page" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            <Navbar cartCount={itemCount} />

            {/* Dynamic Storefront Header */}
            <div style={{ background: "linear-gradient(180deg, #0b1020 0%, #050810 100%)", padding: "6rem 1rem 3rem 1rem", textAlign: "center", borderBottom: "1px solid rgba(148,163,184,0.1)" }}>
                <h1 style={{ fontSize: "3.5rem", fontWeight: "800", marginBottom: "1rem", letterSpacing: "-0.02em", background: "linear-gradient(to right, #ffffff, #9ca3af)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    The Archive
                </h1>
                <p style={{ color: "#9ca3af", fontSize: "1.1rem", maxWidth: "600px", margin: "0 auto 3rem auto", lineHeight: "1.6" }}>
                    Explore our complete collection of future-forward streetwear. Engineered for the modern realm.
                </p>

                {/* Search Bar Container */}
                <div style={{ maxWidth: "600px", margin: "0 auto", position: "relative" }}>
                    <span style={{ position: "absolute", left: "1.2rem", top: "50%", transform: "translateY(-50%)", fontSize: "1.2rem", color: "#64748b" }}>🔍</span>
                    <input
                        type="text"
                        placeholder="Search for silhouettes, materials, or collections..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: "100%", padding: "1.2rem 1.2rem 1.2rem 3.5rem", borderRadius: "99px", background: "rgba(15,23,42,0.8)",
                            border: "1px solid rgba(148,163,184,0.2)", color: "white", fontSize: "1rem", outline: "none",
                            transition: "all 0.3s ease", boxShadow: "0 4px 30px rgba(0, 0, 0, 0.5)"
                        }}
                    />
                </div>
            </div>

            <main className="container" style={{ padding: "3rem 0", flex: 1, maxWidth: "1400px", margin: "0 auto" }}>

                {/* Advanced Filtering Toolbar */}
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", marginBottom: "3rem", gap: "1.5rem", padding: "0 1rem" }}>

                    {/* Category Pills */}
                    <div style={{ display: "flex", gap: "0.8rem", overflowX: "auto", paddingBottom: "0.5rem", scrollbarWidth: "none" }}>
                        {["All", "Men", "Women", "Accessories"].map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setCategoryFilter(cat)}
                                style={{
                                    padding: "0.6rem 1.5rem", borderRadius: "99px",
                                    border: categoryFilter === cat ? "1px solid #f97316" : "1px solid rgba(148,163,184,0.3)",
                                    background: categoryFilter === cat ? "rgba(249,115,22,0.1)" : "transparent",
                                    color: categoryFilter === cat ? "#f97316" : "#cbd5e1",
                                    fontWeight: "600", fontSize: "0.9rem", cursor: "pointer", transition: "all 0.2s",
                                    whiteSpace: "nowrap"
                                }}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Sorting Dropdown */}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
                        <span style={{ color: "#9ca3af", fontSize: "0.9rem" }}>Sort By:</span>
                        <select
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value)}
                            style={{
                                background: "rgba(15,23,42,0.8)", color: "white", border: "1px solid rgba(148,163,184,0.3)",
                                padding: "0.6rem 1rem", borderRadius: "8px", fontSize: "0.9rem", cursor: "pointer", outline: "none"
                            }}
                        >
                            <option value="default">Featured</option>
                            <option value="newest">New Arrivals</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                        </select>
                    </div>
                </div>

                {/* Product Grid */}
                {loading ? (
                    <div style={{ textAlign: "center", padding: "5rem 0", color: "#64748b" }}>Loading inventory...</div>
                ) : filteredAndSortedProducts.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "8rem 0", background: "rgba(15,23,42,0.3)", borderRadius: "24px", border: "1px dashed rgba(148,163,184,0.2)", margin: "0 1rem" }}>
                        <span style={{ fontSize: "3rem", display: "block", marginBottom: "1rem" }}>🛰️</span>
                        <h3 style={{ fontSize: "1.5rem", color: "#e2e8f0", marginBottom: "0.5rem" }}>No signals found</h3>
                        <p style={{ color: "#9ca3af" }}>We couldn't find any items matching your exact search filters.</p>
                        <button onClick={() => { setSearchQuery(""); setCategoryFilter("All"); }} style={{ marginTop: "1.5rem", background: "none", border: "1px solid #3b82f6", color: "#3b82f6", padding: "0.6rem 1.5rem", borderRadius: "99px", cursor: "pointer" }}>Reset Filters</button>
                    </div>
                ) : (
                    <div className="product-grid">
                        {filteredAndSortedProducts.map((product) => (
                            <ProductCard key={product._id} product={product} onAddToCart={addItem} />
                        ))}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}

export default function Shop() {
    return (
        <Suspense fallback={
            <div className="page" style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
                Loading The Archive...
            </div>
        }>
            <ShopContent />
        </Suspense>
    );
}
