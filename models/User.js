import mongoose, { Schema, models } from "mongoose";

const userSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            default: "user",
        },
        phone: {
            type: String,
        },
        addresses: {
            type: [
                {
                    title: String,
                    name: String,
                    address: String,
                    city: String,
                    state: String,
                    pin: String,
                    isDefault: Boolean
                }
            ],
            default: []
        },
        wishlist: {
            type: [String],
            default: []
        },
    },
    { timestamps: true }
);

const User = models.User || mongoose.model("User", userSchema);
export default User;
