import express from "express";
import Order from "../models/Order.js";
import User from "../models/User.js";
import { checkUser } from "../middleware/authMiddleware.js";
// import sendEmail from '../utils/sendEmail.js'; // 👈 REMOVE THIS LINE

const router = express.Router();

router.post("/", checkUser, async (req, res) => {
  try {
    console.log("Received order data:", req.body);
    const {
      shippingAddress,
      items,
      total,
      paymentMethod,
      paymentStatus,
      paymentId,
      email,
    } = req.body;

    if (!shippingAddress || !items || !total || !paymentMethod) {
      return res.status(400).json({
        message: "Missing required fields",
        required: ["shippingAddress", "items", "total", "paymentMethod"],
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ message: "Items must be a non-empty array" });
    }

    const { address, city, state, zip } = shippingAddress;
    if (!address || !city || !state || !zip) {
      return res
        .status(400)
        .json({ message: "Shipping address is incomplete" });
    }

    const order = new Order({
      user: req.user.id,
      shippingAddress: { address, city, state, zip },
      items: items.map(item => ({
        product: item.product,
        quantity: item.quantity,
        price: item.price,
      })),
      total,
      paymentMethod,
      paymentStatus: paymentStatus || "paid",
      paymentId: paymentId || null,
      email,
    });

    console.log("Saving order to database...");
    const savedOrder = await order.save();
    console.log("Order saved:", savedOrder._id);

    console.log("Populating order items...");
    const populatedOrder = await Order.populate(savedOrder, {
      path: "items.product",
      select: "name images price",
    });

    // 👇 COMPLETELY REMOVE EVERYTHING FROM HERE DOWN ABOUT EMAIL
    console.log("✅ Order created successfully without email");
    res.status(201).json(populatedOrder);
  } catch (error) {
    console.error("Detailed order creation error:", {
      message: error.message,
      stack: error.stack,
      errors: error.errors,
    });

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation error",
        errors: Object.values(error.errors).map(err => err.message),
      });
    }

    res.status(500).json({
      message: "Server error creating order",
      error: error.message,
    });
  }
});

export default router;
