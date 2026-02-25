import connectDB from "../../../../../lib/mongodb";
import Order from "../../../../../models/Order";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { issueRazorpayRefund } from "../../../../../lib/razorpayRefund";

export async function PATCH(req, { params }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "admin") {
            return NextResponse.json({ message: "Unauthorized. Admin access only." }, { status: 401 });
        }

        const { id } = await params;
        const { status } = await req.json();

        if (!id || !status) {
            return NextResponse.json({ message: "Order ID and new status are required" }, { status: 400 });
        }

        await connectDB();

        let targetStatus = status;

        // Fetch current order first to check conditions
        const orderToUpdate = await Order.findById(id);
        if (!orderToUpdate) {
            return NextResponse.json({ message: "Order not found" }, { status: 404 });
        }

        // Amazon Automation: If admin forces it to "Refund Issued" OR "Return Received", attempt financially refunding!
        if (status === "Refund Issued" || status === "Return Received") {
            // Check if it's already refunded manually to avoid double-refunds
            if (orderToUpdate.status !== "Refund Issued") {
                const automatedRefund = await issueRazorpayRefund(orderToUpdate);
                if (automatedRefund) {
                    targetStatus = "Refund Issued"; // Fast forward
                    console.log("Admin Action Triggered Razorpay Refund!");
                } else if (status === "Refund Issued") {
                    return NextResponse.json({ message: "Failed to automatically process refund with Razorpay. Please process manually from Razorpay Dashboard." }, { status: 500 });
                }
            }
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            id,
            { status: targetStatus },
            { new: true }
        );

        if (!updatedOrder) {
            return NextResponse.json({ message: "Order not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Order status updated successfully", order: updatedOrder }, { status: 200 });
    } catch (error) {
        console.error("Error updating order status: ", error);
        return NextResponse.json(
            { message: "An error occurred while updating order status" },
            { status: 500 }
        );
    }
}
