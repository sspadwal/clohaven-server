import cloudinary from "cloudinary";

cloudinary.v2.config({
  cloud_name: "dpbooirol",
  api_key: "295927257619633",
  api_secret: "6gunEgmMiBr5qyB057-mnWnWnqmIs",
});

console.log("Testing Cloudinary connection...");

cloudinary.v2.uploader
  .upload("https://res.cloudinary.com/demo/image/upload/sample.jpg", {
    folder: "test",
  })
  .then(result => {
    console.log("✅ SUCCESS! Upload worked:");
    console.log("   Public ID:", result.public_id);
    console.log("   URL:", result.secure_url);
  })
  .catch(error => {
    console.log("❌ FAILED! Error details:");
    console.log("   Error:", error);
    console.log("   Message:", error.message);
    console.log("   HTTP Code:", error.http_code);
  });
