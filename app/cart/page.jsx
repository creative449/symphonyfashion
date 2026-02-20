 "use client";

import Link from "next/link";
import { useCart } from "../../components/CartContext";

export default function CartPage() {
  const { items, subtotal, itemCount } = useCart();

  return (
    <main className="container" style={{ padding: "2.5rem 0 3rem" }}>
      <h1
        style={{
          fontSize: "1.6rem",
          margin: "0 0 0.6rem"
        }}
      >
        Your cart
      </h1>
      <p style={{ fontSize: "0.9rem", color: "#9ca3af", marginBottom: "1.5rem" }}>
        {itemCount === 0
          ? "You don’t have any items yet."
          : "Review your selection before checkout."}
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
                key={item.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 3fr) minmax(0, 1.2fr)",
                  gap: "1.2rem",
                  alignItems: "center",
                  padding: "0.5rem 0",
                  borderBottom: "1px solid rgba(30,64,175,0.4)"
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.16em",
                      color: "#9ca3af",
                      marginBottom: "0.15rem"
                    }}
                  >
                    {item.category}
                  </div>
                  <div style={{ fontSize: "0.95rem", fontWeight: 600 }}>
                    {item.name}
                  </div>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "#9ca3af",
                      marginTop: "0.2rem"
                    }}
                  >
                    Qty: {item.quantity}
                  </div>
                </div>
                <div
                  style={{
                    textAlign: "right",
                    fontSize: "0.95rem",
                    fontWeight: 600
                  }}
                >
                  ₹{(item.price * item.quantity).toLocaleString("en-IN")}
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

          <button type="button" className="btn-primary">
            Continue to checkout
            <span>→</span>
          </button>
        </>
      )}
    </main>
  );
}

