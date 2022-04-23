module.exports = mongoose => {
  const Auction = mongoose.model(
    "Auction",
    mongoose.Schema(
      {
        beneficiary_id: String,
        nft_id: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: 'NonFungibleToken'
        },
        bid_start_time: { type: Date, default: Date.now },
        bid_end_time: { type: Date, default: Date.now },
        blockchain_status: Boolean
      },
      { timestamps: true }
    )
  );

  return Auction;
};
