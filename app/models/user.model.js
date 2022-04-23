module.exports = mongoose => {
  const User = mongoose.model(
    "User",
    mongoose.Schema(
      {
        _id: String,
        email: String,
        nft_id: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: 'NonFungibleToken'
        },
        wallet: String,
        session: String,
        token_amount: Number
      },
      { timestamps: true }
    )
  );

  return User;
};