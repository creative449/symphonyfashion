import connectDB from "../../../../lib/mongodb";
import Order from "../../../../models/Order";
import { NextResponse } from "next/server";
import { issueRazorpayRefund } from "../../../../lib/razorpayRefund";

// Delhivery Webhook Handler for automated Shipping & Returns updates
export async function POST(req) {
    try {
        // Parse the webhook payload sent from Delhivery servers
        const body = await req.json();

        // Security check: Verify the payload came from Delhivery
        // For production, you'd verify an HMAC signature or specific Delhivery Webhook Token here
        // const authHeader = req.headers.get("Authorization");
        // if (authHeader !== process.env.DELHIVERY_WEBHOOK_SECRET) { ... }

        // Example Payload from Delhivery
        // {
        //   "waybill": "1234567890",
        //   "ref_num": "ORDER_ID_64b59f3d",  <-- This would map to our MongoDB order ID
        //   "status": "In Transit" | "Delivered" | "Return Picked" | "RTO"
        //   "timestamp": "2026-02-26T10:00:00Z"
        // }

        const { ref_num: orderId, status } = body;

        if (!orderId || !status) {
            return NextResponse.json({ message: "Missing required payload data" }, { status: 400 });
        }

        await connectDB();
        const order = await Order.findById(orderId);

        if (!order) {
            console.error(`Webhook received for unknown order: ${orderId}`);
            return NextResponse.json({ message: "Order not found" }, { status: 404 });
        }

        // Map Delhivery's official status strings to our internal Symphony Fashion statuses
        let newInternalStatus = null;

        switch (status) {
            case "Dispatched":
            case "In Transit":
                newInternalStatus = "Shipped";
                break;
            case "Delivered":
                // If it was already "Return Requested", they wouldn't theoretically transition here
                // But for pure forward shipping:
                newInternalStatus = "Delivered";
                break;
            case "Return Picked Up":
                // Delhivery guy scanned it outside customer's house
                newInternalStatus = "Return Picked";
                break;
            case "RTO": // Return to Origin
            case "Returned to Origin":
                // Delhivery brought it back to the warehouse
                newInternalStatus = "Return Received";

                // 🔥 Amazon Level Automation: Moment the box hits warehouse, refund their card!
                const automatedRefund = await issueRazorpayRefund(order);
                if (automatedRefund) {
                    // Fast track the internal status directly to Refund Issued!
                    newInternalStatus = "Refund Issued";
                    console.log("💸 Customer Refund instantly triggered via Razorpay!");
                }
                break;
            default:
                console.log(`Unhandled Delhivery status: ${status}. Ignoring.`);
                break;
        }

        // Only update database if there's a valid mapped transition
        if (newInternalStatus && order.status !== newInternalStatus) {
            order.status = newInternalStatus;

            // Note: If you have a separate tracking schema, you might push a new timeline event here too
            // order.trackingHistory.push({ status: newInternalStatus, timestamp: new Date() })

            await order.save();
            console.log(`[DELHIVERY WEBHOOK] Order ${orderId} successfully auto-updated to: ${newInternalStatus}`);
        }

        // Acknowledge receipt to Delhivery so they don't retry the webhook
        return NextResponse.json({ message: "Webhook processed successfully" }, { status: 200 });

    } catch (error) {
        console.error("Delhivery Webhook Error:", error);
        return NextResponse.json({ message: "Webhook processing failed" }, { status: 500 });
    }
}
