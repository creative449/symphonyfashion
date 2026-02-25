import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  title: { type: String },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  tagline: { type: String, required: true },
  isNew: { type: Boolean, default: false },
  isOnSale: { type: Boolean, default: false },
  rating: { type: Number, default: 0 },
  sizes: [{ type: String }],
  image: { type: String, required: true },
  section: { type: String, required: true },
  description: { type: String }
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);