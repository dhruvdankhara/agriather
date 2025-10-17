import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["shipping", "billing", "business"],
      default: "shipping",
    },
    label: {
      type: String,
      trim: true,
      default: "Home",
    },
    addressLine1: {
      type: String,
      required: true,
      trim: true,
    },
    addressLine2: {
      type: String,
      trim: true,
    },
    landmark: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    pincode: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      default: "India",
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Index for faster queries
addressSchema.index({ user: 1, isDefault: 1 });
addressSchema.index({ user: 1, type: 1 });

// Ensure only one default address per user per type
addressSchema.pre("save", async function (next) {
  if (this.isDefault) {
    await this.constructor.updateMany(
      {
        user: this.user,
        type: this.type,
        _id: { $ne: this._id },
      },
      { isDefault: false }
    );
  }
  next();
});

const Address = mongoose.model("Address", addressSchema);

export default Address;
