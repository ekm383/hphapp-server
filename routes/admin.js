const express = require("express");
const router = express.Router();

// middlewares
const { authCheck, adminCheck } = require("../middlewares/auth");

const { orders, orderStatus, archiveOrder } = require("../controllers/admin");

// routes
router.get("/admin/orders", authCheck, adminCheck, orders);
router.put("/admin/order-status", authCheck, adminCheck, orderStatus);
router.put("/admin/order/:orderId", authCheck, adminCheck, archiveOrder);

module.exports = router;
