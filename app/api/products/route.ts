import { NextResponse } from "next/server";
import connectDB from "../../../lib/mongodb";
import Product from "../../../models/Product";

export const dynamic = "force-dynamic";


export async function GET() {
  try {
    await connectDB();
    const products = await Product.find({}).lean();
    return NextResponse.json(products);
  } catch (error) {
    console.error("GET Products Error:", error);
    return NextResponse.json(
      { error: "Database error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();

    if (!body.title || !body.price) {
      return NextResponse.json(
        { error: "Missing required fields (title, price)" },
        { status: 400 }
      );
    }

    // Ensure both title and name are present
    if (body.title && !body.name) {
      body.name = body.title;
    }

    const newProduct = await Product.create(body);

    return NextResponse.json(
      { message: "Product created successfully", productId: newProduct._id },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST Product Error:", error);
    return NextResponse.json(
      { error: "Database error while inserting product", details: error.message },
      { status: 500 }
    );
  }
}