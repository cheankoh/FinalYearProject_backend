module.exports = mongoose => {
  const Bid = mongoose.model(
    "Bid",
    mongoose.Schema(
      {
        user_id: String,
        auction_id: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: 'Auction'
        },
        amount: Number,
        blockchain_status: Boolean
      },
      { timestamps: true }
    )
  );

  return Bid;
};
