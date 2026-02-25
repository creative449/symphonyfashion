"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "../../components/Navbar";
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

            <div style={{ padding: "4rem 1rem 2rem 1rem", textAlign: "center", borderBottom: "1px solid rgba(148,163,184,0.1)" }}>
                <h1 style={{ fontSize: "3rem", fontWeight: "800", marginBottom: "0.5rem" }}>
                    Men's Collection
                </h1>
                <p style={{ color: "#9ca3af" }}>Curated essentials for him.</p>
            </div>

            <main className="container" style={{ padding: "3rem 0", flex: 1, maxWidth: "1400px", margin: "0 auto" }}>
                <div style={{ display: "flex", justifyContent: "flex-end", padding: "0 1rem", marginBottom: "2rem" }}>
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

                {loading ? (
                    <div style={{ textAlign: "center", padding: "5rem 0", color: "#64748b" }}>Loading inventory...</div>
                ) : sortedProducts.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "8rem 0", background: "rgba(15,23,42,0.3)", borderRadius: "24px", border: "1px dashed rgba(148,163,184,0.2)", margin: "0 1rem" }}>
                        <h3 style={{ fontSize: "1.5rem", color: "#e2e8f0", marginBottom: "0.5rem" }}>No items found</h3>
                        <p style={{ color: "#9ca3af" }}>Check back soon for new arrivals.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2.5rem', padding: '0 1rem' }}>
                        {sortedProducts.map((product) => (
                            <Link href={`/product/${product._id}`} key={product._id} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column' }} className="group">
                                <div style={{
                                    position: 'relative', width: '100%', aspectRatio: '3/4', borderRadius: '16px', overflow: 'hidden',
                                    background: '#0b1020', border: '1px solid rgba(51,65,85,0.4)', transition: 'all 0.4s ease',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                                }}>
                                    <Image src={product.image} alt={product.name} fill style={{ objectFit: 'cover', transition: 'transform 0.6s ease' }} className="hover-scale" />
                                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', opacity: 0, transition: 'opacity 0.3s ease' }} className="hover-overlay" />
                                    <div style={{
                                        position: 'absolute', bottom: '1rem', left: '50%', transform: 'translate(-50%, 20px)',
                                        background: 'rgba(255,255,255,0.95)', color: '#000', padding: '0.6rem 1.5rem', borderRadius: '99px',
                                        fontSize: '0.85rem', fontWeight: 'bold', letterSpacing: '0.05em', opacity: 0,
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', whiteSpace: 'nowrap'
                                    }} className="quick-view">VIEW DETAILS</div>

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
                                        <span style={{ fontSize: '1.05rem', fontWeight: '700', color: '#f97316', marginLeft: '1rem' }}>₹{product.price.toLocaleString("en-IN")}</span>
                                    </div>
                                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>{product.category || "Designer Series"}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
            <Footer />
            <style dangerouslySetInnerHTML={{
                __html: `
                .group:hover .hover-scale { transform: scale(1.05); }
                .group:hover .hover-overlay { opacity: 1; }
                .group:hover .quick-view { opacity: 1; transform: translate(-50%, 0); }
            ` }} />
        </div>
    );
}
