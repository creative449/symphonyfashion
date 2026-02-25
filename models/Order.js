import mongoose, { Schema, models } from "mongoose";

const orderSchema = new Schema(
    {
        userEmail: {
            type: String,
            required: true,
        },
        shippingInfo: {
            name: { type: String, required: true },
            address: { type: String, required: true },
            city: { type: String, required: true },
            state: { type: String, required: true },
            pin: { type: String, required: true },
        },
        orderItems: [
            {
                name: { type: String, required: true },
                quantity: { type: Number, required: true },
                price: { type: Number, required: true },
                size: { type: String },
                productId: { type: String, required: true },
            }
        ],
        totalAmount: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            default: "Processing",
        }
    },
    { timestamps: true }
);

const Order = models.Order || mongoose.model("Order", orderSchema);
export default Order;
