 "use client";

import ProductCard from "./ProductCard";

export default function ProductSection({ id, title, products, onAddToCart }) {
  return (
    <section id={id} className="section">
      <div className="container">
        <div className="section-header">
          <div>
            <div className="section-eyebrow">
              {id === "men" ? "For Him" : "For Her"}
            </div>
            <h2 className="section-title">
              {title} <span>edit</span>
            </h2>
            <p className="section-subtitle">
              Curated pieces to anchor your wardrobe — pairable, breathable, and
              ready for everyday rotation.
            </p>
          </div>
          <div className="section-cta">
            <span>Swipe through looks • </span>
            <a href="#offers">See seasonal offers</a>
          </div>
        </div>

        <div className="product-grid">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

