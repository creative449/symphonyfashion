 "use client";

import Link from "next/link";

export default function Navbar({ cartCount }) {
  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link href="/" className="brand">
          <div className="brand-logo" />
          <div className="brand-text">
            <span className="brand-name">SYMPHONY FASHION</span>
            <span className="brand-tagline">Future-forward streetwear</span>
          </div>
        </Link>

        <nav className="nav-links">
          <a href="#men" className="nav-link">
            Men
          </a>
          <a href="#women" className="nav-link">
            Women
          </a>
          <a href="#new" className="nav-link">
            New Drops
          </a>
          <a href="#bestsellers" className="nav-link">
            Best Sellers
          </a>
          <a href="#offers" className="nav-link">
            Offers
          </a>
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Link href="/cart" className="cart-pill">
            <span className="cart-pill-icon">🛒</span>
            <span className="cart-pill-count">{cartCount}</span>
          </Link>
          <a href="#men" className="pill-cta">
            <span className="pill-dot" />
            <span>Shop new season fits</span>
          </a>
        </div>
      </div>
    </header>
  );
}

