const Category = require("../models/category");
const Product = require("../models/product");
const Sub = require("../models/sub");
const slugify = require("slugify");

exports.create = async (req, res) => {
  try {
    const { name } = req.body;
    const category = await new Category({ name, slug: slugify(name) }).save();
    res.json(category);
  } catch (err) {
    console.log(err);
    res.status(400).send("Create Category Failed");
  }
};

exports.list = async (req, res) => {
  try {
    const category = await Category.find({}).sort({ createdAt: -1 }).exec();
    res.json(category);
  } catch (err) {
    console.log(err);
    res.status(400).send("List Category Failed");
  }
};

exports.read = async (req, res) => {
  let category = await Category.findOne({ slug: req.params.slug }).exec();
  // res.json(category);
  const products = await Product.find({ category }).populate("category").exec();
  res.json({
    category,
    products,
  });
};

exports.update = async (req, res) => {
  const { name } = req.body;
  try {
    const updated = await Category.findOneAndUpdate(
      // fond the slug to update
      { slug: req.params.slug },
      // the items to update
      { name: name, slug: slugify(name) },
      // updates new category information
      { new: true }
    ).exec();
    res.json(updated);
  } catch (err) {
    console.log(err);
    res.status(400).send("Category Update Failed");
  }
};

exports.remove = async (req, res) => {
  try {
    const deleted = await Category.findOneAndDelete({
      slug: req.params.slug,
    }).exec();
    res.json(deleted);
  } catch (err) {
    console.log(err);
    res.status(400).send("Category Delete Failed");
  }
};

// getting the subs based on the parent category
exports.getSubs = (req, res) => {
  Sub.find({ parent: req.params._id }).exec((err, subs) => {
    if (err) console.log(err);
    res.json(subs);
  });
};
