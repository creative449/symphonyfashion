import connectDB from "../../../../lib/mongodb";
import User from "../../../../models/User";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const user = await User.findOne({ email: session.user.email }).select("-password");

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ user }, { status: 200 });
    } catch (error) {
        console.error("Profile GET Error: ", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { name, phone, addresses, wishlist } = await req.json();

        await connectDB();

        // Update fields if provided
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (phone !== undefined) updateData.phone = phone;
        if (addresses !== undefined) updateData.addresses = addresses;
        if (wishlist !== undefined) updateData.wishlist = wishlist;

        const updatedUser = await User.findOneAndUpdate(
            { email: session.user.email },
            { $set: updateData },
            { new: true }
        ).select("-password");

        return NextResponse.json({ message: "Profile updated successfully", user: updatedUser }, { status: 200 });
    } catch (error) {
        console.error("Profile PUT Error: ", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}
