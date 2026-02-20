import Link from "next/link";
import { menProducts, womenProducts } from "../../../data/products";
import ProductDetailClient from "./ProductDetailClient";

function getProductById(id) {
  const all = [...menProducts, ...womenProducts];
  return all.find((p) => p.id === id);
}

export default async function ProductDetailPage({ params }) {
  const { id } = await params;
  const product = getProductById(id);

  if (!product) {
    return (
      <main className="container" style={{ padding: "3rem 0" }}>
        <p style={{ color: "#9ca3af" }}>Product not found.</p>
        <Link href="/" style={{ color: "#f97316" }}>
          ← Back to home
        </Link>
      </main>
    );
  }

  return <ProductDetailClient product={product} />;
}

