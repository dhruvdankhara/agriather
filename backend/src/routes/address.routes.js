import express from "express";
import {
  getUserAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../controllers/address.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(verifyJWT);

// Get all user addresses
router.get("/", getUserAddresses);

// Get address by ID
router.get("/:addressId", getAddressById);

// Create new address
router.post("/", createAddress);

// Update address
router.put("/:addressId", updateAddress);

// Delete address
router.delete("/:addressId", deleteAddress);

// Set default address
router.patch("/:addressId/set-default", setDefaultAddress);

export default router;
