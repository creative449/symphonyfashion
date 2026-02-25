"use client";
import Link from "next/link";

export default function Hero() {
  const scrollToSection = (id) => {
    if (typeof window === "undefined") return;
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section className="hero">
      <div className="container hero-inner">
        <div>
          <div className="hero-eyebrow">
            <span className="hero-pill-dot" />
            <span>New Season. New Energy.</span>
          </div>
          <h1 className="hero-title">
            Streetwear that moves with <span>you.</span>
          </h1>
          <p className="hero-subtitle">
            Discover elevated everyday pieces for{" "}
            <strong>him</strong> &amp; <strong>her</strong> — from relaxed
            tailoring to technical athleisure, built for city days and late
            nights.
          </p>

          <div className="hero-actions">
            <Link
              href="/shop?category=Men"
              className="btn-primary"
              style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              Shop Men
              <span>↗</span>
            </Link>
            <Link
              href="/shop?category=Women"
              className="btn-ghost"
              style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              Shop Women
              <span>Curated looks</span>
            </Link>
          </div>

          <div className="hero-metadata">
            <div className="hero-metadata-pill">Free shipping over ₹1,499</div>
            <div className="hero-metadata-pill">Easy 7-day returns</div>
            <div className="hero-metadata-pill">COD available</div>
          </div>
        </div>

        <div className="hero-right">
          <div className="hero-card">
            <div className="hero-card-header">
              <div className="hero-status">
                <span className="hero-status-dot" />
                <span>New drop live</span>
              </div>
              <span className="hero-card-chip">AW&apos;26 collection</span>
            </div>

            <div className="hero-figure">
              <div className="hero-gradient" />
              <div className="hero-orbit" />
              <div className="hero-model">
                <div className="hero-model-text">
                  <h3>Dual Edit Capsule</h3>
                  <p>Hyper-soft fabrics with tailored silhouettes for men &amp; women.</p>
                </div>
                <div className="hero-model-badge">
                  <span>Premium fits</span>
                  <span>Starting ₹1,299</span>
                </div>
              </div>
            </div>

            <div className="hero-card-footer">
              <div className="hero-chip-row">
                <span className="hero-chip">Wrinkle-lite</span>
                <span className="hero-chip">All-day comfort</span>
                <span className="hero-chip">Planet-friendly</span>
              </div>
              <span>Trending • 1.9k wishlists</span>
            </div>

            <div className="hero-floating-tag">New in: Studio Essentials</div>
          </div>
        </div>
      </div>
    </section>
  );
}

