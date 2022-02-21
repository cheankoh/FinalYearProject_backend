const db = require("../models");
var mongoose = require('mongoose');
const User = db.users;
const User_Book = db.user_books;
const Book = db.books_info;

//Login and gain access to the application.
exports.login = (req, res) => {

  // Validate request
  if (!req.body.id) {
    res.status(400).send({ message: "Content1 can not be empty!" });
    return;
  }
  // check if user already exists in database
  var condition = { _id: req.body.id };
  User.findOne(condition).then(data => {
    if (data) { // user already exists, retrieve notifications and clear them from database
      res.status(200).send({ "notifications": data.notifications });
      User.findByIdAndUpdate(condition, { $set: { notifications: [] } }).catch((err) => {
        console.log(err.message);
      });
    }
    else { // user does not exist, add the user into the database
      // Create a User
      const newUser = new User({
        _id: req.body.id,
        name: req.body.name,
        email: req.body.email,
        notifications: []
      });

      // Save User in the database
      newUser
        .save(newUser)
        .then(() => {
          res.status(201).send({
            message: "User was created successfully!",
          });
        })
        .catch((err) => {
          console.log(err.message);
          res.status(500).send({
            message: "User creation failed: " + req.body.id,
          });
        });
    }
  })
    .catch(err => {
      console.error(err);
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving books."
      });
    });
};

//Share an Audiobook with another user.
exports.share = (req, res) => {
  var condition = { _id: req.body.user_id };
  User.findOne(condition).then(ownerUserData => {
    if (ownerUserData) {
      // user exists
      condition = { _id: req.body.book_id };
      Book.findOne(condition).then(bookData => {
        if (bookData.ownerUserID == req.body.user_id) {
          // user is owner of book
          condition = { email: req.body.email };
          User.findOne(condition).then(shareUserData => {
            if (shareUserData) {
              // recipient user exists
              condition = { user_id: shareUserData._id, book_id: bookData._id };
              User_Book.findOne(condition).then(existsCheck => {

                if (!existsCheck) {
                  // book has not been shared previously
                  const newUserBook = new User_Book({
                    user_id: shareUserData._id,
                    book_id: req.body.book_id,
                    currentPage: 1,
                    currentSentence: 1,
                    book_title: bookData.pdfName,
                    bookmarks: []
                  });
                  // Save User_Book in the database
                  newUserBook
                    .save(newUserBook)
                    .then(() => {
                      res.status(201).send({
                        message: "Book was shared successfully!",
                      });
                      // update recipient user notifications
                      var notificationStr = ownerUserData.name + " has shared book \"" + bookData.pdfName + "\" with you.";
                      shareUserData.notifications.push(notificationStr);
                      User.findByIdAndUpdate(shareUserData._id, { $set: { notifications: shareUserData.notifications } }).catch((err) => {
                        console.log(err.message);
                      });
                    })
                }
                else { // user_book for book and user already exists
                  res.status(404).send({
                    message:
                      "Book already shared with recipient user"
                  });
                }

              });

            }
            else { // receipient does not exist
              res.status(404).send({
                message:
                  "Receipient user not found."
              });
            }

          });
        }

        else { // user is not owner of book
          res.status(401).send({
            message:
              "User is not owner of selected book."
          });
        }
      }).catch((err) => { // book does not exist
        res.status(404).send({
          message:
            "Book not found."
        });
      });
    }
    else { // user does not exist
      res.status(404).send({
        message:
          "User not found."
      });
    }
  })
    .catch((err) => { // catch any general errors to fail gracefully
      console.log(err.message);
      res.status(500).send({
        message: "Book sharing failed",
      });
    });
}

//Add a bookmark to the specifc Audiobook.
exports.addBookmark = (req, res) => {
  condition = { user_id: req.body.user_id, book_id: mongoose.Types.ObjectId(req.body.book_id) };
  User_Book.findOne(condition).then(bookData => { // seach for user_book to add bookmark into
    if (!bookData) { // if-guard to ensure corresponding user_book is found
      res.status(404).send({
        message: "User_Book not found",
      });
      return;
    }
    // corresponding user_book exists
    var newBookmark = { // create bookmark object with given parameters
      "name": req.body.name,
      "page": req.body.page
    }
    bookData.bookmarks.push(newBookmark); // add new bookmark to copy of existing bookmark array
    User_Book.findByIdAndUpdate(bookData._id, { $set: { bookmarks: bookData.bookmarks } }) // update database with new bookmark array
      .catch((err) => {
        console.log(err.message); // would not happen, since we directly use the _id from the found user_book. Placed here for safety and debugging
      });
    res.status(201).send({ // Send success response
      bookmarks: bookData.bookmarks
    });
  })
    .catch((err) => {
      console.log(err.message);
      res.status(500).send({
        message: "Add bookmark failed",
      });
    });
}

//Remove a bookmark from a specific Audiobook.
exports.removeBookmark = (req, res) => {
  condition = { user_id: req.body.user_id, book_id: req.body.book_id };
  User_Book.findOne(condition).then(bookData => { // search user_books for a corresponding entry
    const indx = bookData.bookmarks.findIndex(v => v._id.toString() === req.body.bookmark_id); // search array for index of bookmarkID to remove

    if (indx != -1) {
      // bookmark with matching id found
      bookData.bookmarks.splice(indx, 1);
      User_Book.findByIdAndUpdate(bookData._id, { $set: { bookmarks: bookData.bookmarks } }).catch((err) => {
        console.log(err.message);
      });
      res.status(200).send({
        bookmarks: bookData.bookmarks
      });
      return;
    }
    // bookmark with matching id not found
    res.status(404).send({
      message: "Bookmark not found",
    });
  })
    .catch((err) => {
      console.log(err.message);
      res.status(500).send({
        message: "Remove bookmark failed",
      });
    });
}
