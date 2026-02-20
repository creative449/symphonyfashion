 "use client";

import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import ProductSection from "../components/ProductSection";
import Footer from "../components/Footer";
import { menProducts, womenProducts } from "../data/products";
import { useCart } from "../components/CartContext";

export default function HomePage() {
  const { addItem, itemCount, subtotal } = useCart();

  return (
    <div className="page">
      <Navbar cartCount={itemCount} />
      <main>
        <Hero />
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

