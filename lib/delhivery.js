// Utilities to interact with Delhivery APIs for automated logistics

const DELHIVERY_API_KEY = process.env.DELHIVERY_API_KEY;
const DELHIVERY_BASE_URL = process.env.NODE_ENV === "production"
    ? "https://track.delhivery.com"
    : "https://staging-express.delhivery.com";

/**
 * Automatically creates a Forward Shipment in Delhivery when a user places an order.
 * @param {Object} order - The MongoDB order object
 */
export async function createForwardShipment(order) {
    if (!DELHIVERY_API_KEY) {
        console.warn("⚠️ DELHIVERY_API_KEY is missing. Skipping automated Delhivery shipment creation.");
        return null;
    }

    try {
        const payload = {
            "format": "json",
            "data": {
                "shipments": [
                    {
                        "add": order.shippingInfo.address,
                        "address_type": "home",
                        "phone": order.shippingInfo.phone || "9999999999", // Ensure we have phone info
                        "payment_mode": "Pre-paid",
                        "name": order.shippingInfo.name,
                        "pin": order.shippingInfo.pin,
                        "order": order._id.toString(), // Connect Symphony ID to Delhivery Ref Num!
                        "shipping_mode": "Express", // Or "Surface"
                    }
                ],
                "pickup_location": {
                    "name": "Symphony Fashion Warehouse",
                    "add": "123 Your Warehouse Street", // Replace with your actual warehouse
                    "city": "Your City",
                    "pin": "110001", // Your warehouse pincode
                    "phone": "9876543210"
                }
            }
        };

        // Delhivery official API endpoint to create shipping label and order pickup
        const response = await fetch(`${DELHIVERY_BASE_URL}/api/cmu/create.json`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Token ${DELHIVERY_API_KEY}`
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            console.error("Delhivery API Error (Forward):", data);
            throw new Error("Failed to push forward shipment to Delhivery");
        }

        console.log(`✅ Automated Delhivery shipment created for Order #${order._id}`);
        return data; // Contains waybill info etc.
    } catch (error) {
        console.error("Automated Shipping Failed: ", error);
        return null;
    }
}

/**
 * Automatically schedules a Reverse Pickup in Delhivery when a user clicks Return.
 * @param {Object} order - The MongoDB order object
 */
export async function createReversePickup(order) {
    if (!DELHIVERY_API_KEY) {
        console.warn("⚠️ DELHIVERY_API_KEY is missing. Skipping automated Return Pickup scheduling.");
        return null;
    }

    try {
        const payload = {
            "pickup_location": order.shippingInfo.name, // The user's home
            "pickup_time": "10:00:00",
            "pickup_date": new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
            "pickup_address": order.shippingInfo.address,
            "pickup_city": order.shippingInfo.city,
            "pickup_pin": order.shippingInfo.pin, // User's pincode
            "pickup_phone": order.shippingInfo.phone || "9999999999",
            "return_address": "Symphony Fashion Warehouse, 123 Street", // Your warehouse
            "return_pin": "110001",
            "order_id": order._id.toString() + "_RETURN" // Link it back
        };

        // Delhivery official API endpoint to create reverse pickup
        const response = await fetch(`${DELHIVERY_BASE_URL}/fm/request/pb/create/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Token ${DELHIVERY_API_KEY}`
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            console.error("Delhivery API Error (Reverse):", data);
            throw new Error("Failed to schedule reverse pickup with Delhivery");
        }

        console.log(`✅ Automated Delhivery Return Pickup scheduled for Order #${order._id}`);
        return data;
    } catch (error) {
        console.error("Automated Return Pickup Failed: ", error);
        return null;
    }
}
