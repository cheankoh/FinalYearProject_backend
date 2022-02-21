module.exports = mongoose => {
    const UserBook = mongoose.model(
      "UserBook",
      mongoose.Schema(
        {
          user_id: String,
          book_title: String,
          book_id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Book'
          },
          currentPage: Number,
          currentSentence: Number,
          bookmarks: [{
            page: Number,
            name: String
          }]
        },
        { timestamps: true }
      ),
      "user_books"
    );
  
    return UserBook;
  };
