const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const notesSchema = new mongoose.Schema(
  {
    address: {
      type: String,
      required: true,
      maxlength: 200,
      text: true,
    },
    srt: {
      type: String,
      required: true,
      maxlength: 200,
      text: true,
    },
    requestedBy: {
      type: String,
      required: true,
      maxlength: 200,
      text: true,
    },
    orderedBy: { type: ObjectId, ref: "User" },
    cartId: { type: ObjectId, ref: "Cart" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notes", notesSchema);
