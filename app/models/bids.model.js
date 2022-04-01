// const db = require("../models");
const Page = require("./pages.model.js");
const mongoose = require("mongoose");

const page = Page.Schema;

module.exports = (mongoose) => {
  const BookContent = mongoose.model(
    "BookContent",
    mongoose.Schema(
      {
        bookID: String,
        page: [page],
      },
      { timestamps: true }
    )
  );

  return BookContent;
};
