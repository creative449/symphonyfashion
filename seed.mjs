import { MongoClient } from "mongodb";

// Products raw data
const menProducts = [
    { id: "m-overshirt", name: "Textured Relaxed Overshirt", category: "Men • Layering", price: 1899, originalPrice: 2499, tagline: "Soft brushed cotton, built for all-day layering.", isNew: true, isOnSale: true, rating: 4.6, sizes: ["S", "M", "L", "XL"], image: "/men/overshirt.jpg", section: "men" },
    { id: "m-carpenter", name: "Utility Carpenter Trousers", category: "Men • Bottoms", price: 2199, originalPrice: 2799, tagline: "Tapered fit with stretch, cargo-inspired details.", isNew: false, isOnSale: true, rating: 4.7, sizes: ["30", "32", "34", "36"], image: "/men/carpenter-trousers.jpg", section: "men" },
    { id: "m-hoodie", name: "Heavyweight Studio Hoodie", category: "Men • Hoodies", price: 2399, originalPrice: 2999, tagline: "Oversized, brushed-fleece comfort with clean branding.", isNew: true, isOnSale: false, rating: 4.8, sizes: ["S", "M", "L", "XL"], image: "/men/hoodie.jpg", section: "men" },
    { id: "m-knit", name: "Ribbed Knit Polo", category: "Men • Knits", price: 1699, originalPrice: 1999, tagline: "Smart-casual staple for workdays and weekends.", isNew: false, isOnSale: false, rating: 4.4, sizes: ["S", "M", "L"], image: "/men/knit-polo.jpg", section: "men" }
];

const womenProducts = [
    { id: "w-coord", name: "Textured Co-ord Set", category: "Women • Co-ords", price: 2499, originalPrice: 3199, tagline: "Effortless two-piece set that dresses up or down.", isNew: true, isOnSale: true, rating: 4.9, sizes: ["XS", "S", "M", "L"], image: "/women/coord-set.jpg", section: "women" },
    { id: "w-slip", name: "Satin Slip Dress", category: "Women • Dresses", price: 2299, originalPrice: 2799, tagline: "Bias-cut satin with adjustable straps and fluid drape.", isNew: false, isOnSale: true, rating: 4.7, sizes: ["XS", "S", "M", "L", "XL"], image: "/women/satin-slip-dress.jpg", section: "women" },
    { id: "w-parachute", name: "Parachute Cargo Pants", category: "Women • Bottoms", price: 1999, originalPrice: 2399, tagline: "Lightweight, wide-leg silhouette with cinched hem.", isNew: true, isOnSale: false, rating: 4.5, sizes: ["26", "28", "30", "32"], image: "/women/parachute-pants.jpg", section: "women" },
    { id: "w-cardigan", name: "Cropped Cloud Cardigan", category: "Women • Knits", price: 1799, originalPrice: 2199, tagline: "Ultra-soft knit with subtle balloon sleeves.", isNew: false, isOnSale: false, rating: 4.6, sizes: ["XS", "S", "M", "L"], image: "/women/cardigan.jpg", section: "women" }
];

const uri = process.env.MONGODB_URI;

async function seed() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        console.log("Connected to MongoDB...");
        const db = client.db("symphonyfashion");

        // Clear existing
        await db.collection("products").deleteMany({});
        console.log("Cleared existing products");

        const allProducts = [...menProducts, ...womenProducts];
        const result = await db.collection("products").insertMany(allProducts);

        console.log("Successfully seeded", result.insertedCount, "products!");
    } catch (error) {
        console.error("Error seeding:", error);
    } finally {
        await client.close();
    }
}

seed();
