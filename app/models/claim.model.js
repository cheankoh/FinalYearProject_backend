module.exports = mongoose => {
  const Claim = mongoose.model(
    "Claim",
    mongoose.Schema(
      {
        user_id: String,
        // {
        //   type: mongoose.Schema.Types.ObjectId,
        //   required: true,
        //   ref: 'User'
        // },
        claim_date: Date,
        amount: Number,
        blockchain_status: Boolean,
      },
      { timestamps: true }
    )
  );

  return Claim;
};
