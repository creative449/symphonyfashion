import Razorpay from "razorpay";

export async function issueRazorpayRefund(order) {
    if (!order.paymentInfo || !order.paymentInfo.id) {
        console.warn("⚠️ No Razorpay Payment ID found on this order. Cannot fully automate refund.");
        return null;
    }

    try {
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        // The Razorpay payment ID saved during checkout
        const paymentId = order.paymentInfo.id;

        // This natively talks to Razorpay's Banking API to pull funds back to the original card
        const refundResponse = await razorpay.payments.refund(paymentId, {
            amount: Math.round(order.totalAmount * 100), // Razorpay requires paise
            speed: "optimum", // 'optimum' or 'normal'
            notes: {
                reason: "Automated RTO / Return Received",
                order_id: order._id.toString()
            }
        });

        console.log(`✅ Financial Refund of ₹${order.totalAmount} successfully issued for Order #${order._id}`);
        return refundResponse;

    } catch (error) {
        console.error("❌ Razorpay Auto-Refund Failed:", error);
        return null; // Don't crash the server, just let admin know it failed
    }
}
