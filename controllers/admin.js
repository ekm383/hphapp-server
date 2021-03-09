const Order = require("../models/order");

exports.orders = async (req, res) => {
  try {
    let allOrders = await Order.find({ archived: "No" })
      .populate("products.product")
      .sort([["createdAt", "desc"]])
      .exec();

    res.json(allOrders);
  } catch (err) {
    console.log(err);
  }
};

exports.orderStatus = async (req, res) => {
  // console.log(req.body);
  // return;
  const { orderId, orderStatus } = req.body;

  let updated = await Order.findByIdAndUpdate(
    orderId,
    { orderStatus },
    { new: true }
  ).exec();

  res.json(updated);
};

exports.archiveOrder = async (req, res) => {
  const { orderId } = req.body;

  let archived = await Order.findByIdAndUpdate(
    orderId,
    { archived: "Yes" },
    { new: true }
  ).exec();

  res.json(archived);
};
