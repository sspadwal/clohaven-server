import mongoose from "mongoose";
import cloudinary from "cloudinary";
import Product from "./models/Product.js"; // Adjust path to your Product model
import dotenv from "dotenv";

dotenv.config();

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const migrateImages = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to database");

    // Get all products
    const products = await Product.find({});
    console.log(`📦 Found ${products.length} products to migrate`);

    let migratedCount = 0;
    let errorCount = 0;

    // Process each product
    for (const product of products) {
      console.log(`\n🔄 Processing: ${product.name}`);

      const newImages = [];

      // Upload each image to Cloudinary
      for (const imageUrl of product.images) {
        try {
          console.log(`   📤 Uploading: ${imageUrl}`);

          // Upload to Cloudinary
          const result = await cloudinary.v2.uploader.upload(imageUrl, {
            folder: "ecommerce-products/migrated",
            transformation: [
              { width: 1000, height: 1000, crop: "limit" },
              { quality: "auto" },
              { format: "webp" }, // Convert to webp for better performance
            ],
          });

          console.log(`   ✅ Uploaded: ${result.secure_url}`);
          newImages.push(result.secure_url);

          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.log(`   ❌ Failed to upload: ${imageUrl}`);
          console.log(`      Error: ${error.message}`);
          // Keep original URL if upload fails
          newImages.push(imageUrl);
          errorCount++;
        }
      }

      // Update product with new Cloudinary URLs
      if (newImages.length > 0) {
        product.images = newImages;
        await product.save();
        console.log(`   💾 Updated product with new image URLs`);
        migratedCount++;
      }
    }

    console.log(`\n🎉 Migration completed!`);
    console.log(`   ✅ Successfully migrated: ${migratedCount} products`);
    console.log(`   ❌ Errors: ${errorCount} images`);
  } catch (error) {
    console.error("❌ Migration failed:", error);
  } finally {
    await mongoose.connection.close();
    console.log("📊 Database connection closed");
    process.exit(0);
  }
};

migrateImages();
