"use client";

import { useCart } from "../../components/CartContext";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function CheckoutPage() {
    const { subtotal, items } = useCart();
    const { data: session } = useSession();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        address: "",
        city: "",
        state: "",
        pin: "",
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [orderId, setOrderId] = useState("");

    // Populate user details if logged in
    useEffect(() => {
        if (session && session.user) {
            setFormData(prev => ({
                ...prev,
                name: session.user.name || prev.name,
                email: session.user.email || prev.email
            }));
        }
    }, [session]);

    const tax = subtotal * 0.18; // 18% GST Mock
    const total = subtotal + tax;

    const handleCheckout = async (e) => {
        e.preventDefault();
        setLoading(true);

        const orderData = {
            userEmail: formData.email,
            shippingInfo: {
                name: formData.name,
                address: formData.address,
                city: formData.city,
                state: formData.state,
                pin: formData.pin
            },
            orderItems: items.map(item => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                size: item.selectedSize || "N/A",
                productId: item.id
            })),
            totalAmount: total
        };

        try {
            const res = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(orderData)
            });

            if (res.ok) {
                const data = await res.json();
                setOrderId(data.orderId);
                setSuccess(true);
            } else {
                alert("Order failed to process. Please try again.");
            }
        } catch (error) {
            console.error(error);
            alert("Order failed to process. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="page">
                <Navbar cartCount={0} />
                <main className="container" style={{ padding: "4rem 0", display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                        <span style={{ fontSize: '2.5rem', color: 'white' }}>✓</span>
                    </div>
                    <h1 style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>Order Confirmed!</h1>
                    <p style={{ fontSize: '1.1rem', color: '#9ca3af', maxWidth: '500px', marginBottom: '2rem' }}>
                        Thank you for shopping at Symphony Fashion. Your order ID is <strong>{orderId.substring(0, 8).toUpperCase()}</strong>. We've saved your order in our database and will send an email with your shipping details shortly.
                    </p>
                    <Link href="/" className="btn-primary">
                        Back to Home
                    </Link>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="page">
            <Navbar cartCount={items.length} />
            <main className="container" style={{ padding: "3rem 0", maxWidth: "1000px", margin: "0 auto" }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '3rem' }}>

                    {/* Left Column: Form */}
                    <div>
                        <h1 style={{ fontSize: "2rem", marginBottom: "1.5rem" }}>Checkout</h1>
                        <form onSubmit={handleCheckout} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ padding: '1.5rem', background: '#0b1020', borderRadius: '18px', border: '1px solid rgba(51,65,85,0.6)' }}>
                                <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#f97316' }}>1. Shipping Information</h2>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                        <label style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Full Name</label>
                                        <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required type="text" style={{ padding: '0.8rem', borderRadius: '8px', background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(148,163,184,0.3)', color: 'white' }} placeholder="John Doe" />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                        <label style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Email Address</label>
                                        <input value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required type="email" style={{ padding: '0.8rem', borderRadius: '8px', background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(148,163,184,0.3)', color: 'white' }} placeholder="john@example.com" />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem' }}>
                                    <label style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Street Address</label>
                                    <input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} required type="text" style={{ padding: '0.8rem', borderRadius: '8px', background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(148,163,184,0.3)', color: 'white' }} placeholder="123 Main St, Apt 4B" />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                        <label style={{ fontSize: '0.85rem', color: '#9ca3af' }}>City</label>
                                        <input value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} required type="text" style={{ padding: '0.8rem', borderRadius: '8px', background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(148,163,184,0.3)', color: 'white' }} placeholder="Mumbai" />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                        <label style={{ fontSize: '0.85rem', color: '#9ca3af' }}>State</label>
                                        <input value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} required type="text" style={{ padding: '0.8rem', borderRadius: '8px', background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(148,163,184,0.3)', color: 'white' }} placeholder="MH" />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                        <label style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Pin Code</label>
                                        <input value={formData.pin} onChange={(e) => setFormData({ ...formData, pin: e.target.value })} required type="text" style={{ padding: '0.8rem', borderRadius: '8px', background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(148,163,184,0.3)', color: 'white' }} placeholder="400001" />
                                    </div>
                                </div>
                            </div>

                            <div style={{ padding: '1.5rem', background: '#0b1020', borderRadius: '18px', border: '1px solid rgba(51,65,85,0.6)' }}>
                                <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#f97316' }}>2. Payment Processing</h2>
                                <p style={{ fontSize: '0.9rem', color: '#9ca3af', marginBottom: '1.5rem' }}>This is a test checkout. Clicking the button will simulate a secure Razorpay/Stripe redirect.</p>

                                <button disabled={loading || items.length === 0} type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '1rem' }}>
                                    {loading ? "Processing..." : `Pay ₹${total.toLocaleString("en-IN")} via Gateway`}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Right Column: Mini Cart Summary */}
                    <div>
                        <div style={{ padding: '1.5rem', background: 'radial-gradient(circle at top, #0b1020 0, #020617 100%)', borderRadius: '18px', border: '1px solid rgba(30,64,175,0.6)', position: 'sticky', top: '100px' }}>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Order Summary</h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(148,163,184,0.2)', paddingBottom: '1rem' }}>
                                {items.map(item => (
                                    <div key={item.cartItemId || item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                        <div>
                                            <span style={{ color: '#e5e7eb' }}>{item.quantity}x {item.name}</span>
                                            {item.selectedSize && <div style={{ color: '#9ca3af', fontSize: '0.75rem' }}>Size: {item.selectedSize}</div>}
                                        </div>
                                        <span style={{ fontWeight: 600 }}>₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
                                    </div>
                                ))}
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#9ca3af' }}>
                                    <span>Subtotal</span>
                                    <span>₹{subtotal.toLocaleString("en-IN")}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#9ca3af' }}>
                                    <span>Estimated Tax (18%)</span>
                                    <span>₹{tax.toLocaleString("en-IN")}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#9ca3af' }}>
                                    <span>Shipping</span>
                                    <span style={{ color: '#22c55e' }}>Free</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 700, marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(148,163,184,0.2)' }}>
                                    <span>Total</span>
                                    <span>₹{total.toLocaleString("en-IN")}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
