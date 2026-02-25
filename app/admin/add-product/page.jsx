"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import Link from "next/link";

export default function AddProduct() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: "",
        category: "Men • Layering",
        price: "",
        originalPrice: "",
        tagline: "",
        isNew: false,
        isOnSale: false,
        image: "",
        section: "men"
    });

    const [sizes, setSizes] = useState("S,M,L,XL");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    if (status === "loading") return <div className="page" style={{ height: "100vh" }}>Loading...</div>;
    if (!session || session.user.role !== "admin") {
        if (typeof window !== "undefined") router.push("/");
        return null;
    }

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const newProduct = {
                ...formData,
                id: formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                price: Number(formData.price),
                originalPrice: formData.originalPrice ? Number(formData.originalPrice) : null,
                sizes: sizes.split(",").map(s => s.trim()),
                rating: 5.0
            };

            // Since the API expects 'title' and not 'name' due to validation, let's pass 'title'
            const payload = { ...newProduct, title: newProduct.name };

            const res = await fetch("/api/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                throw new Error("Failed to create product");
            }

            alert("Product added successfully!");
            router.push("/admin");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page">
            <Navbar cartCount={0} />
            <main className="container" style={{ padding: "4rem 0", maxWidth: "600px", margin: "0 auto" }}>

                <div style={{ marginBottom: "2rem" }}>
                    <Link href="/admin" style={{ color: "#9ca3af", textDecoration: "none" }}>← Back to Dashboard</Link>
                </div>

                <h1 style={{ fontSize: "2rem", marginBottom: "2rem" }}>Add New Product</h1>

                {error && <div style={{ color: "#ef4444", background: "rgba(239,68,68,0.1)", padding: "1rem", borderRadius: "8px", marginBottom: "1.5rem" }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <label style={{ color: "#9ca3af", fontSize: "0.9rem" }}>Product Name</label>
                        <input required type="text" name="name" value={formData.name} onChange={handleChange}
                            style={{ padding: "0.8rem", borderRadius: "8px", background: "#0b1020", border: "1px solid rgba(148,163,184,0.3)", color: "white" }} />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            <label style={{ color: "#9ca3af", fontSize: "0.9rem" }}>Price (₹)</label>
                            <input required type="number" name="price" value={formData.price} onChange={handleChange}
                                style={{ padding: "0.8rem", borderRadius: "8px", background: "#0b1020", border: "1px solid rgba(148,163,184,0.3)", color: "white" }} />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            <label style={{ color: "#9ca3af", fontSize: "0.9rem" }}>Original Price (optional)</label>
                            <input type="number" name="originalPrice" value={formData.originalPrice} onChange={handleChange}
                                style={{ padding: "0.8rem", borderRadius: "8px", background: "#0b1020", border: "1px solid rgba(148,163,184,0.3)", color: "white" }} />
                        </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <label style={{ color: "#9ca3af", fontSize: "0.9rem" }}>Tagline</label>
                        <input required type="text" name="tagline" value={formData.tagline} onChange={handleChange}
                            style={{ padding: "0.8rem", borderRadius: "8px", background: "#0b1020", border: "1px solid rgba(148,163,184,0.3)", color: "white" }} />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            <label style={{ color: "#9ca3af", fontSize: "0.9rem" }}>Section</label>
                            <select name="section" value={formData.section} onChange={handleChange}
                                style={{ padding: "0.8rem", borderRadius: "8px", background: "#0b1020", border: "1px solid rgba(148,163,184,0.3)", color: "white" }}>
                                <option value="men">Men</option>
                                <option value="women">Women</option>
                                <option value="unisex">Unisex (Both Men & Women)</option>
                            </select>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            <label style={{ color: "#9ca3af", fontSize: "0.9rem" }}>Category Label</label>
                            <input required type="text" name="category" value={formData.category} onChange={handleChange}
                                style={{ padding: "0.8rem", borderRadius: "8px", background: "#0b1020", border: "1px solid rgba(148,163,184,0.3)", color: "white" }} />
                        </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <label style={{ color: "#9ca3af", fontSize: "0.9rem" }}>Image URL</label>
                        <input required type="text" name="image" placeholder="https://..." value={formData.image} onChange={handleChange}
                            style={{ padding: "0.8rem", borderRadius: "8px", background: "#0b1020", border: "1px solid rgba(148,163,184,0.3)", color: "white" }} />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <label style={{ color: "#9ca3af", fontSize: "0.9rem" }}>Sizes (comma separated)</label>
                        <input required type="text" value={sizes} onChange={(e) => setSizes(e.target.value)}
                            style={{ padding: "0.8rem", borderRadius: "8px", background: "#0b1020", border: "1px solid rgba(148,163,184,0.3)", color: "white" }} />
                    </div>

                    <div style={{ display: "flex", gap: "2rem", marginTop: "1rem" }}>
                        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                            <input type="checkbox" name="isNew" checked={formData.isNew} onChange={handleChange} />
                            <span>Mark as "New Drop"</span>
                        </label>
                        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                            <input type="checkbox" name="isOnSale" checked={formData.isOnSale} onChange={handleChange} />
                            <span>Mark as "On Sale"</span>
                        </label>
                    </div>

                    <button disabled={loading} type="submit" className="btn-primary" style={{ padding: "1rem", marginTop: "1rem", justifyContent: "center" }}>
                        {loading ? "Saving..." : "Create Product"}
                    </button>

                </form>

            </main>
            <Footer />
        </div>
    );
}
