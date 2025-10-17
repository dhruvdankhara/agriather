import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/user.model.js";
import Category from "../models/category.model.js";
import { DB_NAME } from "../constants.js";

dotenv.config();

const seedDatabase = async () => {
  try {
    // Connect to database
    await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
    console.log("✅ Connected to MongoDB");

    // Clear existing data (optional - comment out if you want to keep existing data)
    // await User.deleteMany({});
    // await Category.deleteMany({});
    // console.log("🗑️  Cleared existing data");

    // Create admin user
    const adminExists = await User.findOne({ role: "admin" });
    if (!adminExists) {
      const admin = await User.create({
        firstname: "Admin",
        lastname: "User",
        email: "admin@agriather.com",
        password: "admin123",
        role: "admin",
        phone: "1234567890",
        verified: true,
        isActive: true,
      });
      console.log("✅ Admin user created:", admin.email);
    } else {
      console.log("ℹ️  Admin user already exists");
    }

    // Create sample categories
    const categories = [
      {
        name: "Fertilizers",
        description: "All types of fertilizers for crop nutrition",
        isActive: true,
      },
      {
        name: "Pesticides",
        description: "Pest control solutions for healthy crops",
        isActive: true,
      },
      {
        name: "Machinery",
        description: "Agricultural machinery and equipment",
        isActive: true,
      },
      {
        name: "Seeds",
        description: "High-quality seeds for various crops",
        isActive: true,
      },
      {
        name: "Irrigation Equipment",
        description: "Water management and irrigation systems",
        isActive: true,
      },
    ];

    for (const cat of categories) {
      const exists = await Category.findOne({ name: cat.name });
      if (!exists) {
        await Category.create(cat);
        console.log(`✅ Category created: ${cat.name}`);
      } else {
        console.log(`ℹ️  Category already exists: ${cat.name}`);
      }
    }

    // Create sample supplier (for testing)
    const supplierExists = await User.findOne({
      email: "supplier@test.com",
      role: "supplier",
    });
    if (!supplierExists) {
      const supplier = await User.create({
        firstname: "John",
        lastname: "Supplier",
        email: "supplier@test.com",
        password: "supplier123",
        role: "supplier",
        phone: "9876543210",
        businessName: "Green Farm Supplies",
        businessAddress: "123 Farm Road, Agriculture City",
        gstNumber: "GST123456789",
        isApproved: true,
        verified: true,
        isActive: true,
      });
      console.log("✅ Sample supplier created:", supplier.email);
    } else {
      console.log("ℹ️  Sample supplier already exists");
    }

    // Create sample customer (for testing)
    const customerExists = await User.findOne({
      email: "customer@test.com",
      role: "customer",
    });
    if (!customerExists) {
      const customer = await User.create({
        firstname: "Jane",
        lastname: "Customer",
        email: "customer@test.com",
        password: "customer123",
        role: "customer",
        phone: "9876543211",
        verified: true,
        isActive: true,
        shippingAddresses: [
          {
            addressLine1: "456 Customer Street",
            city: "Farm City",
            state: "State",
            pincode: "123456",
            country: "India",
            isDefault: true,
          },
        ],
      });
      console.log("✅ Sample customer created:", customer.email);
    } else {
      console.log("ℹ️  Sample customer already exists");
    }

    console.log("\n🎉 Database seeding completed successfully!");
    console.log("\n📝 Test Credentials:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Admin:");
    console.log("  Email: admin@agriather.com");
    console.log("  Password: admin123");
    console.log("\nSupplier:");
    console.log("  Email: supplier@test.com");
    console.log("  Password: supplier123");
    console.log("\nCustomer:");
    console.log("  Email: customer@test.com");
    console.log("  Password: customer123");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
