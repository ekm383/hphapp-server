const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: true,
      maxlength: 100,
      text: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    part: {
      type: String,
      trim: true,
      required: true,
      maxlength: 50,
      text: true,
    },
    description: {
      type: String,
      maxlength: 2000,
      text: true,
    },
    featureone: {
      type: String,
      maxlength: 100,
      text: true,
    },
    featuretwo: {
      type: String,
      maxlength: 100,
      text: true,
    },
    featurethree: {
      type: String,
      maxlength: 100,
      text: true,
    },
    featurefour: {
      type: String,
      maxlength: 100,
      text: true,
    },
    price: {
      type: Number,
      required: true,
      trim: true,
      maxlength: 32,
    },
    retail: {
      type: Number,
      required: true,
      trim: true,
      maxlength: 32,
    },
    category: {
      type: ObjectId,
      ref: "Category",
    },
    subs: [
      {
        type: ObjectId,
        ref: "Sub",
      },
    ],
    quantity: Number,
    // sold: {
    //   type: Number,
    //   default: 0,
    // },
    images: {
      type: Array,
    },
    active: {
      type: String,
      default: "Yes",
      enum: ["Yes", "No"],
    },
    // shipping: {
    //   type: String,
    //   enum: ["Yes", "No"],
    // },
    // color: {
    //   type: String,
    //   enum: ["Black", "Brown", "Silver", "White", "Blue"],
    // },
    // brand: {
    //   type: String,
    //   enum: ["Apple", "Samsung", "Microsoft", "Lenovo", "Asus"],
    // },
    // ratings: [
    //   {
    //     star: Number,
    //     postedBy: {
    //       type: ObjectId,
    //       ref: "User",
    //     },
    //   },
    // ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);
