import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/user.model.js";
import Category from "../models/category.model.js";
import Product from "../models/product.model.js";
import Address from "../models/address.model.js";
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
    // await Product.deleteMany({});
    // await Address.deleteMany({});
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

      // Create business address for supplier
      await Address.create({
        user: supplier._id,
        type: "business",
        label: "Business Office",
        addressLine1: "123 Farm Road",
        addressLine2: "Agriculture Complex",
        landmark: "Near Railway Station",
        city: "Agriculture City",
        state: "Gujarat",
        pincode: "380001",
        country: "India",
        phone: supplier.phone,
        isDefault: true,
        isActive: true,
      });
      console.log("✅ Sample business address created for supplier");
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
      });
      console.log("✅ Sample customer created:", customer.email);

      // Create sample address for customer
      await Address.create({
        user: customer._id,
        type: "shipping",
        label: "Home",
        addressLine1: "456 Customer Street",
        addressLine2: "Near Green Park",
        landmark: "Opposite City Mall",
        city: "Farm City",
        state: "Maharashtra",
        pincode: "123456",
        country: "India",
        phone: customer.phone,
        isDefault: true,
        isActive: true,
      });
      console.log("✅ Sample address created for customer");
    } else {
      console.log("ℹ️  Sample customer already exists");
    }

    // Create sample products (for testing)
    const supplier = await User.findOne({
      email: "supplier@test.com",
      role: "supplier",
    });
    const categories_data = await Category.find({});

    if (supplier && categories_data.length > 0) {
      const fertilizerCategory = categories_data.find(
        (cat) => cat.name === "Fertilizers"
      );
      const seedsCategory = categories_data.find((cat) => cat.name === "Seeds");
      const pesticideCategory = categories_data.find(
        (cat) => cat.name === "Pesticides"
      );
      const machineryCategory = categories_data.find(
        (cat) => cat.name === "Machinery"
      );
      const irrigationCategory = categories_data.find(
        (cat) => cat.name === "Irrigation Equipment"
      );

      const sampleProducts = [
        {
          name: "Organic NPK Fertilizer",
          description:
            "Premium quality organic NPK fertilizer with balanced nutrients for all crops. Contains essential nitrogen, phosphorus, and potassium for healthy plant growth.",
          category: fertilizerCategory?._id,
          supplier: supplier._id,
          price: 850,
          discountPrice: 750,
          stock: 500,
          unit: "kg",
          images: [
            "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=500",
          ],
          specifications: {
            "Nitrogen (N)": "12%",
            "Phosphorus (P)": "12%",
            "Potassium (K)": "17%",
            "Organic Matter": "45%",
            "Package Size": "50 kg bag",
          },
          tags: ["organic", "fertilizer", "npk", "nutrients"],
          averageRating: 4.5,
          totalReviews: 23,
          isActive: true,
        },
        {
          name: "Hybrid Tomato Seeds",
          description:
            "High-yielding hybrid tomato seeds with excellent disease resistance. Perfect for commercial farming with consistent fruit quality.",
          category: seedsCategory?._id,
          supplier: supplier._id,
          price: 1200,
          discountPrice: 950,
          stock: 200,
          unit: "packet",
          images: [
            "https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=500",
          ],
          specifications: {
            Variety: "Hybrid F1",
            Germination: "85-90%",
            "Maturity Period": "65-70 days",
            "Seed Count": "100 seeds per packet",
          },
          tags: ["seeds", "tomato", "hybrid", "vegetables"],
          averageRating: 4.8,
          totalReviews: 45,
          isActive: true,
        },
        {
          name: "Bio Pesticide Spray",
          description:
            "Eco-friendly bio pesticide for effective pest control without harmful chemicals. Safe for plants, beneficial insects, and the environment.",
          category: pesticideCategory?._id,
          supplier: supplier._id,
          price: 450,
          discountPrice: 380,
          stock: 350,
          unit: "liter",
          images: [
            "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500",
          ],
          specifications: {
            Type: "Biological",
            "Active Ingredient": "Bacillus thuringiensis",
            Coverage: "1 acre per liter",
            "Shelf Life": "2 years",
          },
          tags: ["pesticide", "organic", "bio", "pest-control"],
          averageRating: 4.3,
          totalReviews: 18,
          isActive: true,
        },
        {
          name: "Wheat Seeds - PBW 725",
          description:
            "Premium quality wheat seeds with high yield potential and drought tolerance. Suitable for various soil types.",
          category: seedsCategory?._id,
          supplier: supplier._id,
          price: 2500,
          stock: 800,
          unit: "kg",
          images: [
            "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500",
          ],
          specifications: {
            Variety: "PBW 725",
            Germination: "90%",
            "Maturity Period": "140-145 days",
            "Yield Potential": "50-55 quintals/hectare",
          },
          tags: ["seeds", "wheat", "cereal", "high-yield"],
          averageRating: 4.6,
          totalReviews: 67,
          isActive: true,
        },
        {
          name: "Drip Irrigation Kit",
          description:
            "Complete drip irrigation system for 1 acre. Includes drippers, pipes, filters, and fittings. Saves up to 70% water.",
          category: irrigationCategory?._id,
          supplier: supplier._id,
          price: 25000,
          discountPrice: 22500,
          stock: 50,
          unit: "set",
          images: [
            "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=500",
          ],
          specifications: {
            Coverage: "1 acre",
            "Flow Rate": "4 LPH drippers",
            Material: "UV stabilized LLDPE",
            Warranty: "2 years",
          },
          tags: ["irrigation", "drip", "water-saving", "equipment"],
          averageRating: 4.7,
          totalReviews: 34,
          isActive: true,
        },
        {
          name: "Power Tiller - 7HP",
          description:
            "Versatile 7HP power tiller for land preparation, weeding, and cultivation. Suitable for small to medium farms.",
          category: machineryCategory?._id,
          supplier: supplier._id,
          price: 45000,
          discountPrice: 42000,
          stock: 15,
          unit: "piece",
          images: [
            "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=500",
          ],
          specifications: {
            Power: "7 HP",
            "Engine Type": "4-stroke diesel",
            "Tilling Width": "90 cm",
            Weight: "150 kg",
          },
          tags: ["machinery", "tiller", "cultivation", "farming"],
          averageRating: 4.4,
          totalReviews: 12,
          isActive: true,
        },
        {
          name: "Vermicompost Organic Fertilizer",
          description:
            "100% organic vermicompost rich in beneficial microorganisms. Improves soil structure and plant health naturally.",
          category: fertilizerCategory?._id,
          supplier: supplier._id,
          price: 600,
          discountPrice: 500,
          stock: 600,
          unit: "kg",
          images: [
            "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=500",
          ],
          specifications: {
            "Organic Carbon": "15-20%",
            Nitrogen: "1.5-2%",
            Phosphorus: "1-1.5%",
            Potassium: "1-1.5%",
            Moisture: "15-20%",
          },
          tags: ["organic", "fertilizer", "vermicompost", "eco-friendly"],
          averageRating: 4.9,
          totalReviews: 89,
          isActive: true,
        },
        {
          name: "Rice Seeds - Basmati 1121",
          description:
            "Premium Basmati 1121 rice seeds with extra-long grains and excellent aroma. High market value variety.",
          category: seedsCategory?._id,
          supplier: supplier._id,
          price: 3500,
          discountPrice: 3200,
          stock: 400,
          unit: "kg",
          images: [
            "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500",
          ],
          specifications: {
            Variety: "Pusa Basmati 1121",
            Germination: "85%",
            "Maturity Period": "145-150 days",
            "Grain Length": "8.4 mm",
          },
          tags: ["seeds", "rice", "basmati", "premium"],
          averageRating: 4.7,
          totalReviews: 56,
          isActive: true,
        },
      ];

      for (const productData of sampleProducts) {
        const exists = await Product.findOne({ name: productData.name });
        if (!exists) {
          await Product.create(productData);
          console.log(`✅ Product created: ${productData.name}`);
        } else {
          console.log(`ℹ️  Product already exists: ${productData.name}`);
        }
      }
    } else {
      console.log(
        "⚠️  Skipping product creation - supplier or categories not found"
      );
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
