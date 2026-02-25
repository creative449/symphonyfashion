"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
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
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2.5rem', padding: '0 1rem' }}>
                        {filteredAndSortedProducts.map((product) => (
                            <Link
                                href={`/product/${product._id}`}
                                key={product._id}
                                style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column' }}
                                className="group"
                            >
                                <div style={{
                                    position: 'relative', width: '100%', aspectRatio: '3/4',
                                    borderRadius: '16px', overflow: 'hidden', background: '#0b1020',
                                    border: '1px solid rgba(51,65,85,0.4)', transition: 'all 0.4s ease',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                                }}>
                                    <Image
                                        src={product.image}
                                        alt={product.name}
                                        fill
                                        style={{ objectFit: 'cover', transition: 'transform 0.6s ease' }}
                                        className="hover-scale"
                                    />

                                    {/* Hover Overlay */}
                                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', opacity: 0, transition: 'opacity 0.3s ease' }} className="hover-overlay" />

                                    {/* Quick View Button simulated on hover */}
                                    <div style={{
                                        position: 'absolute', bottom: '1rem', left: '50%', transform: 'translate(-50%, 20px)',
                                        background: 'rgba(255,255,255,0.95)', color: '#000', padding: '0.6rem 1.5rem',
                                        borderRadius: '99px', fontSize: '0.85rem', fontWeight: 'bold', letterSpacing: '0.05em',
                                        opacity: 0, transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', whiteSpace: 'nowrap'
                                    }} className="quick-view">
                                        VIEW DETAILS
                                    </div>

                                    {(product.isNew || product.isOnSale) && (
                                        <div style={{ position: 'absolute', top: '1rem', left: '1rem', display: 'flex', gap: '0.5rem', zIndex: 2 }}>
                                            {product.isNew && (
                                                <span style={{ background: '#3b82f6', color: 'white', padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold', letterSpacing: '0.05em' }}>NEW</span>
                                            )}
                                            {product.isOnSale && (
                                                <span style={{ background: '#ef4444', color: 'white', padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold', letterSpacing: '0.05em' }}>SALE</span>
                                            )}
                                        </div>
                                    )}
                                    {product.section === "unisex" && (
                                        <div style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 2 }}>
                                            <span style={{ background: '#8b5cf6', color: 'white', padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold', letterSpacing: '0.05em' }}>UNISEX</span>
                                        </div>
                                    )}
                                </div>
                                <div style={{ marginTop: '1.2rem', padding: '0 0.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.3rem' }}>
                                        <h3 style={{ fontSize: '1.05rem', color: '#f8fafc', fontWeight: '600', m: 0, lineHeight: 1.3 }}>{product.name}</h3>
                                        <span style={{ fontSize: '1.05rem', fontWeight: '700', color: '#f97316', marginLeft: '1rem' }}>
                                            ₹{product.price.toLocaleString("en-IN")}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
                                        {product.category || "Designer Series"}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
            <Footer />

            {/* Inline CSS to handle hover states since standard React inline styles dont support pseudos well without emotion/styled-components */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .group:hover .hover-scale { transform: scale(1.05); }
                .group:hover .hover-overlay { opacity: 1; }
                .group:hover .quick-view { opacity: 1; transform: translate(-50%, 0); }
            `}} />
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
