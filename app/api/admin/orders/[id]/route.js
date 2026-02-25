import connectDB from "../../../../../lib/mongodb";
import Order from "../../../../../models/Order";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";

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
        const updatedOrder = await Order.findByIdAndUpdate(
            id,
            { status },
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
