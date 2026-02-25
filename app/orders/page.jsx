"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Link from "next/link";
import { useCart } from "../../components/CartContext";

export default function MyOrders() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { addItem } = useCart();
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

    const handleBuyAgain = (item) => {
        addItem({
            id: item.productId,
            name: item.name,
            price: item.price,
            size: item.size || "M",
        });
        alert(`${item.name} added back to cart!`);
    };

    const handleCancelOrder = async (orderId) => {
        if (!confirm("Are you sure you want to cancel this order?")) return;
        try {
            const res = await fetch("/api/user/orders", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId, action: "cancel" })
            });
            const data = await res.json();
            if (res.ok) {
                setOrders(orders.map(o => o._id === orderId ? { ...o, status: "Cancelled" } : o));
                alert("Order cancelled successfully.");
            } else {
                alert(data.message || "Failed to cancel order.");
            }
        } catch (err) {
            console.error(err);
            alert("Error cancelling the order.");
        }
    };

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
                            <div key={order._id} style={{ background: "#0b1020", borderRadius: "18px", border: "1px solid rgba(51,65,85,0.6)", padding: "2rem", overflow: "hidden", position: "relative" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(148,163,184,0.2)", paddingBottom: "1.5rem", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
                                    <div>
                                        <h3 style={{ fontSize: "1.2rem", fontWeight: 700 }}>Order #{order._id.substring(0, 8).toUpperCase()}</h3>
                                        <p style={{ fontSize: "0.9rem", color: "#9ca3af", marginTop: "0.4rem" }}>Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem" }}>
                                        <span style={{ fontWeight: "700", fontSize: "1.3rem", color: "#f97316" }}>₹{order.totalAmount.toLocaleString("en-IN")}</span>
                                        <button style={{ background: "transparent", border: "1px solid rgba(148,163,184,0.4)", color: "#e2e8f0", padding: "0.4rem 0.8rem", borderRadius: "6px", fontSize: "0.8rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                                            <span>📄</span> Download Invoice
                                        </button>
                                    </div>
                                </div>

                                {/* Tracking Timeline */}
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2.5rem", position: "relative", padding: "0 1rem" }}>
                                    <div style={{ position: "absolute", top: "50%", left: "10%", right: "10%", height: "3px", background: "rgba(148,163,184,0.2)", zIndex: 0, transform: "translateY(-50%)" }}>
                                        <div style={{ height: "100%", background: "#22c55e", width: order.status === "Processing" ? "25%" : order.status === "Shipped" ? "75%" : "100%", transition: "width 0.5s ease" }} />
                                    </div>

                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 1, gap: "0.5rem" }}>
                                        <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "#22c55e", border: "3px solid #0b1020" }} />
                                        <span style={{ fontSize: "0.8rem", color: "#e2e8f0", fontWeight: 600 }}>Processing</span>
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 1, gap: "0.5rem" }}>
                                        <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: order.status === "Shipped" || order.status === "Delivered" ? "#22c55e" : "rgba(148,163,184,0.3)", border: "3px solid #0b1020" }} />
                                        <span style={{ fontSize: "0.8rem", color: order.status === "Shipped" || order.status === "Delivered" ? "#e2e8f0" : "#9ca3af", fontWeight: 600 }}>Shipped</span>
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 1, gap: "0.5rem" }}>
                                        <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: order.status === "Delivered" ? "#22c55e" : "rgba(148,163,184,0.3)", border: "3px solid #0b1020" }} />
                                        <span style={{ fontSize: "0.8rem", color: order.status === "Delivered" ? "#e2e8f0" : "#9ca3af", fontWeight: 600 }}>Delivered</span>
                                    </div>
                                    {order.status === "Cancelled" && (
                                        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15,23,42,0.8)", zIndex: 5, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(2px)", borderRadius: "12px" }}>
                                            <span style={{ background: "#ef4444", color: "white", padding: "0.5rem 1.5rem", borderRadius: "99px", fontWeight: "bold", fontSize: "1.2rem", boxShadow: "0 4px 15px rgba(239, 68, 68, 0.4)" }}>CANCELLED</span>
                                        </div>
                                    )}
                                </div>

                                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                                    {order.orderItems.map((item, idx) => (
                                        <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(15,23,42,0.4)", padding: "1rem", borderRadius: "12px", border: "1px solid rgba(148,163,184,0.1)" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "1.2rem" }}>
                                                <div style={{ width: "70px", height: "70px", background: "radial-gradient(circle at top left, #3b82f6, #1e40af)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: "1.2rem", boxShadow: "0 4px 10px rgba(0,0,0,0.3)" }}>
                                                    {item.quantity}x
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: "600", fontSize: "1.1rem" }}>{item.name}</div>
                                                    <div style={{ fontSize: "0.9rem", color: "#9ca3af", marginTop: "0.3rem" }}>Size: {item.size}</div>
                                                </div>
                                            </div>
                                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.6rem" }}>
                                                <div style={{ fontWeight: "600", fontSize: "1.1rem" }}>₹{item.price.toLocaleString("en-IN")}</div>
                                                <button onClick={() => handleBuyAgain(item)} style={{ background: "rgba(249,115,22,0.1)", color: "#f97316", border: "none", padding: "0.4rem 0.8rem", borderRadius: "6px", fontSize: "0.8rem", cursor: "pointer", fontWeight: 600 }}>
                                                    Buy it again
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div style={{ marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid rgba(148,163,184,0.2)", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
                                    <div style={{ fontSize: "0.9rem", color: "#9ca3af", lineHeight: "1.5" }}>
                                        <strong style={{ color: "#e2e8f0" }}>Shipping Address:</strong><br />
                                        {order.shippingInfo.name}<br />
                                        {order.shippingInfo.address}, {order.shippingInfo.city}<br />
                                        {order.shippingInfo.state} {order.shippingInfo.pin}
                                    </div>
                                    <div style={{ display: "flex", gap: "1rem" }}>
                                        {order.status === "Processing" && (
                                            <button onClick={() => handleCancelOrder(order._id)} style={{ background: "transparent", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)", padding: "0.5rem 1rem", borderRadius: "6px", fontSize: "0.85rem", cursor: "pointer" }}>
                                                Cancel Order
                                            </button>
                                        )}
                                        {order.status === "Delivered" && (
                                            <button onClick={() => alert("Mock: Open Review Modal")} style={{ background: "transparent", color: "#3b82f6", border: "1px solid rgba(59,130,246,0.5)", padding: "0.5rem 1rem", borderRadius: "6px", fontSize: "0.85rem", cursor: "pointer" }}>
                                                Write a Review
                                            </button>
                                        )}
                                    </div>
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
