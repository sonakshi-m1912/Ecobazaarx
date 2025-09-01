import express from "express";
import { getProducts, addProduct } from "../controllers/productController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Routes
router.get("/", getProducts);
router.post("/", authMiddleware, addProduct);

export default router;
