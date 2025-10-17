import express from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../controllers/cart.controller.js";
import { verifyJWT, requireCustomer } from "../middlewares/auth.middleware.js";

const router = express.Router();

// All routes require customer authentication
router.use(verifyJWT, requireCustomer);

router.get("/", getCart);
router.post("/items", addToCart);
router.put("/items/:itemId", updateCartItem);
router.delete("/items/:itemId", removeFromCart);
router.delete("/", clearCart);

export default router;
