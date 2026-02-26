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
    const [expandedOrders, setExpandedOrders] = useState({});

    const toggleOrderPanel = (id) => {
        setExpandedOrders(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

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

    const handleReturnOrder = async (orderId) => {
        if (!confirm("Are you sure you want to return this order?")) return;
        try {
            const res = await fetch("/api/user/orders", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId, action: "return" })
            });
            const data = await res.json();
            if (res.ok) {
                setOrders(orders.map(o => o._id === orderId ? { ...o, status: "Return Requested" } : o));
                alert("Return requested successfully.");
            } else {
                alert(data.message || "Failed to return order.");
            }
        } catch (err) {
            console.error(err);
            alert("Error returning the order.");
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
            <main className="container" style={{ padding: "1.5rem 0", maxWidth: "1000px", margin: "0 auto", minHeight: "70vh" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", padding: "0 1rem", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
                    <div>
                        <h1 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text)", margin: 0 }}>My Orders</h1>
                        <p style={{ color: "var(--muted)", fontSize: "0.85rem", margin: "0.2rem 0 0 0" }}>Review and track your recent purchases.</p>
                    </div>
                    <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, padding: 0 }}>
                        ← Go Back
                    </button>
                </div>

                {error ? (
                    <div style={{ padding: "1rem", background: "#ef444420", color: "#ef4444", borderRadius: "8px" }}>
                        {error}
                    </div>
                ) : orders.length === 0 ? (
                    <div style={{ padding: "3rem", textAlign: "center", background: "var(--bg-elevated)", borderRadius: "18px", border: "1px solid var(--border-subtle)" }}>
                        <p style={{ color: "var(--muted)", fontSize: "1.1rem", marginBottom: "1.5rem" }}>You haven't placed any orders yet.</p>
                        <Link href="/" className="btn-primary" style={{ display: "inline-block" }}>
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        {orders.map((order) => {
                            const isExpanded = expandedOrders[order._id] || false;

                            return (
                                <div key={order._id} style={{ background: "var(--bg-elevated)", borderRadius: "12px", border: "1px solid var(--border-subtle)", padding: "1.2rem", overflow: "hidden", position: "relative" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", cursor: "pointer", borderBottom: isExpanded ? "1px solid var(--border-subtle)" : "none", paddingBottom: isExpanded ? "1rem" : "0", marginBottom: isExpanded ? "1.5rem" : "0" }} onClick={() => toggleOrderPanel(order._id)}>
                                        <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                                            <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Order #{order._id.substring(0, 8).toUpperCase()}</h3>
                                            <p style={{ fontSize: "0.8rem", color: "var(--muted)" }}>Placed on {new Date(order.createdAt).toLocaleDateString()} • {order.orderItems.length} item(s)</p>
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                                            <div style={{ textAlign: "right" }}>
                                                <div style={{ fontSize: "0.75rem", color: order.status === "Cancelled" ? "#ef4444" : (order.status === "Delivered" ? "#10b981" : "var(--accent)"), textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 800 }}>{order.status}</div>
                                                <span style={{ fontWeight: "700", fontSize: "1.1rem", color: "var(--text)" }}>₹{order.totalAmount.toLocaleString("en-IN")}</span>
                                            </div>
                                            <button style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", color: "var(--text)", width: "32px", height: "32px", borderRadius: "50%", fontSize: "0.7rem", display: "flex", alignItems: "center", justifyContent: "center", transition: "transform 0.3s", transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}>
                                                ▼
                                            </button>
                                        </div>
                                    </div>
                                    {isExpanded && (
                                        <div style={{ animation: "fadeIn 0.3s ease-in-out" }}>
                                            {/* Tracking Timeline */}
                                            <div style={{ marginBottom: "2.5rem", padding: "0 1rem" }}>
                                                {["Return Requested", "Return Picked", "Return Received", "Refund Issued"].includes(order.status) ? (
                                                    <div style={{ padding: "1.5rem", background: "var(--accent-soft)", borderRadius: "12px", border: "1px solid rgba(255, 63, 108, 0.2)" }}>
                                                        <h4 style={{ color: "var(--accent)", marginBottom: "1.5rem", fontSize: "1rem" }}>Return Progress</h4>
                                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative" }}>
                                                            <div style={{ position: "absolute", top: "50%", left: "5%", right: "5%", height: "3px", background: "var(--border-subtle)", zIndex: 0, transform: "translateY(-50%)" }}>
                                                                <div style={{ height: "100%", background: "var(--accent)", transition: "width 0.5s ease", width: order.status === "Return Requested" ? "16%" : order.status === "Return Picked" ? "50%" : order.status === "Return Received" ? "83%" : "100%" }} />
                                                            </div>

                                                            {["Return Requested", "Return Picked", "Return Received", "Refund Issued"].map((step, i) => {
                                                                const statuses = ["Return Requested", "Return Picked", "Return Received", "Refund Issued"];
                                                                const currentIndex = statuses.indexOf(order.status);
                                                                const isCompleted = i <= currentIndex;
                                                                return (
                                                                    <div key={step} style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 1, gap: "0.5rem", width: "80px" }}>
                                                                        <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: isCompleted ? "var(--accent)" : "var(--border-subtle)", border: "3px solid var(--bg-elevated)" }} />
                                                                        <span style={{ fontSize: "0.7rem", color: isCompleted ? "var(--text)" : "var(--muted)", fontWeight: 600, textAlign: "center", lineHeight: "1.2" }}>{step}</span>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                        {order.status === "Return Requested" && <p style={{ fontSize: "0.85rem", color: "var(--accent)", marginTop: "1.5rem", textAlign: "center", lineHeight: "1.4" }}>We've received your request! A delivery associate will be assigned to pick up your item shortly.</p>}
                                                        {order.status === "Refund Issued" && <p style={{ fontSize: "0.85rem", color: "#10b981", marginTop: "1.5rem", textAlign: "center", lineHeight: "1.4" }}>Return Complete. Your refund has been successfully initiated! Please allow 5-7 business days for the amount to reflect in your original payment method.</p>}
                                                    </div>
                                                ) : (
                                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative" }}>
                                                        <div style={{ position: "absolute", top: "50%", left: "10%", right: "10%", height: "3px", background: "var(--border-subtle)", zIndex: 0, transform: "translateY(-50%)" }}>
                                                            <div style={{ height: "100%", background: "#10b981", width: order.status === "Processing" ? "25%" : order.status === "Shipped" ? "75%" : "100%", transition: "width 0.5s ease" }} />
                                                        </div>

                                                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 1, gap: "0.5rem" }}>
                                                            <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "#10b981", border: "3px solid var(--bg-elevated)" }} />
                                                            <span style={{ fontSize: "0.8rem", color: "var(--text)", fontWeight: 600 }}>Processing</span>
                                                        </div>
                                                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 1, gap: "0.5rem" }}>
                                                            <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: order.status === "Shipped" || order.status === "Delivered" ? "#10b981" : "var(--border-subtle)", border: "3px solid var(--bg-elevated)" }} />
                                                            <span style={{ fontSize: "0.8rem", color: order.status === "Shipped" || order.status === "Delivered" ? "var(--text)" : "var(--muted)", fontWeight: 600 }}>Shipped</span>
                                                        </div>
                                                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 1, gap: "0.5rem" }}>
                                                            <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: order.status === "Delivered" ? "#10b981" : "var(--border-subtle)", border: "3px solid var(--bg-elevated)" }} />
                                                            <span style={{ fontSize: "0.8rem", color: order.status === "Delivered" ? "var(--text)" : "var(--muted)", fontWeight: 600 }}>Delivered</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                                {order.orderItems.map((item, idx) => (
                                                    <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--accent-soft)", padding: "1rem", borderRadius: "12px", border: "1px solid var(--border-subtle)" }}>
                                                        <div style={{ display: "flex", alignItems: "center", gap: "1.2rem" }}>
                                                            <div style={{ width: "70px", height: "70px", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text)", fontWeight: 700, fontSize: "1.2rem" }}>
                                                                {item.quantity}x
                                                            </div>
                                                            <div>
                                                                <div style={{ fontWeight: "600", fontSize: "1.1rem" }}>{item.name}</div>
                                                                <div style={{ fontSize: "0.9rem", color: "var(--muted)", marginTop: "0.3rem" }}>Size: {item.size}</div>
                                                            </div>
                                                        </div>
                                                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.6rem" }}>
                                                            <div style={{ fontWeight: "600", fontSize: "1.1rem" }}>₹{item.price.toLocaleString("en-IN")}</div>
                                                            <button onClick={() => handleBuyAgain(item)} style={{ background: "var(--accent)", color: "white", border: "none", padding: "0.4rem 0.8rem", borderRadius: "6px", fontSize: "0.8rem", cursor: "pointer", fontWeight: 600 }}>
                                                                Buy it again
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div style={{ marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
                                                <div style={{ fontSize: "0.9rem", color: "var(--muted)", lineHeight: "1.5" }}>
                                                    <strong style={{ color: "var(--text)" }}>Shipping Address:</strong><br />
                                                    {order.shippingInfo.name}<br />
                                                    {order.shippingInfo.address}, {order.shippingInfo.city}<br />
                                                    {order.shippingInfo.state} {order.shippingInfo.pin}
                                                </div>
                                                <div style={{ display: "flex", gap: "1rem", flexDirection: "column", alignItems: "flex-end" }}>
                                                    <div style={{ display: "flex", gap: "1rem" }}>
                                                        {order.status === "Processing" && (
                                                            <button onClick={() => handleCancelOrder(order._id)} style={{ background: "transparent", color: "var(--text)", border: "1px solid var(--border-subtle)", padding: "0.5rem 1rem", borderRadius: "6px", fontSize: "0.85rem", cursor: "pointer" }}>
                                                                Cancel Order
                                                            </button>
                                                        )}
                                                        {order.status === "Delivered" && (
                                                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                                                <button onClick={() => handleReturnOrder(order._id)} style={{ background: "transparent", color: "var(--accent)", border: "1px solid rgba(255, 63, 108, 0.4)", padding: "0.5rem 1rem", borderRadius: "6px", fontSize: "0.85rem", cursor: "pointer" }}>
                                                                    Return Order
                                                                </button>
                                                                <button onClick={() => alert("Mock: Open Review Modal")} style={{ background: "transparent", color: "var(--text)", border: "1px solid var(--border-subtle)", padding: "0.5rem 1rem", borderRadius: "6px", fontSize: "0.85rem", cursor: "pointer" }}>
                                                                    Write a Review
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {order.status === "Shipped" && (
                                                        <div style={{ color: "var(--accent)", fontSize: "0.8rem", textAlign: "right", marginTop: "0.5rem", maxWidth: "250px" }}>
                                                            Your item is on its way and cannot be cancelled. You can return it once received.
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Download Invoice Link in footer inside expanded view */}
                                            <div style={{ marginTop: "1.5rem", borderTop: "1px solid var(--border-subtle)", paddingTop: "1rem", textAlign: "right" }}>
                                                <button style={{ background: "transparent", border: "1px solid var(--border-subtle)", color: "var(--text)", padding: "0.4rem 0.8rem", borderRadius: "6px", fontSize: "0.8rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                                                    <span>📄</span> Download Invoice
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
