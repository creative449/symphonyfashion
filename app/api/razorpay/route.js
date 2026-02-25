import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(req) {
    try {
        const { amount } = await req.json();

        // Initialize Razorpay
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_H8D2C2sQW0uN0j', // Fallback test key if missing
            key_secret: process.env.RAZORPAY_KEY_SECRET || 'jG2pCq7pC1w4a2oR9aLx9k1z',
        });

        // Create an order
        const options = {
            amount: Math.round(amount * 100), // Convert to paise
            currency: "INR",
            receipt: "order_rcptid_" + Date.now().toString(),
        };

        const order = await razorpay.orders.create(options);

        return NextResponse.json(order, { status: 200 });
    } catch (error) {
        console.error("Razorpay order error", error);
        return NextResponse.json({ error: "Could not create Razorpay order" }, { status: 500 });
    }
}
