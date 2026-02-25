"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";

export default function LogisticsSimulator() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === "unauthenticated" || (session && session.user.role !== "admin")) {
            router.replace("/");
        }
    }, [status, session, router]);

    const fetchOrders = async () => {
        try {
            const res = await fetch("/api/admin/orders");
            if (res.ok) {
                const data = await res.json();
                setOrders(data.orders);
            }
        } catch (err) {
            console.error("Error fetching orders:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (session?.user?.role === "admin") {
            fetchOrders();
        }
    }, [session]);

    const triggerFakeWebhook = async (orderId, delhiveryStatus) => {
        if (!confirm(`Are you sure you want to simulate Delhivery scanning this package as "${delhiveryStatus}"?`)) return;

        try {
            // Fake the exact JSON payload that Delhivery sends
            const payload = {
                "waybill": "SIM_" + Math.random().toString(36).substr(2, 9),
                "ref_num": orderId,
                "status": delhiveryStatus,
                "timestamp": new Date().toISOString()
            };

            const res = await fetch("/api/webhooks/delhivery", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert(`✅ Successfully simulated webhook! The order was updated in the background.`);
                fetchOrders(); // Refresh table to show new status
            } else {
                alert("❌ Webhook simulation failed. Check console.");
            }
        } catch (e) {
            console.error(e);
            alert("❌ Webhook error.");
        }
    };

    if (status === "loading" || loading) return <div className="page" style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>Loading Simulator...</div>;

    return (
        <div className="page">
            <Navbar cartCount={0} />
            <main className="container" style={{ padding: "4rem 0", maxWidth: "1200px", margin: "0 auto" }}>
                <div style={{ marginBottom: "2rem", padding: "2rem", background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.3)", borderRadius: "12px" }}>
                    <h1 style={{ fontSize: "2.2rem", color: "#3b82f6", marginBottom: "0.5rem" }}>Logistics Webhook Simulator</h1>
                    <p style={{ color: "#9ca3af", lineHeight: "1.6" }}>
                        Since you aren't connected to a live Delhivery Merchant API account yet, you can use this interface to securely test out the automated logistics pipeline. <br />
                        When you click a button below, it generates a fake machine-to-machine payload and silently blasts it into your webhook endpoint (`/api/webhooks/delhivery`) exactly like a FedEx or Delhivery barcode scanner would!
                    </p>
                </div>

                <div style={{ overflowX: "auto", background: "#0b1020", borderRadius: "18px", border: "1px solid rgba(51,65,85,0.6)" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                        <thead>
                            <tr style={{ borderBottom: "1px solid rgba(148,163,184,0.2)", background: "rgba(15,23,42,0.6)" }}>
                                <th style={{ padding: "1.2rem 1rem", fontSize: "0.85rem", textTransform: "uppercase", color: "#9ca3af", letterSpacing: "0.05em" }}>Order Info</th>
                                <th style={{ padding: "1.2rem 1rem", fontSize: "0.85rem", textTransform: "uppercase", color: "#9ca3af", letterSpacing: "0.05em" }}>Current System Status</th>
                                <th style={{ padding: "1.2rem 1rem", fontSize: "0.85rem", textTransform: "uppercase", color: "#9ca3af", letterSpacing: "0.05em" }}>Fire Fake Delhivery Event</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr key={order._id} style={{ borderBottom: "1px solid rgba(148,163,184,0.1)" }}>
                                    <td style={{ padding: "1.5rem 1rem" }}>
                                        <div style={{ fontWeight: "600", marginBottom: "0.2rem" }}>#{order._id.substring(0, 8).toUpperCase()}</div>
                                        <div style={{ fontSize: "0.8rem", color: "#9ca3af" }}>{order.userEmail}</div>
                                    </td>
                                    <td style={{ padding: "1.5rem 1rem" }}>
                                        <span style={{
                                            background: "rgba(255,255,255,0.1)",
                                            padding: "0.4rem 0.8rem",
                                            borderRadius: "99px",
                                            fontSize: "0.85rem",
                                            color: order.status === "Delivered" ? "#4ade80" : order.status.includes("Return") ? "#f97316" : "#fbbf24",
                                            fontWeight: "bold"
                                        }}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: "1.5rem 1rem" }}>
                                        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                                            <button
                                                onClick={() => triggerFakeWebhook(order._id, "In Transit")}
                                                style={{ background: "#3b82f6", color: "white", border: "none", padding: "0.4rem 0.8rem", borderRadius: "6px", fontSize: "0.8rem", cursor: "pointer", fontWeight: 600 }}
                                            >
                                                Send "Dispatched" Event
                                            </button>
                                            <button
                                                onClick={() => triggerFakeWebhook(order._id, "Delivered")}
                                                style={{ background: "#22c55e", color: "white", border: "none", padding: "0.4rem 0.8rem", borderRadius: "6px", fontSize: "0.8rem", cursor: "pointer", fontWeight: 600 }}
                                            >
                                                Send "Delivered" Event
                                            </button>
                                            <button
                                                onClick={() => triggerFakeWebhook(order._id, "Return Picked Up")}
                                                style={{ background: "#f97316", color: "white", border: "none", padding: "0.4rem 0.8rem", borderRadius: "6px", fontSize: "0.8rem", cursor: "pointer", fontWeight: 600 }}
                                            >
                                                Send "Return Picked Up" Event
                                            </button>
                                            <button
                                                onClick={() => triggerFakeWebhook(order._id, "RTO")}
                                                style={{ background: "#eab308", color: "white", border: "none", padding: "0.4rem 0.8rem", borderRadius: "6px", fontSize: "0.8rem", cursor: "pointer", fontWeight: 600 }}
                                            >
                                                Send "Return Delivered to Warehouse (RTO)" Event
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
            <Footer />
        </div>
    );
}
