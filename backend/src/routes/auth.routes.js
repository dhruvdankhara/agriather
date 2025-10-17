import express from "express";
import {
  register,
  login,
  logout,
  getCurrentUser,
  updateProfile,
  changePassword,
  updateAvatar,
  addShippingAddress,
  updateShippingAddress,
  deleteShippingAddress,
} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middlewares.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes
router.post("/logout", verifyJWT, logout);
router.get("/me", verifyJWT, getCurrentUser);
router.put("/profile", verifyJWT, updateProfile);
router.put("/change-password", verifyJWT, changePassword);
router.put("/avatar", verifyJWT, upload.single("avatar"), updateAvatar);

// Shipping address routes (Customer)
router.post("/shipping-address", verifyJWT, addShippingAddress);
router.put("/shipping-address/:addressId", verifyJWT, updateShippingAddress);
router.delete("/shipping-address/:addressId", verifyJWT, deleteShippingAddress);

export default router;
