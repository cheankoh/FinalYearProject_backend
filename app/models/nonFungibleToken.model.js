module.exports = (mongoose) => {
  const NonFungibleToken = mongoose.model(
    "NonFungibleToken",
    mongoose.Schema(
      {
        name: String,
        level: Number,
        blockchain_status: Boolean,
      },
      { timestamps: true }
    )
  );

  return NonFungibleToken;
};
