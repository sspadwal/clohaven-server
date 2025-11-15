import express from "express";
import { upload, cloudinary } from "../config/cloudinary.config.js";

const router = express.Router();

// Test route
router.get("/test", (req, res) => {
  console.log("✅ Upload test route called");
  res.json({ message: "Upload route is working!" });
});

// Upload route with comprehensive error handling
router.post(
  "/image",
  // First: Log the request
  (req, res, next) => {
    console.log("=== UPLOAD REQUEST STARTED ===");
    console.log("📨 POST /api/upload/image");
    console.log("   Content-Type:", req.headers["content-type"]);
    console.log("   Content-Length:", req.headers["content-length"]);
    next();
  },

  // Second: Handle file upload with error handling
  (req, res, next) => {
    upload.single("image")(req, res, function (err) {
      if (err) {
        console.error("❌ Multer Error:");
        console.error("   Error:", err.message);
        console.error("   Code:", err.code);
        console.error("   Field:", err.field);
        return res.status(400).json({
          message: "File upload failed",
          error: err.message,
        });
      }
      next();
    });
  },

  // Third: Process the uploaded file
  async (req, res) => {
    try {
      console.log("🔄 Multer processing completed");

      if (!req.file) {
        console.log("❌ No file received from multer");
        return res.status(400).json({
          message: "No image file received. Please select a file.",
        });
      }

      console.log("✅ File uploaded successfully:");
      console.log("   Fieldname:", req.file.fieldname);
      console.log("   Originalname:", req.file.originalname);
      console.log("   Mimetype:", req.file.mimetype);
      console.log("   Size:", req.file.size);
      console.log("   URL:", req.file.path);
      console.log("   Public ID:", req.file.filename);

      console.log("=== UPLOAD SUCCESSFUL ===");

      res.status(200).json({
        message: "Image uploaded successfully",
        imageUrl: req.file.path,
        publicId: req.file.filename,
      });
    } catch (error) {
      console.error("❌ Processing Error:");
      console.error("   Error:", error.message);
      console.error("   Stack:", error.stack);

      res.status(500).json({
        message: "Error processing image upload",
        error: error.message,
      });
    }
  }
);

export default router;
