import connectDB from "../../../../lib/mongodb";
import Order from "../../../../models/Order";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { createReversePickup } from "../../../../lib/delhivery";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized. Please log in." }, { status: 401 });
        }

        await connectDB();
        const orders = await Order.find({ userEmail: session.user.email }).sort({ createdAt: -1 });

        return NextResponse.json({ orders }, { status: 200 });
    } catch (error) {
        console.error("Error fetching user orders: ", error);
        return NextResponse.json(
            { message: "An error occurred while fetching orders" },
            { status: 500 }
        );
    }
}

export async function PATCH(req) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized. Please log in." }, { status: 401 });
        }

        const { orderId, action } = await req.json();
        await connectDB();

        if (action === "cancel") {
            const order = await Order.findOne({ _id: orderId, userEmail: session.user.email });

            if (!order) {
                return NextResponse.json({ message: "Order not found" }, { status: 404 });
            }

            if (order.status !== "Processing") {
                return NextResponse.json({ message: "Cannot cancel an order that is already shipped or delivered." }, { status: 400 });
            }

            order.status = "Cancelled";
            await order.save();

            return NextResponse.json({ message: "Order Cancelled Successfully", order }, { status: 200 });
        } else if (action === "return") {
            const order = await Order.findOne({ _id: orderId, userEmail: session.user.email });

            if (!order) {
                return NextResponse.json({ message: "Order not found" }, { status: 404 });
            }

            if (order.status !== "Delivered") {
                return NextResponse.json({ message: "Only delivered orders can be returned." }, { status: 400 });
            }

            order.status = "Return Requested";
            await order.save();

            // Programmatically notify Delhivery Servers instantly!
            const delhiveryResponse = await createReversePickup(order);
            if (delhiveryResponse) {
                console.log("Delhivery driver scheduled to pick up tomorrow!");
            }

            return NextResponse.json({ message: "Order Return Initiated & Scheduled Successfully", order }, { status: 200 });
        }

        return NextResponse.json({ message: "Invalid Action" }, { status: 400 });

    } catch (error) {
        console.error("Error updating order: ", error);
        return NextResponse.json(
            { message: "An error occurred while updating the order" },
            { status: 500 }
        );
    }
}
