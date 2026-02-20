"use client";

import { useCart } from "../../../components/CartContext";
import Link from "next/link";

export default function ProductDetailClient({ product }) {
  const { addItem } = useCart();

  return (
    <main className="container" style={{ padding: "2.5rem 0 3rem" }}>
      <Link href="/" style={{ color: "#f97316", fontSize: "0.85rem" }}>
        ← Back to Symphony Fashion
      </Link>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 1.1fr)",
          gap: "2.5rem",
          marginTop: "1.75rem",
          alignItems: "center"
        }}
      >
        <div>
          <div
            style={{
              borderRadius: "22px",
              background:
                "radial-gradient(circle at 15% 0, #f97316, #fb7185 45%, #22d3ee 100%)",
              padding: "1.4rem",
              position: "relative",
              overflow: "hidden"
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(circle at 15% 0, rgba(15,23,42,0.25), rgba(15,23,42,0.92))"
              }}
            />
            <div
              style={{
                position: "relative",
                zIndex: 10,
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-end",
                padding: "1.4rem 0.8rem 1.6rem"
              }}
            >
              <div className="product-silhouette" />
            </div>
          </div>
        </div>

        <div>
          <div
            style={{
              fontSize: "0.8rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#9ca3af",
              marginBottom: "0.4rem"
            }}
          >
            {product.category}
          </div>
          <h1
            style={{
              fontSize: "1.8rem",
              margin: "0 0 0.4rem"
            }}
          >
            {product.name}
          </h1>
          <p
            style={{
              fontSize: "0.95rem",
              color: "#9ca3af",
              maxWidth: "26rem",
              marginBottom: "1.1rem"
            }}
          >
            {product.tagline}
          </p>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              marginBottom: "0.8rem"
            }}
          >
            <div style={{ fontSize: "1.4rem", fontWeight: 600 }}>
              ₹{product.price.toLocaleString("en-IN")}
              {product.originalPrice && (
                <span
                  style={{
                    marginLeft: "0.4rem",
                    fontSize: "0.9rem",
                    color: "#9ca3af",
                    textDecoration: "line-through"
                  }}
                >
                  ₹{product.originalPrice.toLocaleString("en-IN")}
                </span>
              )}
            </div>
            <div style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
              ★ {product.rating.toFixed(1)} • premium quality
            </div>
          </div>

          <div style={{ marginBottom: "1.1rem" }}>
            <div
              style={{
                fontSize: "0.78rem",
                textTransform: "uppercase",
                letterSpacing: "0.16em",
                color: "#9ca3af",
                marginBottom: "0.3rem"
              }}
            >
              Select size
            </div>
            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
              {product.sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  style={{
                    borderRadius: "999px",
                    padding: "0.3rem 0.7rem",
                    border: "1px solid rgba(148,163,184,0.7)",
                    background:
                      "radial-gradient(circle at top, rgba(15,23,42,0.98), rgba(15,23,42,0.9))",
                    color: "#e5e7eb",
                    fontSize: "0.78rem",
                    cursor: "pointer"
                  }}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem" }}>
            <button
              type="button"
              className="btn-primary"
              onClick={() => addItem(product)}
            >
              Add to cart
              <span>＋</span>
            </button>
            <button type="button" className="btn-ghost">
              Save to wishlist
            </button>
          </div>

          <p style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
            100% original products • 7‑day return policy • Express shipping
            available.
          </p>
        </div>
      </section>
    </main>
  );
}

