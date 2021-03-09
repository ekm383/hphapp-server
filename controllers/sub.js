const Sub = require("../models/sub");
const Product = require("../models/product");
const slugify = require("slugify");

exports.create = async (req, res) => {
  try {
    const { name, parent } = req.body;
    res.json(await new Sub({ name, parent, slug: slugify(name) }).save());
  } catch (err) {
    console.log(err);
    res.status(400).send("Create Sub Failed");
  }
};

exports.list = async (req, res) => {
  try {
    res.json(await Sub.find({}).sort({ createdAt: -1 }).exec());
  } catch (err) {
    console.log(err);
    res.status(400).send("List Sub Failed");
  }
};

exports.read = async (req, res) => {
  let sub = await Sub.findOne({ slug: req.params.slug }).exec();
  const products = await Product.find({ subs: sub })
    .populate("category")
    .exec();
  res.json({
    sub,
    products,
  });
};

exports.update = async (req, res) => {
  const { name, parent } = req.body;
  try {
    const updated = await Sub.findOneAndUpdate(
      // fond the slug to update
      { slug: req.params.slug },
      // the items to update
      { name: parent, slug: slugify(name) },
      // updates new category information
      { new: true }
    ).exec();
    res.json(updated);
  } catch (err) {
    console.log(err);
    res.status(400).send("Sub Update Failed");
  }
};

exports.remove = async (req, res) => {
  try {
    const deleted = await Sub.findOneAndDelete({
      slug: req.params.slug,
    }).exec();
    res.json(deleted);
  } catch (err) {
    console.log(err);
    res.status(400).send("Sub Delete Failed");
  }
};
