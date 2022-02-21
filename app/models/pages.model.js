const mongoose = require("mongoose");

const PageSchema = mongoose.Schema(
  {
    page_number: Number,
    body: String,
  },
  { timestamps: true }
);

module.exports = (mongoose) => {
  const Page = mongoose.model("Page", PageSchema);

  return Page;
};

module.exports.Schema = PageSchema;
