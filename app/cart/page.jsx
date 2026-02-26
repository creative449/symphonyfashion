"use client";

import Link from "next/link";
import { useCart } from "../../components/CartContext";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function CartPage() {
  const { items, subtotal, itemCount, removeItem } = useCart();

  return (
    <div className="page" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar cartCount={itemCount} />
      <main className="container" style={{ padding: "1.5rem 0", flex: 1, maxWidth: "800px", margin: "0 auto", width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", padding: "0 1rem", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text)", margin: 0 }}>
              Your Shopping Cart
            </h1>
            <p style={{ fontSize: "0.85rem", color: "var(--muted)", margin: "0.2rem 0 0 0" }}>
              {itemCount === 0
                ? "Your cart is currently empty."
                : `You have ${itemCount} items ready for checkout.`}
            </p>
          </div>
        </div>

        {itemCount === 0 ? (
          <div style={{ padding: "0 1rem" }}>
            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                fontSize: "0.9rem",
                color: "var(--accent)",
                fontWeight: 600
              }}
            >
              ← Back to shopping
            </Link>
          </div>
        ) : (
          <>
            <div
              style={{
                borderRadius: "18px",
                border: "1px solid var(--border-subtle)",
                background: "var(--bg-elevated)",
                padding: "1rem 1.5rem",
                marginBottom: "1.5rem"
              }}
            >
              {items.map((item) => (
                <div
                  key={item.cartItemId || item.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "80px 1fr auto",
                    gap: "1.5rem",
                    alignItems: "center",
                    padding: "1.5rem 0",
                    borderBottom: "1px solid var(--border-subtle)"
                  }}
                >
                  {/* Fallback image block since cart currently just maps data */}
                  <div style={{ width: '80px', height: '80px', borderRadius: '12px', background: 'var(--accent-soft)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {item.image ? (
                      <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (<span style={{ fontSize: '0.7rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Aesthetic</span>)}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <div style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--accent)" }}>
                      {item.category || "Premium Apparel"}
                    </div>
                    <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text)" }}>{item.name}</div>

                    {item.selectedSize && (
                      <div style={{ fontSize: "0.85rem", color: "var(--muted)" }}>Size: <strong style={{ color: "var(--text)" }}>{item.selectedSize}</strong></div>
                    )}

                    <div style={{ fontSize: "0.85rem", color: "var(--muted)", display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.4rem' }}>
                      <span>Qty: <strong style={{ color: "var(--text)" }}>{item.quantity}</strong></span>
                      <button
                        onClick={() => removeItem(item.cartItemId || item.id)}
                        style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <div style={{ textAlign: "right", display: 'flex', flexDirection: 'column', gap: '0.3rem', justifyContent: 'center' }}>
                    <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text)" }}>
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </div>
                    {item.quantity > 1 && (
                      <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                        ₹{item.price.toLocaleString("en-IN")} each
                      </div>
                    )}
                  </div>
                </div>
              ))}

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingTop: "1rem"
                }}
              >
                <span style={{ fontSize: "0.9rem", color: "var(--muted)", fontWeight: 600 }}>
                  Subtotal
                </span>
                <span style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text)" }}>
                  ₹{subtotal.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: "0 1rem" }}>
              <Link href="/checkout" className="btn-primary" style={{ padding: '0.8rem 2rem', fontSize: '1rem', fontWeight: 700, borderRadius: "8px" }}>
                Proceed to Checkout
                <span style={{ marginLeft: '0.5rem' }}>→</span>
              </Link>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

