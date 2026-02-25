import connectDB from "../../../../lib/mongodb";
import Order from "../../../../models/Order";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "admin") {
            return NextResponse.json({ message: "Unauthorized. Admin access only." }, { status: 401 });
        }

        await connectDB();
        const orders = await Order.find().sort({ createdAt: -1 });

        return NextResponse.json({ orders }, { status: 200 });
    } catch (error) {
        console.error("Error fetching admin orders: ", error);
        return NextResponse.json(
            { message: "An error occurred while fetching orders" },
            { status: 500 }
        );
    }
}
