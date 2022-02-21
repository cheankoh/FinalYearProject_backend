module.exports = (mongoose) => {
  const BookInfo = mongoose.model(
    "BookInfo",
    mongoose.Schema(
      {
        ownerUserID: String,
        pdfName: String,
        author: String,
      },
      { timestamps: true }
    )
  );

  return BookInfo;
};
