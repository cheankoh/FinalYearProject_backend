module.exports = mongoose => {
    const User = mongoose.model(
      "User",
      mongoose.Schema(
        {
          _id: String,
          name: String,
          email: String,
          notifications: [String]
        },
        { timestamps: true }
      )
    );
  
    return User;
  };