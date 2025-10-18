import Razorpay from "razorpay";
import crypto from "crypto";

// Initialize Razorpay instance
export const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Create a Razorpay order
 * @param {Number} amount - Amount in rupees (will be converted to paise)
 * @param {String} currency - Currency code (default: INR)
 * @param {String} receipt - Receipt/Order ID for tracking
 * @returns {Object} Razorpay order object
 */
export const createRazorpayOrder = async (
  amount,
  currency = "INR",
  receipt
) => {
  try {
    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency,
      receipt,
      payment_capture: 1, // Auto capture payment
    };

    const order = await razorpayInstance.orders.create(options);
    return order;
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    throw error;
  }
};

/**
 * Verify Razorpay payment signature
 * @param {String} orderId - Razorpay order ID
 * @param {String} paymentId - Razorpay payment ID
 * @param {String} signature - Razorpay signature
 * @returns {Boolean} True if signature is valid
 */
export const verifyPaymentSignature = (orderId, paymentId, signature) => {
  try {
    const text = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest("hex");

    return expectedSignature === signature;
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
};

/**
 * Fetch payment details from Razorpay
 * @param {String} paymentId - Razorpay payment ID
 * @returns {Object} Payment details
 */
export const fetchPaymentDetails = async (paymentId) => {
  try {
    const payment = await razorpayInstance.payments.fetch(paymentId);
    return payment;
  } catch (error) {
    console.error("Error fetching payment details:", error);
    throw error;
  }
};

/**
 * Initiate refund
 * @param {String} paymentId - Razorpay payment ID
 * @param {Number} amount - Amount to refund in rupees
 * @returns {Object} Refund details
 */
export const initiateRefund = async (paymentId, amount) => {
  try {
    const refund = await razorpayInstance.payments.refund(paymentId, {
      amount: Math.round(amount * 100), // Convert to paise
    });
    return refund;
  } catch (error) {
    console.error("Refund initiation error:", error);
    throw error;
  }
};

/**
 * Fetch refund details
 * @param {String} refundId - Razorpay refund ID
 * @returns {Object} Refund details
 */
export const fetchRefundDetails = async (refundId) => {
  try {
    const refund = await razorpayInstance.refunds.fetch(refundId);
    return refund;
  } catch (error) {
    console.error("Error fetching refund details:", error);
    throw error;
  }
};
