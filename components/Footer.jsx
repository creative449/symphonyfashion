"use client";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div>
          <span className="footer-brand">Symphony Fashion</span>{" "}
          <span>• Crafted for everyday stories.</span>
        </div>
        <div className="footer-links">
          <a href="#men">Men</a>
          <a href="#women">Women</a>
          <a href="#offers" className="footer-pill">
            New user: extra 10% off
          </a>
        </div>
      </div>
    </footer>
  );
}

