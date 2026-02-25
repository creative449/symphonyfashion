"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function AdminDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (status === "unauthenticated" || (session && session.user.role !== "admin")) {
            router.replace("/");
        }
    }, [status, session, router]);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await fetch("/api/admin/orders");
                if (!res.ok) {
                    throw new Error("Failed to fetch orders or unauthorized");
                }
                const data = await res.json();
                setOrders(data.orders);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (session?.user?.role === "admin") {
            fetchOrders();
        }
    }, [session]);

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            const res = await fetch(`/api/admin/orders/${orderId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!res.ok) {
                alert("Failed to update status.");
                return;
            }

            setOrders(orders.map(order =>
                order._id === orderId ? { ...order, status: newStatus } : order
            ));
        } catch (error) {
            console.error(error);
            alert("Error updating order status.");
        }
    };

    if (status === "loading" || loading) {
        return (
            <div className="page" style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
                Loading dashboard...
            </div>
        );
    }

    if (session?.user?.role !== "admin") {
        return null; // Will redirect
    }

    return (
        <div className="page">
            <Navbar cartCount={0} />
            <main className="container" style={{ padding: "4rem 0", maxWidth: "1200px", margin: "0 auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                    <h1 style={{ fontSize: "2rem" }}>Admin Dashboard</h1>
                    <div style={{ display: "flex", gap: "1rem" }}>
                        <button
                            onClick={() => router.push('/admin/simulator')}
                            style={{ padding: "0.6rem 1.2rem", fontSize: "0.9rem", background: "rgba(59,130,246,0.1)", color: "#3b82f6", border: "1px solid rgba(59,130,246,0.3)", borderRadius: "6px", cursor: "pointer", fontWeight: 600 }}
                        >
                            Logistics Simulator
                        </button>
                        <button
                            onClick={() => router.push('/admin/add-product')}
                            className="btn-primary"
                            style={{ padding: "0.6rem 1.2rem", fontSize: "0.9rem" }}
                        >
                            + Add Product
                        </button>
                    </div>
                </div>
                <p style={{ color: "#9ca3af", marginBottom: "3rem" }}>Manage your store's recent orders below.</p>

                {error ? (
                    <div style={{ padding: "1rem", background: "#ef444420", color: "#ef4444", borderRadius: "8px" }}>
                        {error}
                    </div>
                ) : orders.length === 0 ? (
                    <div style={{ padding: "3rem", textAlign: "center", background: "#0b1020", borderRadius: "18px", border: "1px solid rgba(51,65,85,0.6)" }}>
                        <p style={{ color: "#9ca3af" }}>No orders have been placed yet.</p>
                    </div>
                ) : (
                    <div style={{ overflowX: "auto", background: "#0b1020", borderRadius: "18px", border: "1px solid rgba(51,65,85,0.6)" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                            <thead>
                                <tr style={{ borderBottom: "1px solid rgba(148,163,184,0.2)", background: "rgba(15,23,42,0.6)" }}>
                                    <th style={{ padding: "1.2rem 1rem", fontSize: "0.85rem", textTransform: "uppercase", color: "#9ca3af", letterSpacing: "0.05em" }}>Order ID & Date</th>
                                    <th style={{ padding: "1.2rem 1rem", fontSize: "0.85rem", textTransform: "uppercase", color: "#9ca3af", letterSpacing: "0.05em" }}>Customer</th>
                                    <th style={{ padding: "1.2rem 1rem", fontSize: "0.85rem", textTransform: "uppercase", color: "#9ca3af", letterSpacing: "0.05em" }}>Items</th>
                                    <th style={{ padding: "1.2rem 1rem", fontSize: "0.85rem", textTransform: "uppercase", color: "#9ca3af", letterSpacing: "0.05em" }}>Total</th>
                                    <th style={{ padding: "1.2rem 1rem", fontSize: "0.85rem", textTransform: "uppercase", color: "#9ca3af", letterSpacing: "0.05em" }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <tr key={order._id} style={{ borderBottom: "1px solid rgba(148,163,184,0.1)" }}>
                                        <td style={{ padding: "1.5rem 1rem" }}>
                                            <div style={{ fontWeight: "600", marginBottom: "0.2rem" }}>#{order._id.substring(0, 8).toUpperCase()}</div>
                                            <div style={{ fontSize: "0.8rem", color: "#9ca3af" }}>{new Date(order.createdAt).toLocaleDateString()}</div>
                                        </td>
                                        <td style={{ padding: "1.5rem 1rem" }}>
                                            <div style={{ fontWeight: "500", marginBottom: "0.2rem" }}>{order.shippingInfo.name}</div>
                                            <div style={{ fontSize: "0.85rem", color: "#9ca3af" }}>{order.userEmail}</div>
                                            <div style={{ fontSize: "0.8rem", color: "#9ca3af", marginTop: "0.4rem" }}>
                                                {order.shippingInfo.city}, {order.shippingInfo.state} {order.shippingInfo.pin}
                                            </div>
                                        </td>
                                        <td style={{ padding: "1.5rem 1rem" }}>
                                            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                                                {order.orderItems.map((item, idx) => (
                                                    <div key={idx} style={{ fontSize: "0.85rem" }}>
                                                        <span style={{ color: "#f97316" }}>{item.quantity}x</span> {item.name} <span style={{ color: "#9ca3af" }}>({item.size})</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                        <td style={{ padding: "1.5rem 1rem", fontWeight: "600" }}>
                                            ₹{order.totalAmount.toLocaleString("en-IN")}
                                        </td>
                                        <td style={{ padding: "1.5rem 1rem" }}>
                                            <select
                                                value={order.status}
                                                onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                                style={{
                                                    background: "rgba(15,23,42,0.8)",
                                                    color: order.status === "Delivered" ? "#22c55e" : order.status === "Shipped" ? "#3b82f6" : order.status.includes("Return") ? "#f97316" : order.status === "Cancelled" ? "#ef4444" : "#fbbf24",
                                                    border: "1px solid rgba(148,163,184,0.3)",
                                                    padding: "0.5rem 0.8rem",
                                                    borderRadius: "6px",
                                                    fontWeight: "600",
                                                    fontSize: "0.85rem",
                                                    cursor: "pointer",
                                                    outline: "none"
                                                }}
                                            >
                                                <optgroup label="Manual Actions" style={{ color: "#9ca3af" }}>
                                                    <option value="Processing" style={{ color: "white" }}>Processing</option>
                                                    <option value="Cancelled" style={{ color: "white" }}>Cancelled</option>
                                                </optgroup>
                                                <optgroup label="Delhivery Automated" style={{ color: "#3b82f6" }}>
                                                    <option value="Shipped" style={{ color: "white" }}>Shipped</option>
                                                    <option value="Delivered" style={{ color: "white" }}>Delivered</option>
                                                    <option value="Return Requested" style={{ color: "white" }}>Return Requested</option>
                                                    <option value="Return Picked" style={{ color: "white" }}>Return Picked</option>
                                                    <option value="Return Received" style={{ color: "white" }}>Return Received (RTO)</option>
                                                </optgroup>
                                                <optgroup label="Finance (Manual Update required)" style={{ color: "#f97316" }}>
                                                    <option value="Refund Issued" style={{ color: "white" }}>Refund Issued</option>
                                                </optgroup>

                                            </select>
                                        </td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
