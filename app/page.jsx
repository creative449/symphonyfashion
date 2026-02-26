"use client";

import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import ProductSection from "../components/ProductSection";
import Footer from "../components/Footer";
import { useCart } from "../components/CartContext";

export default function HomePage() {
  const { addItem, itemCount, subtotal } = useCart();
  const [menProducts, setMenProducts] = useState([]);
  const [womenProducts, setWomenProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('/api/products');
        const data = await response.json();

        // Split data into categories using the section property (unisex goes to both)
        const men = data.filter(product => product.section === 'men' || product.section === 'unisex');
        const women = data.filter(product => product.section === 'women' || product.section === 'unisex');

        setMenProducts(men);
        setWomenProducts(women);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--text)', fontSize: '1.2rem', fontWeight: 500 }}>Loading Collections...</div>;
  }

  return (
    <div className="page">
      <Navbar cartCount={itemCount} />
      <main>
        <div style={{ background: "var(--accent-soft)", padding: "0.8rem 0", borderBottom: "1px solid var(--border-subtle)" }}>
          <div className="container" style={{ display: "flex", justifyContent: "center", gap: "2rem", flexWrap: "wrap", fontSize: "0.85rem", fontWeight: 600, color: "var(--accent)" }}>
            <span>✓ Free shipping over ₹1,499</span>
            <span style={{ color: "var(--muted)" }}>•</span>
            <span>✓ Easy 7-day returns</span>
            <span style={{ color: "var(--muted)" }}>•</span>
            <span>✓ COD available</span>
          </div>
        </div>
        <div style={{ marginTop: "2rem" }} />
        <ProductSection
          id="men"
          title="Men&apos;s Collection"
          products={menProducts}
          onAddToCart={addItem}
        />
        <ProductSection
          id="women"
          title="Women&apos;s Collection"
          products={womenProducts}
          onAddToCart={addItem}
        />
        <div className="cart-summary-shell">
          <div className="cart-summary">
            <div className="cart-summary-row">
              <span>Cart</span>
              <span className="cart-summary-count">{itemCount} item(s)</span>
            </div>
            <div className="cart-summary-row">
              <span>Subtotal</span>
              <span className="cart-summary-amount">
                ₹{subtotal.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

