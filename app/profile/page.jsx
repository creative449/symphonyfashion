"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Link from "next/link";

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Tab State: "details", "addresses", "wishlist"
    const [activeTab, setActiveTab] = useState("details");

    // Form States
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    // Address State
    const [addresses, setAddresses] = useState([]);
    const [newAddress, setNewAddress] = useState({ title: "", address: "", city: "", state: "", pin: "" });
    const [showAddressForm, setShowAddressForm] = useState(false);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.replace("/login");
        }
    }, [status, router]);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch("/api/user/profile");
                if (res.ok) {
                    const data = await res.json();
                    setUser(data.user);
                    setName(data.user.name || "");
                    setPhone(data.user.phone || "");
                    setEmail(data.user.email || "");
                    setAddresses(data.user.addresses || []);
                }
            } catch (err) {
                console.error("Failed to load profile", err);
            } finally {
                setLoading(false);
            }
        };

        if (session?.user) {
            fetchProfile();
        }
    }, [session]);

    const handleSaveDetails = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage("");

        try {
            const res = await fetch("/api/user/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, phone })
            });

            if (res.ok) {
                setMessage("Profile updated successfully!");
                setTimeout(() => setMessage(""), 3000);
            } else {
                setMessage("Failed to update profile.");
            }
        } catch (error) {
            setMessage("An error occurred.");
        } finally {
            setSaving(false);
        }
    };

    const handleSaveAddress = async (e) => {
        e.preventDefault();
        setSaving(true);
        const updatedAddresses = [...addresses, newAddress];

        try {
            const res = await fetch("/api/user/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ addresses: updatedAddresses })
            });

            if (res.ok) {
                setAddresses(updatedAddresses);
                setShowAddressForm(false);
                setNewAddress({ title: "", address: "", city: "", state: "", pin: "" });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteAddress = async (index) => {
        const updatedAddresses = addresses.filter((_, i) => i !== index);
        setAddresses(updatedAddresses);
        try {
            await fetch("/api/user/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ addresses: updatedAddresses })
            });
        } catch (err) {
            console.error(err);
        }
    };

    if (status === "loading" || loading) {
        return <div className="page" style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>Loading your profile...</div>;
    }

    if (!session?.user || !user) {
        return null;
    }

    return (
        <div className="page">
            <Navbar cartCount={0} />
            <main className="container" style={{ padding: "4rem 0", maxWidth: "1000px", margin: "0 auto", minHeight: "75vh" }}>
                <h1 style={{ fontSize: "2rem", marginBottom: "2rem" }}>Hello, {user.name}</h1>

                <div style={{ display: "grid", gridTemplateColumns: "250px 1fr", gap: "3rem" }}>

                    {/* Sidebar Nav */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <button onClick={() => setActiveTab("details")} style={{ padding: "1rem", borderRadius: "12px", background: activeTab === "details" ? "linear-gradient(90deg, #f97316, #fb923c)" : "transparent", color: activeTab === "details" ? "#fff" : "#9ca3af", border: "none", textAlign: "left", cursor: "pointer", fontWeight: "500", fontSize: "1rem", transition: "all 0.2s" }}>
                            Account Details
                        </button>
                        <button onClick={() => setActiveTab("addresses")} style={{ padding: "1rem", borderRadius: "12px", background: activeTab === "addresses" ? "linear-gradient(90deg, #f97316, #fb923c)" : "transparent", color: activeTab === "addresses" ? "#fff" : "#9ca3af", border: "none", textAlign: "left", cursor: "pointer", fontWeight: "500", fontSize: "1rem", transition: "all 0.2s" }}>
                            Address Book
                        </button>
                        <button onClick={() => setActiveTab("wishlist")} style={{ padding: "1rem", borderRadius: "12px", background: activeTab === "wishlist" ? "linear-gradient(90deg, #f97316, #fb923c)" : "transparent", color: activeTab === "wishlist" ? "#fff" : "#9ca3af", border: "none", textAlign: "left", cursor: "pointer", fontWeight: "500", fontSize: "1rem", transition: "all 0.2s" }}>
                            Wishlist
                        </button>
                    </div>

                    {/* Content Area */}
                    <div style={{ background: "#0b1020", borderRadius: "18px", padding: "2.5rem", border: "1px solid rgba(51,65,85,0.6)" }}>

                        {activeTab === "details" && (
                            <div>
                                <h2 style={{ fontSize: "1.5rem", marginBottom: "1.5rem" }}>Account Details</h2>
                                {message && <div style={{ color: "#22c55e", background: "#22c55e20", padding: "1rem", borderRadius: "8px", marginBottom: "1.5rem" }}>{message}</div>}

                                <form onSubmit={handleSaveDetails} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                                    <div>
                                        <label style={{ display: "block", marginBottom: "0.5rem", color: "#9ca3af", fontSize: "0.9rem" }}>Full Name</label>
                                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required style={{ width: "100%", padding: "0.8rem", borderRadius: "8px", background: "rgba(15,23,42,0.8)", border: "1px solid rgba(148,163,184,0.3)", color: "white" }} />
                                    </div>
                                    <div>
                                        <label style={{ display: "block", marginBottom: "0.5rem", color: "#9ca3af", fontSize: "0.9rem" }}>Email Address (Read Only)</label>
                                        <input type="email" value={email} readOnly style={{ width: "100%", padding: "0.8rem", borderRadius: "8px", background: "rgba(15,23,42,0.3)", border: "1px solid rgba(148,163,184,0.1)", color: "#64748b", cursor: "not-allowed" }} />
                                    </div>
                                    <div>
                                        <label style={{ display: "block", marginBottom: "0.5rem", color: "#9ca3af", fontSize: "0.9rem" }}>Phone Number</label>
                                        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 99999 99999" style={{ width: "100%", padding: "0.8rem", borderRadius: "8px", background: "rgba(15,23,42,0.8)", border: "1px solid rgba(148,163,184,0.3)", color: "white" }} />
                                    </div>
                                    <button disabled={saving} type="submit" className="btn-primary" style={{ marginTop: "1rem", alignSelf: "flex-start" }}>
                                        {saving ? "Saving..." : "Save Changes"}
                                    </button>
                                </form>
                            </div>
                        )}

                        {activeTab === "addresses" && (
                            <div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                                    <h2 style={{ fontSize: "1.5rem" }}>Address Book</h2>
                                    {!showAddressForm && (
                                        <button onClick={() => setShowAddressForm(true)} style={{ background: "transparent", color: "#f97316", border: "1px solid #f97316", padding: "0.5rem 1rem", borderRadius: "8px", cursor: "pointer" }}>
                                            + Add New Address
                                        </button>
                                    )}
                                </div>

                                {showAddressForm ? (
                                    <form onSubmit={handleSaveAddress} style={{ background: "rgba(15,23,42,0.8)", padding: "1.5rem", borderRadius: "12px", border: "1px solid rgba(148,163,184,0.2)", marginBottom: "2rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                                        <div style={{ display: "flex", gap: "1rem" }}>
                                            <div style={{ flex: 1 }}>
                                                <label style={{ display: "block", marginBottom: "0.5rem", color: "#9ca3af", fontSize: "0.85rem" }}>Address Title (e.g., Home, Office)</label>
                                                <input type="text" value={newAddress.title} onChange={e => setNewAddress({ ...newAddress, title: e.target.value })} required style={{ width: "100%", padding: "0.8rem", borderRadius: "8px", background: "#0b1020", border: "1px solid rgba(148,163,184,0.3)", color: "white" }} />
                                            </div>
                                        </div>
                                        <div>
                                            <label style={{ display: "block", marginBottom: "0.5rem", color: "#9ca3af", fontSize: "0.85rem" }}>Street Address</label>
                                            <input type="text" value={newAddress.address} onChange={e => setNewAddress({ ...newAddress, address: e.target.value })} required style={{ width: "100%", padding: "0.8rem", borderRadius: "8px", background: "#0b1020", border: "1px solid rgba(148,163,184,0.3)", color: "white" }} />
                                        </div>
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                                            <div>
                                                <label style={{ display: "block", marginBottom: "0.5rem", color: "#9ca3af", fontSize: "0.85rem" }}>City</label>
                                                <input type="text" value={newAddress.city} onChange={e => setNewAddress({ ...newAddress, city: e.target.value })} required style={{ width: "100%", padding: "0.8rem", borderRadius: "8px", background: "#0b1020", border: "1px solid rgba(148,163,184,0.3)", color: "white" }} />
                                            </div>
                                            <div>
                                                <label style={{ display: "block", marginBottom: "0.5rem", color: "#9ca3af", fontSize: "0.85rem" }}>State</label>
                                                <input type="text" value={newAddress.state} onChange={e => setNewAddress({ ...newAddress, state: e.target.value })} required style={{ width: "100%", padding: "0.8rem", borderRadius: "8px", background: "#0b1020", border: "1px solid rgba(148,163,184,0.3)", color: "white" }} />
                                            </div>
                                            <div>
                                                <label style={{ display: "block", marginBottom: "0.5rem", color: "#9ca3af", fontSize: "0.85rem" }}>PIN</label>
                                                <input type="text" value={newAddress.pin} onChange={e => setNewAddress({ ...newAddress, pin: e.target.value })} required style={{ width: "100%", padding: "0.8rem", borderRadius: "8px", background: "#0b1020", border: "1px solid rgba(148,163,184,0.3)", color: "white" }} />
                                            </div>
                                        </div>
                                        <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                                            <button disabled={saving} type="submit" className="btn-primary">{saving ? "Saving..." : "Save Address"}</button>
                                            <button type="button" onClick={() => setShowAddressForm(false)} style={{ background: "transparent", border: "none", color: "#9ca3af", cursor: "pointer" }}>Cancel</button>
                                        </div>
                                    </form>
                                ) : addresses.length === 0 ? (
                                    <p style={{ color: "#9ca3af" }}>You haven't saved any addresses yet.</p>
                                ) : (
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                                        {addresses.map((addr, idx) => (
                                            <div key={idx} style={{ padding: "1.5rem", border: "1px solid rgba(148,163,184,0.2)", borderRadius: "12px", background: "rgba(15,23,42,0.4)", position: "relative" }}>
                                                <h3 style={{ fontSize: "1.1rem", marginBottom: "0.5rem", color: "#e2e8f0" }}>{addr.title}</h3>
                                                <p style={{ color: "#9ca3af", fontSize: "0.9rem", lineHeight: "1.5" }}>
                                                    {addr.address}<br />
                                                    {addr.city}, {addr.state} {addr.pin}
                                                </p>
                                                <button onClick={() => handleDeleteAddress(idx)} style={{ position: "absolute", top: "1.5rem", right: "1.5rem", background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "0.85rem", textDecoration: "underline" }}>Remove</button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "wishlist" && (
                            <div>
                                <h2 style={{ fontSize: "1.5rem", marginBottom: "1.5rem" }}>My Wishlist</h2>
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "3rem", background: "rgba(15,23,42,0.4)", borderRadius: "12px", border: "1px dashed rgba(148,163,184,0.3)", textAlign: "center" }}>
                                    <span style={{ fontSize: "3rem", marginBottom: "1rem" }}>🤍</span>
                                    <h3 style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>Your wishlist is empty</h3>
                                    <p style={{ color: "#9ca3af", marginBottom: "1.5rem" }}>Save items you love and buy them later.</p>
                                    <Link href="/" className="btn-primary">Browse Collections</Link>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

