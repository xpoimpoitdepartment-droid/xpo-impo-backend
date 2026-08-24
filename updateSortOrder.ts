import mongoose from "mongoose";
import config from "./src/app/config";
import { ProductModel } from "./src/app/modules/product/product.model";

async function main() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(config.database_url as string);
    console.log("Connected successfully!");

    // Fetch all products
    const products = await ProductModel.find().sort({ createdAt: -1 });
    
    let currentSortOrder = 1;

    for (const product of products) {
      product.sortOrder = currentSortOrder;
      await product.save();
      currentSortOrder++;
    }

    console.log(`Updated ${products.length} products sequentially from 1 to ${products.length}!`);
  } catch (err) {
    console.error("Error connecting or updating:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
    process.exit(0);
  }
}

main();
