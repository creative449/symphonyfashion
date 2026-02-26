"use client";

import { useCart } from "../../components/CartContext";
import { useState, useEffect } from "react";
import Link from "next/link";
import Script from "next/script";
import { useSession } from "next-auth/react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function CheckoutPage() {
    const { subtotal, items, clearCart } = useCart();
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
    const [pinLoading, setPinLoading] = useState(false);
    const [pinError, setPinError] = useState("");

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

    const handlePinChange = async (e) => {
        const pin = e.target.value.replace(/[^0-9]/g, '');
        if (pin.length > 6) return;

        setFormData(prev => ({ ...prev, pin }));

        if (pin.length === 6) {
            setPinLoading(true);
            try {
                const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
                const data = await res.json();

                if (data && data[0] && data[0].Status === "Success") {
                    const postOffice = data[0].PostOffice[0];
                    setFormData(prev => ({
                        ...prev,
                        pin: pin,
                        state: postOffice.State,
                        city: postOffice.District || postOffice.Name
                    }));
                    // Mock check for unserviceable pin codes (e.g. strict zone checks)
                    const mockUnserviceable = ["999999", "000000"];
                    if (mockUnserviceable.includes(pin)) {
                        setPinError("Delivery cannot be met at this specific pin code yet.");
                    } else {
                        setPinError("");
                    }
                } else {
                    setPinError("Invalid pin code mentioned. Warning: Wrong pin code for targeted city region.");
                }
            } catch (err) {
                console.error("Pincode API failed", err);
                setPinError("Error validating pin code at this moment.");
            } finally {
                setPinLoading(false);
            }
        } else {
            setPinError("");
        }
    };

    const handleCheckout = async (e) => {
        e.preventDefault();

        if (pinError || formData.pin.length !== 6) {
            alert(pinError || "Please enter a completely valid 6-digit pin code and ensure delivery can be met before making payment.");
            return;
        }

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
            // 1. Create a Razorpay Order
            const razorpayRes = await fetch("/api/razorpay", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: total })
            });
            const order = await razorpayRes.json();

            if (order.id) {
                // 2. Open Razorpay Checktout Popup
                const options = {
                    key: order.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_H8D2C2sQW0uN0j',
                    amount: order.amount,
                    currency: "INR",
                    name: "Symphony Fashion",
                    description: "Test Transaction",
                    order_id: order.id,
                    handler: async function (response) {
                        try {
                            // 3. Complete Order Process in Database on Success
                            const fullOrderData = {
                                ...orderData,
                                paymentInfo: {
                                    id: response.razorpay_payment_id,
                                    status: "Paid",
                                }
                            };

                            const ourDbRes = await fetch("/api/orders", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(fullOrderData)
                            });

                            if (ourDbRes.ok) {
                                const data = await ourDbRes.json();
                                setOrderId(data.orderId || response.razorpay_order_id);
                                setSuccess(true);
                                clearCart();
                            } else {
                                alert("Order failed to save to database. Contact Support with Payment ID: " + response.razorpay_payment_id);
                            }
                        } catch (err) {
                            console.error("Database save failed: ", err);
                        } finally {
                            setLoading(false);
                        }
                    },
                    prefill: {
                        name: formData.name,
                        email: formData.email,
                        contact: formData.contact || "9999999999"
                    },
                    theme: {
                        color: "#f97316"
                    }
                };

                const rzp1 = new window.Razorpay(options);

                rzp1.on('payment.failed', function (response) {
                    alert('Payment Failed! Reason: ' + response.error.description);
                    setLoading(false);
                });

                rzp1.open();
            } else {
                alert(order.error || "Failed to initialize payment gateway.");
                setLoading(false);
            }
        } catch (error) {
            console.error(error);
            alert("Order failed to process. Please try again.");
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="page" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
                <Navbar cartCount={0} />
                <main className="container" style={{ padding: "4rem 0", flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.2)' }}>
                        <span style={{ fontSize: '2.5rem', color: 'white' }}>✓</span>
                    </div>
                    <h1 style={{ fontSize: "2rem", marginBottom: "1rem", color: "var(--text)" }}>Order Confirmed!</h1>
                    <p style={{ fontSize: '1rem', color: 'var(--muted)', maxWidth: '500px', marginBottom: '2rem', lineHeight: '1.5' }}>
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
        <div className="page" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />
            <Navbar cartCount={items.length} />
            <main className="container" style={{ padding: "1.5rem 0", flex: 1, maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", padding: "0 1rem", marginBottom: "1rem", flexWrap: "wrap", gap: "1rem" }}>
                    <div>
                        <h1 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text)", margin: 0 }}>Secure Checkout</h1>
                        <p style={{ color: "var(--muted)", fontSize: "0.85rem", margin: "0.2rem 0 0 0" }}>Please review your details and complete payment.</p>
                    </div>
                    <Link href="/cart" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, padding: 0 }}>
                        ← Back to Cart
                    </Link>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 350px', gap: '2rem', padding: '0 1rem', alignItems: 'start' }} className="checkout-grid">

                    {/* Left Column: Form */}
                    <div>
                        <form onSubmit={handleCheckout} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ padding: '1.2rem', background: 'var(--bg-elevated)', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
                                <h2 style={{ fontSize: '1.1rem', marginBottom: '0.8rem', color: 'var(--accent)', fontWeight: 700 }}>1. Shipping Information</h2>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginBottom: '0.8rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                        <label style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 600 }}>Full Name</label>
                                        <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required type="text" style={{ padding: '0.6rem 0.8rem', borderRadius: '8px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text)', fontSize: '0.95rem' }} placeholder="" />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                        <label style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 600 }}>Email Address</label>
                                        <input value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required type="email" style={{ padding: '0.6rem 0.8rem', borderRadius: '8px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text)', fontSize: '0.95rem' }} placeholder="" />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginBottom: '0.8rem' }}>
                                    <label style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 600 }}>Street Address</label>
                                    <input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} required type="text" style={{ padding: '0.6rem 0.8rem', borderRadius: '8px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text)', fontSize: '0.95rem' }} placeholder="" />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.8rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                        <label style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 600 }}>Pin Code</label>
                                        <div style={{ position: 'relative' }}>
                                            <input value={formData.pin} onChange={handlePinChange} required type="text" style={{ padding: '0.6rem 0.8rem', borderRadius: '8px', background: 'var(--bg-elevated)', border: pinError ? '1px solid #ef4444' : '1px solid var(--border-subtle)', color: 'var(--text)', fontSize: '0.95rem', width: '100%' }} placeholder="Enter 6 digits" />
                                            {pinLoading && <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.8rem', color: 'var(--accent)' }}>...</span>}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                        <label style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 600 }}>State</label>
                                        <input value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} required type="text" style={{ padding: '0.6rem 0.8rem', borderRadius: '8px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text)', fontSize: '0.95rem' }} placeholder="Auto-filled" />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                        <label style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 600 }}>City</label>
                                        <input value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} required type="text" style={{ padding: '0.6rem 0.8rem', borderRadius: '8px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text)', fontSize: '0.95rem' }} placeholder="Auto-filled" />
                                    </div>
                                </div>
                                {pinError && <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.5rem', fontWeight: 600 }}>{pinError}</div>}
                            </div>

                            <div style={{ padding: '1.2rem', background: 'var(--bg-elevated)', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h2 style={{ fontSize: '1.1rem', marginBottom: '0.2rem', color: 'var(--accent)', fontWeight: 700 }}>2. Payment Processing</h2>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Secure Razorpay redirect.</p>
                                    </div>
                                    <button disabled={loading || items.length === 0} type="submit" className="btn-primary" style={{ padding: '0.7rem 1.5rem', fontSize: '1rem', fontWeight: 700 }}>
                                        {loading ? "Processing..." : `Pay ₹${total.toLocaleString("en-IN")}`}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Right Column: Mini Cart Summary */}
                    <div>
                        <div style={{ padding: '1.2rem', background: 'var(--accent-soft)', borderRadius: '16px', border: '1px solid rgba(255, 63, 108, 0.2)', position: 'sticky', top: '20px' }}>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.8rem', color: 'var(--text)', fontWeight: 700 }}>Order Summary</h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.8rem' }}>
                                {items.map(item => (
                                    <div key={item.cartItemId || item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                        <div>
                                            <span style={{ color: 'var(--text)', fontWeight: 600 }}>{item.quantity}x {item.name}</span>
                                            {item.selectedSize && <div style={{ color: 'var(--muted)', fontSize: '0.75rem', marginTop: '0.2rem' }}>Size: {item.selectedSize}</div>}
                                        </div>
                                        <span style={{ fontWeight: 700, color: 'var(--text)' }}>₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
                                    </div>
                                ))}
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--muted)' }}>
                                    <span>Subtotal</span>
                                    <span style={{ color: 'var(--text)' }}>₹{subtotal.toLocaleString("en-IN")}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--muted)' }}>
                                    <span>Estimated Tax (18%)</span>
                                    <span style={{ color: 'var(--text)' }}>₹{tax.toLocaleString("en-IN")}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--muted)' }}>
                                    <span>Shipping</span>
                                    <span style={{ color: '#10b981', fontWeight: 600 }}>Free</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 800, marginTop: '0.5rem', paddingTop: '0.8rem', borderTop: '1px solid var(--border-subtle)', color: 'var(--text)' }}>
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
