import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();

    const newProduct = await Product.create({
      name: "Test Shirt",
      price: 999,
      image: "https://via.placeholder.com/150",
      description: "This is a test product",
    });

    return NextResponse.json({
      success: true,
      product: newProduct,
    });

  } catch (error: any) {
    console.error("API Error:", error);

    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}