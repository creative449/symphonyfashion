import connectDB from "../../../../lib/mongodb";
import Product from "../../../../models/Product";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET(req, { params }) {
    try {
        const { id } = await params;
        await connectDB();

        // 1. Try matching string 'id'
        let product = await Product.findOne({ id: id }).lean();

        // 2. Try matching ObjectId '_id'
        if (!product) {
            if (mongoose.Types.ObjectId.isValid(id)) {
                product = await Product.findById(id).lean();
            }
        }

        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        return NextResponse.json(product);
    } catch (error) {
        console.error("GET Product details Error:", error);
        return NextResponse.json(
            { error: "Database error" },
            { status: 500 }
        );
    }
}
