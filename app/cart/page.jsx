"use client";

import Link from "next/link";
import { useCart } from "../../components/CartContext";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function CartPage() {
  const { items, subtotal, itemCount, removeItem } = useCart();

  return (
    <div className="page">
      <Navbar cartCount={itemCount} />
      <main className="container" style={{ padding: "3rem 0", maxWidth: "800px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
          Your Shopping Cart
        </h1>
        <p style={{ fontSize: "1rem", color: "#9ca3af", marginBottom: "2rem" }}>
          {itemCount === 0
            ? "Your cart is currently empty."
            : `You have ${itemCount} items ready for checkout.`}
        </p>

        {itemCount === 0 ? (
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              fontSize: "0.85rem",
              color: "#f97316"
            }}
          >
            ← Back to shopping
          </Link>
        ) : (
          <>
            <div
              style={{
                borderRadius: "18px",
                border: "1px solid rgba(51,65,85,0.9)",
                background:
                  "radial-gradient(circle at top, #0b1020 0, #020617 60%, #020617 100%)",
                padding: "1.1rem 1.15rem",
                marginBottom: "1.3rem"
              }}
            >
              {items.map((item) => (
                <div
                  key={item.cartItemId || item.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "100px 1fr auto",
                    gap: "1.5rem",
                    alignItems: "center",
                    padding: "1.5rem 0",
                    borderBottom: "1px solid rgba(30,64,175,0.4)"
                  }}
                >
                  {/* Fallback image block since cart currently just maps data */}
                  <div style={{ width: '100px', height: '100px', borderRadius: '12px', background: 'radial-gradient(circle at 15% 0, #f97316, #fb7185 45%, #22d3ee 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {item.image ? (
                      <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} />
                    ) : (<span>Image</span>)}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <div style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "#f97316" }}>
                      {item.category}
                    </div>
                    <div style={{ fontSize: "1.2rem", fontWeight: 600 }}>{item.name}</div>

                    {item.selectedSize && (
                      <div style={{ fontSize: "0.9rem", color: "#e5e7eb" }}>Size: <strong>{item.selectedSize}</strong></div>
                    )}

                    <div style={{ fontSize: "0.9rem", color: "#9ca3af", display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.4rem' }}>
                      <span>Qty: {item.quantity}</span>
                      <button
                        onClick={() => removeItem(item.cartItemId || item.id)}
                        style={{ background: 'transparent', border: 'none', color: '#fb7185', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline' }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <div style={{ textAlign: "right", display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <div style={{ fontSize: "1.2rem", fontWeight: 600 }}>
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </div>
                    {item.quantity > 1 && (
                      <div style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
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
                  paddingTop: "0.8rem"
                }}
              >
                <span style={{ fontSize: "0.9rem", color: "#9ca3af" }}>
                  Subtotal
                </span>
                <span style={{ fontSize: "1.1rem", fontWeight: 600 }}>
                  ₹{subtotal.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <Link href="/checkout" className="btn-primary" style={{ padding: '0.9rem 2rem', fontSize: '1.1rem' }}>
                Proceed to checkout
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

