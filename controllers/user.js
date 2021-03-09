const User = require("../models/user");
const Product = require("../models/product");
const Cart = require("../models/cart");
const Coupon = require("../models/coupon");
const Order = require("../models/order");
const Notes = require("../models/notes");
const uniqueid = require("uniqueid");

exports.userCart = async (req, res) => {
  console.log("User cart", req.body); // {cart: []}
  const { cart } = req.body;

  let products = [];

  const user = await User.findOne({ email: req.user.email }).exec();

  // check cart with logged in ID already exists
  let cartExistsByThisUser = await Cart.findOne({ orderedBy: user._id }).exec();

  if (cartExistsByThisUser) {
    cartExistsByThisUser.remove();
    // console.log("removed old cart");
  }

  for (let i = 0; i < cart.length; i++) {
    let object = {};
    object.product = cart[i]._id;
    object.count = cart[i].count;
    object.color = cart[i].color;
    // get price for creating total
    let productFromDb = await Product.findById(cart[i]._id)
      .select("price")
      .exec();
    object.price = productFromDb.price;

    products.push(object);
  }

  // console.log("products", products);

  let cartTotal = 0;
  for (let i = 0; i < products.length; i++) {
    cartTotal = cartTotal + products[i].price * products[i].count;
  }

  // console.log("cartTotal", cartTotal);

  let newCart = await new Cart({
    products,
    cartTotal,
    orderedBy: user._id,
  }).save();

  // console.log("New Cart", newCart);
  res.json({ ok: true });
};

exports.getUserCart = async (req, res) => {
  const user = await User.findOne({ email: req.user.email }).exec();
  let cart = await Cart.findOne({ orderedBy: user._id })
    .populate(
      "products.product",
      "_id title price totalAfterDiscount tax totalAfterTax"
    )
    .exec();

  const { products, cartTotal, totalAfterDiscount, tax, totalAfterTax } = cart;
  res.json({ products, cartTotal, totalAfterDiscount, tax, totalAfterTax }); // req.data.products if not descructured
};

exports.emptyUserCart = async (req, res) => {
  const user = await User.findOne({ email: req.user.email }).exec();
  const cart = await Cart.findOneAndRemove({ orderedBy: user._id }).exec();
  res.json(cart);
};

exports.saveNotes = async (req, res) => {
  const user = await User.findOne({ email: req.user.email }).exec();
  const cart = await Cart.findOne({ orderedBy: user._id }).exec();
  // console.log("Notes ---->", req.body, user, cart); // {notes: []}
  let newNotes = await new Notes({
    address: req.body.notes,
    srt: req.body.srt,
    requestedBy: req.body.requestedBy,
    orderedBy: user._id,
    cartId: cart._id,
  }).save();

  // console.log("New Cart", newCart);
  res.json({ ok: true });
};

exports.applyCouponToUserCart = async (req, res) => {
  // coupon from the front end in the request body
  const { coupon } = req.body;
  // console.log("COUPON", coupon);

  // check coupon is valid
  const validCoupon = await Coupon.findOne({ name: coupon }).exec();
  if (validCoupon === null) {
    return res.json({
      err: "Invalid Coupon",
    });
  }
  // console.log("Valid Coupon", validCoupon);

  // check if user logged in
  const user = await User.findOne({ email: req.user.email }).exec();

  // get the cart from above user id
  let { products, cartTotal } = await Cart.findOne({
    orderedBy: user._id,
  })
    .populate("products.product", "_id title price")
    .exec();

  // console.log("cartTotal", cartTotal, "discount", validCoupon.discount);

  // calculate total after discount
  let totalAfterDiscount = (
    cartTotal -
    (cartTotal * validCoupon.discount) / 100
  ).toFixed(2);

  Cart.findOneAndUpdate(
    { orderedBy: user._id },
    { totalAfterDiscount },
    { new: true }
  ).exec();

  res.json(totalAfterDiscount);
};

// Save order and empty cart
exports.createOrder = async (req, res) => {
  const { paymentIntent } = req.body.stripeResponse;
  const user = await User.findOne({ email: req.user.email }).exec();
  let { products } = await Cart.findOne({ orderedBy: user._id }).exec();

  let newOrder = await new Order({
    products,
    paymentIntent,
    orderedBy: user._id,
  }).save();

  // update quantity in db
  let bulkOption = products.map((item) => {
    return {
      updateOne: {
        filter: { _id: item.product._id }, // IMPORTANT item.product
        update: { $inc: { quantity: -item.count, sold: +item.count } },
      },
    };
  });

  let updated = await Product.bulkWrite(bulkOption, {});
  // console.log("PRODUCT QTY DEC AND SOLD", updated);

  res.json({ ok: true });
};

exports.orders = async (req, res) => {
  let user = await User.findOne({ email: req.user.email }).exec();

  let userOrders = await Order.find({ orderedBy: user._id })
    .populate("products.product")
    .sort([["createdAt", "desc"]])
    .exec();

  res.json(userOrders);
};

exports.createCashOrder = async (req, res) => {
  const { COD, couponApplied, tax, totalAfterTax } = req.body;

  // if COD is true, create order and status COD
  if (!COD) return res.status(400).send("Create Cash Order Failed");

  const user = await User.findOne({ email: req.user.email }).exec();
  let userCart = await Cart.findOne({ orderedBy: user._id }).exec();
  const notes = await Notes.findOne({ cartId: userCart._id }).exec();

  // console.log("Cash Order ---->", user, userCart, notes);

  // calculate with coupon applied
  let finalAmount = 0;
  if (couponApplied && userCart.totalAfterDiscount) {
    finalAmount = userCart.totalAfterDiscount * 100;
  } else {
    finalAmount = userCart.cartTotal * 100;
  }

  let newOrder = await new Order({
    products: userCart.products,
    paymentIntent: {
      id: uniqueid(),
      amount: finalAmount,
      currency: "usd",
      status: "Cash on Delivery",
      created: Date.now(),
      payment_method_types: ["cash"],
      tax: tax,
      totalAfterTax: totalAfterTax,
      address: notes.address,
      srt: notes.srt,
      requestedBy: notes.requestedBy,
    },
    orderedBy: user._id,
    orderStatus: "Cash on Delivery",
  }).save();

  // TO DO: Clear out the notes once it moves into a new order
  // update quantity in db
  let bulkOption = userCart.products.map((item) => {
    return {
      updateOne: {
        filter: { _id: item.product._id }, // IMPORTANT item.product
        update: { $inc: { quantity: -item.count, sold: +item.count } },
      },
    };
  });

  let updated = await Product.bulkWrite(bulkOption, {});
  // console.log("PRODUCT QTY DEC AND SOLD", updated);

  res.json({ ok: true });
};

// wishlist controllers

exports.addToWishlist = async (req, res) => {
  const { productId } = req.body;

  const user = await User.findOneAndUpdate(
    { email: req.user.email },
    {
      $addToSet: {
        wishlist: productId,
      },
    }
  ).exec();
  res.json({ ok: true });
};

exports.wishlist = async (req, res) => {
  const list = await User.findOne({ email: req.user.email })
    .select("wishlist")
    .populate("wishlist")
    .exec();
  res.json(list);
};

exports.removeFromWishlist = async (req, res) => {
  const { productId } = req.params;
  const user = await User.findOneAndUpdate(
    { email: req.user.email },
    { $pull: { wishlist: productId } }
  ).exec();
  res.json({ ok: true });
};
