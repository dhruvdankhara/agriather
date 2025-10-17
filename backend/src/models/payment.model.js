import mongoose from "mongoose";
import { PAYMENT_STATUS, PAYMENT_METHOD } from "../constants.js";

const paymentSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: Object.values(PAYMENT_METHOD),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
    },
    paymentGatewayResponse: {
      type: mongoose.Schema.Types.Mixed,
    },
    paidAt: {
      type: Date,
    },
    failureReason: {
      type: String,
    },
  },
  { timestamps: true }
);

// Generate transaction ID before saving
paymentSchema.pre("save", async function (next) {
  if (!this.transactionId) {
    try {
      this.transactionId = `TXN${Date.now()}${Math.random()
        .toString(36)
        .substring(2, 9)
        .toUpperCase()}`;
    } catch (error) {
      console.error("Error generating transaction ID:", error);
      // Fallback to timestamp-based ID
      this.transactionId = `TXN${Date.now()}`;
    }
  }
  next();
});

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
