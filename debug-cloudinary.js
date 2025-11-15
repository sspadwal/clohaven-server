import cloudinary from "cloudinary";

console.log("=== CLOUDINARY DEBUG TEST ===");

// Test with URL format
const cloudinaryUrl =
  "cloudinary://295927257619633:6gunEgmMiBr5qyB057-mnWnqmIs@dpbooirol";
console.log("Testing with URL format...");

cloudinary.v2.config({
  cloud_name: "dpbooirol",
  api_key: "295927257619633",
  api_secret: "6gunEgmMiBr5qyB057-mnWnqmIs",
});

// Test 1: Simple ping
console.log("\n1. Testing API ping...");
cloudinary.v2.api
  .ping()
  .then(result => console.log("✅ Ping successful:", result))
  .catch(error => console.log("❌ Ping failed:", error.message));

// Test 2: List resources (requires fewer permissions)
console.log("\n2. Testing resource list...");
cloudinary.v2.api
  .resources({ max_results: 1 })
  .then(result => console.log("✅ Resource list successful"))
  .catch(error => console.log("❌ Resource list failed:", error.message));

// Test 3: Upload with different options
console.log("\n3. Testing upload with public_id...");
cloudinary.v2.uploader
  .upload("https://res.cloudinary.com/demo/image/upload/sample.jpg", {
    public_id: "test_upload_" + Date.now(),
    folder: "test",
  })
  .then(result => {
    console.log("✅ Upload successful!");
    console.log("   URL:", result.secure_url);
    console.log("   Public ID:", result.public_id);
  })
  .catch(error => {
    console.log("❌ Upload failed:");
    console.log("   Error:", error.message);
    console.log("   HTTP Code:", error.http_code);

    if (error.http_code === 401) {
      console.log("\n🔴 SOLUTION REQUIRED:");
      console.log("   1. Go to Cloudinary Dashboard → Security → API Keys");
      console.log('   2. Click "Generate New API Key"');
      console.log('   3. Name it "Clohaven-Server"');
      console.log("   4. Copy BOTH the new API Key and API Secret");
      console.log("   5. Update your .env file with the NEW credentials");
    }
  });
