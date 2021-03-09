const express = require("express");
const router = express.Router();

const { authCheck } = require("../middlewares/auth");

const {
  userCart,
  getUserCart,
  emptyUserCart,
  // saveAddress,
  saveNotes,
  applyCouponToUserCart,
  createOrder,
  orders,
  addToWishlist,
  wishlist,
  removeFromWishlist,
  createCashOrder,
  // applyTaxToUserCart,
} = require("../controllers/user");

router.post("/user/cart", authCheck, userCart);
router.get("/user/cart", authCheck, getUserCart);
router.delete("/user/cart", authCheck, emptyUserCart);
// router.post("/user/address", authCheck, saveAddress);

// orders
router.post("/user/order", authCheck, createOrder); // stripe
router.post("/user/cash-order", authCheck, createCashOrder); // COD
router.get("/user/orders", authCheck, orders);

// coupon
router.post("/user/cart/coupon", authCheck, applyCouponToUserCart);
router.post("/user/notes", authCheck, saveNotes);

// tax
// router.post("/user/cart/tax", authCheck, applyTaxToUserCart);

// wishlist
router.post("/user/wishlist", authCheck, addToWishlist);
router.get("/user/wishlist", authCheck, wishlist);
router.put("/user/wishlist/:productId", authCheck, removeFromWishlist);

module.exports = router;
