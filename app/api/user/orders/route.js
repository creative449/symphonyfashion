import connectDB from "../../../../lib/mongodb";
import Order from "../../../../models/Order";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

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
