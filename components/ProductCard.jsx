"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function ProductCard({ product, onAddToCart, source }) {
  const [selectedSize, setSelectedSize] = useState(null);

  const productHref = source ? `/product/${product._id || product.id}?from=${source}` : `/product/${product._id || product.id}`;

  const {
    name,
    category,
    price,
    originalPrice,
    tagline,
    isNew,
    isOnSale,
    rating,
    sizes
  } = product;

  const badgeLabel = isNew ? "New" : isOnSale ? "Sale" : null;
  const badgeClass = isNew ? "product-badge new" : isOnSale ? "product-badge sale" : "product-badge";

  const handleQuickAdd = () => {
    if (!selectedSize && sizes && sizes.length > 0) {
      alert("Please select a size first!");
      return;
    }
    if (onAddToCart) {
      // Pass the selected size to the cart
      onAddToCart({ ...product, selectedSize, cartItemId: `${product.id}-${selectedSize}` });
    }
  };

  return (
    <article className="product-card">
      {badgeLabel && <div className={badgeClass}>{badgeLabel}</div>}
      {product.section === "unisex" && (
        <div className="product-badge" style={{ background: "#8b5cf6", color: "white", left: "calc(100% - 4.5rem)" }}>UNISEX</div>
      )}

      <Link href={productHref} className="product-image-link">
        <div className="product-image">
          <div className="product-image-inner" />
          <div className="product-image-figure">
            {product.image ? (
              <Image
                src={product.image}
                alt={name}
                fill={false}
                width={220}
                height={280}
                style={{
                  borderRadius: "999px",
                  objectFit: "cover",
                  border: "1px solid rgba(148,163,184,0.6)"
                }}
              />
            ) : (
              <div className="product-silhouette" />
            )}
          </div>
        </div>
      </Link>

      <div className="product-info">
        <div className="product-category">{category}</div>
        <Link href={productHref} className="product-name-link">
          <h3 className="product-name">{name}</h3>
        </Link>

        <div className="product-meta-row">
          <div className="product-price-block">
            <div className="product-price">
              ₹{price.toLocaleString("en-IN")}
              {originalPrice && (
                <span>₹{originalPrice.toLocaleString("en-IN")}</span>
              )}
            </div>
            <div className="product-tagline">{tagline}</div>
          </div>
          <button
            type="button"
            className="product-cta"
            onClick={handleQuickAdd}
          >
            <span>Quick add</span> <span>＋</span>
          </button>
        </div>

        <div className="product-footer-row">
          <div className="rating">
            <span>★</span>
            <span>{rating.toFixed(1)}</span>
            <span>∙ rated</span>
          </div>
          <div className="sizes">
            {sizes.map((size) => (
              <button
                key={size}
                type="button"
                className={`size-pill ${selectedSize === size ? "selected" : ""}`}
                onClick={() => setSelectedSize(size)}
              >
                <span>{size}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

