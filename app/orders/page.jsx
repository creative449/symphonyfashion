"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Link from "next/link";

export default function MyOrders() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.replace("/login");
        }
    }, [status, router]);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await fetch("/api/user/orders");
                if (!res.ok) {
                    throw new Error("Failed to fetch orders.");
                }
                const data = await res.json();
                setOrders(data.orders);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (session?.user) {
            fetchOrders();
        }
    }, [session]);

    if (status === "loading" || loading) {
        return (
            <div className="page" style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
                Loading your orders...
            </div>
        );
    }

    if (!session?.user) {
        return null;
    }

    return (
        <div className="page">
            <Navbar cartCount={0} />
            <main className="container" style={{ padding: "4rem 0", maxWidth: "1000px", margin: "0 auto", minHeight: "70vh" }}>
                <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>My Orders</h1>
                <p style={{ color: "#9ca3af", marginBottom: "3rem" }}>Review and track your recent purchases.</p>

                {error ? (
                    <div style={{ padding: "1rem", background: "#ef444420", color: "#ef4444", borderRadius: "8px" }}>
                        {error}
                    </div>
                ) : orders.length === 0 ? (
                    <div style={{ padding: "3rem", textAlign: "center", background: "#0b1020", borderRadius: "18px", border: "1px solid rgba(51,65,85,0.6)" }}>
                        <p style={{ color: "#9ca3af", fontSize: "1.1rem", marginBottom: "1.5rem" }}>You haven't placed any orders yet.</p>
                        <Link href="/" className="btn-primary" style={{ display: "inline-block" }}>
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                        {orders.map((order) => (
                            <div key={order._id} style={{ background: "#0b1020", borderRadius: "18px", border: "1px solid rgba(51,65,85,0.6)", padding: "1.5rem" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(148,163,184,0.2)", paddingBottom: "1rem", marginBottom: "1rem", flexWrap: "wrap", gap: "1rem" }}>
                                    <div>
                                        <h3 style={{ fontSize: "1.1rem" }}>Order #{order._id.substring(0, 8).toUpperCase()}</h3>
                                        <p style={{ fontSize: "0.85rem", color: "#9ca3af", marginTop: "0.2rem" }}>Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.4rem" }}>
                                        <span style={{
                                            display: "inline-block", padding: "0.3rem 0.8rem", borderRadius: "999px", fontSize: "0.8rem", fontWeight: "600",
                                            background: order.status === "Delivered" ? "#22c55e20" : order.status === "Shipped" ? "#3b82f620" : "#f9731620",
                                            color: order.status === "Delivered" ? "#4ade80" : order.status === "Shipped" ? "#60a5fa" : "#fb923c"
                                        }}>
                                            {order.status}
                                        </span>
                                        <span style={{ fontWeight: "600", fontSize: "1.1rem" }}>₹{order.totalAmount.toLocaleString("en-IN")}</span>
                                    </div>
                                </div>

                                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                    {order.orderItems.map((item, idx) => (
                                        <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                                <div style={{ width: "60px", height: "60px", background: "rgba(15,23,42,0.8)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: "0.8rem", border: "1px solid rgba(148,163,184,0.2)" }}>
                                                    Photo
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: "500", fontSize: "1rem" }}>{item.name}</div>
                                                    <div style={{ fontSize: "0.85rem", color: "#9ca3af", marginTop: "0.2rem" }}>Size: {item.size} • Qty: {item.quantity}</div>
                                                </div>
                                            </div>
                                            <div style={{ fontWeight: "500" }}>₹{item.price.toLocaleString("en-IN")}</div>
                                        </div>
                                    ))}
                                </div>

                                <div style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid rgba(148,163,184,0.2)", fontSize: "0.85rem", color: "#9ca3af" }}>
                                    <strong>Shipping to:</strong> {order.shippingInfo.name}, {order.shippingInfo.address}, {order.shippingInfo.city}, {order.shippingInfo.state} {order.shippingInfo.pin}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
