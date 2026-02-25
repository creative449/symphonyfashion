"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useCart } from "./CartContext";

export default function Navbar() {
  const { data: session } = useSession();
  const { itemCount } = useCart();

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
          <Link href="/shop" className="nav-link" style={{ color: "#f97316", fontWeight: "bold" }}>
            Shop All
          </Link>
          <Link href="/#men" className="nav-link">
            Men
          </Link>
          <Link href="/#women" className="nav-link">
            Women
          </Link>
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>

          {session ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.9rem', color: '#e5e7eb' }}>
              <Link href="/profile" style={{ color: '#e5e7eb', textDecoration: 'none', fontWeight: 600 }}>
                {session.user.name.split(" ")[0]}
              </Link>
              <Link href="/orders" style={{ color: '#9ca3af', textDecoration: 'none' }}>
                Orders
              </Link>
              {session.user.role === "admin" && (
                <Link href="/admin" style={{ color: '#f97316', textDecoration: 'none', fontWeight: 600 }}>
                  Admin
                </Link>
              )}
              <button
                onClick={() => signOut()}
                style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '0.85rem' }}
              >
                Logout
              </button>
            </div>
          ) : (
            <Link href="/login" style={{ fontSize: '0.9rem', color: '#e5e7eb', textDecoration: 'none' }}>
              Login
            </Link>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Link href="/cart" className="cart-pill">
              <span className="cart-pill-icon">🛒</span>
              <span className="cart-pill-count">{itemCount || 0}</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

