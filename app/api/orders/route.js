import connectDB from "../../../lib/mongodb";
import Order from "../../../models/Order";
import { NextResponse } from "next/server";
import { createForwardShipment } from "../../../lib/delhivery";

export async function POST(req) {
    try {
        const { userEmail, shippingInfo, orderItems, totalAmount, paymentInfo } = await req.json();

        if (!userEmail || !shippingInfo || !orderItems || !totalAmount || !paymentInfo) {
            return NextResponse.json({ message: "Incomplete order data" }, { status: 400 });
        }

        await connectDB();

        const newOrder = await Order.create({
            userEmail,
            shippingInfo,
            orderItems,
            totalAmount,
            paymentInfo,
            status: "Processing"
        });

        // Ping Delhivery automatically!
        const forwardShipment = await createForwardShipment(newOrder);
        if (forwardShipment) {
            console.log("Delhivery shipping label automatically created for warehouse packing!");
        }

        return NextResponse.json({ message: "Order placed successfully", orderId: newOrder._id }, { status: 201 });
    } catch (error) {
        console.error("Order Creation Error: ", error);
        return NextResponse.json(
            { message: "An error occurred while creating the order" },
            { status: 500 }
        );
    }
}
