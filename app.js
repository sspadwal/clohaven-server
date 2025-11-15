import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import productRoutes from "./routes/products.js";
import authRoutes from "./routes/auth.js";
import cartRoutes from "./routes/cart.js";
import orderRoutes from "./routes/orders.js";
import adminRoutes from "./routes/admin.js";
import categoryRoutes from "./routes/categories.js";
import paymentRoutes from "./routes/payments.js";
// import uploadRoutes from "./routes/uploadRoutes.js";
// import uploadRoutes from "./routes/upload.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: [
      "https://clohaven.vercel.app",
      "http://localhost:5173",
      "http://192.168.1.122:5173",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Database connection
connectDB();
try {
  console.log("✅ uploadRoutes imported successfully");
} catch (error) {
  console.log("❌ Error importing uploadRoutes:", error);
}

// Add route logging middleware
app.use("/api/upload", (req, res, next) => {
  console.log(`🛣️ Upload route accessed: ${req.method} ${req.path}`);
  next();
});

// API Routes with /api prefix
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/upload", uploadRoutes);

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Service is running");
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
