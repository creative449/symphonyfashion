import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(req) {
    try {
        const { amount } = await req.json();

        const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_H8D2C2sQW0uN0j';

        // Initialize Razorpay
        const razorpay = new Razorpay({
            key_id: keyId,
            key_secret: process.env.RAZORPAY_KEY_SECRET || 'jG2pCq7pC1w4a2oR9aLx9k1z',
        });

        // Create an order
        const options = {
            amount: Math.round(amount * 100), // Convert to paise
            currency: "INR",
            receipt: "order_rcptid_" + Date.now().toString(),
        };

        const order = await razorpay.orders.create(options);

        // Check if there's a valid order
        if (!order || !order.id) {
            throw new Error("No Order ID created");
        }

        return NextResponse.json({ ...order, keyId }, { status: 200 });
    } catch (error) {
        console.error("Razorpay order error", error);

        // Check if it's an auth error (fake/missing keys)
        if (error.statusCode === 401 || error.error?.description === 'Authentication failed') {
            return NextResponse.json({ error: "Missing or Invalid Razorpay Keys. Please add your real RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to the .env.local file", code: "AUTH_FAILED" }, { status: 400 });
        }

        return NextResponse.json({ error: "Could not create Razorpay order", details: error.message }, { status: 500 });
    }
}
