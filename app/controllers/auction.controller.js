const db = require("../models");
const BookInfo = db.books_info;
const BookContent = db.books_content;
const UserBooks = db.user_books;
const Book = db.books_info;
const User = db.users;

// Retrieve all BookTitles(Infos) owned by & shared to the user.
exports.getAllTitles = async (req, res) => {
  var sharedBooks = [];
  var ownedBooks = [];
  const userID = req.query.userid;
  var condition = { user_id: userID };

  // Retrieve all audiobooks accesible by the user, be it uploaded or shared
  await UserBooks.find(condition)
    .then((userbooks) => {
      var bar = new Promise(async (resolve) => {

        for (const userbook of userbooks) {
          condition = { _id: userbook.book_id };
          await BookInfo.find(condition).then((bookInfo) => {
            let renamed = {
              'title': userbook.book_title,
              ...bookInfo[0]['_doc']
            }
            renamed['book_id'] = renamed['_id'];
            delete renamed['_id'];

            //Push Userbook to shared/owned array
            if (bookInfo[0].ownerUserID == userbook.user_id) {
              ownedBooks.push(renamed);
            } else {
              sharedBooks.push(renamed);
            }
          });
        } resolve()
      });

      bar.then(() => {
        res.send({ "OwnedBooks": ownedBooks, "SharedBooks": sharedBooks });
      });

    })
    .catch((err) => {
      console.error(err);
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving books.",
      });
    });

};

// Find a specified Book and its contents
exports.findOne = (req, res) => {
  const id = req.params.id;
  var condition = { bookID: id };

  BookContent.find(condition)
    .then((data) => {
      if (!data)
        res.status(404).send({ message: "Not found Book with id " + id });
      else res.send(data);
    })
    .catch((err) => {
      res.status(500).send({ message: "Error retrieving Book with id=" + id });
    });
};

// Update the name of the specified Book
exports.updateName = (req, res) => {
  var condition = { user_id: req.body.user_id, book_id: req.params.id };
  UserBooks.find(condition).then((data) => {
    if (data) {
      condition = { _id: data[0]._id }
      UserBooks.findByIdAndUpdate(condition, { $set: { book_title: req.body.newBookTitle } })
        .then((data) => {
          res.status(200).send({ message: "Name changed sucessfully" });
        });
    }
    else {
      res.status(500).send({ message: "Error retrieving Book with id=" + req.params.id });
    }
  })
    .catch((err) => {
      res.status(500).send({ message: "Error retrieving Book with id=" + req.params.id });
    });
};

//Get the progress of the specifed user and book.
exports.getProgress = (req, res) => {
  const bookID = req.params.id;
  const userID = req.query.userid;

  var condition = { book_id: bookID, user_id: userID };

  UserBooks.findOne(condition)
    .then((data) => {
      if (!data)
        res.status(404).send({ message: "Progress Not found" })
      else res.send(data);
    })
    .catch((err) => {
      res.status(500).send({ message: "Error retrieving Progress" });
    });
};

//Update the progress of the specifed user and book.
exports.updateProgress = (req, res) => {
  const bookID = req.params.id;
  const userID = req.query.userid;
  const newPage = req.body.current_page;
  const newSentence = req.body.current_sentence;
  var condition = { book_id: bookID, user_id: userID };

  UserBooks.updateOne(condition, { $set: { currentPage: newPage, currentSentence: newSentence } })
    .then((data) => {
      if (!data)
        res.status(404).send({ message: "UserBooks Not found" })
      else res.send(data);
    })
    .catch((err) => {
      res.status(500).send({ message: "Error updating Progress" });
    });
};


// Delete a Book with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;
  var condition = { _id: id };
  var ownerUserData;
  // Check if the user is the owner of the book
  Book.findOne(condition).then(bookData => {
    if (bookData) {
      // If owner requests delete
      if (bookData.ownerUserID == req.query.user_id) {
        User.findOne({ _id: req.query.user_id }).then((data) => ownerUserData = data);

        condition = { bookID: id };

        // Delete from BookContent Entity
        BookContent.deleteOne(condition).then((data) => {
          if (data.n != 1) {
            res.status(404).send({ message: `Cannot delete BookContent with id=${id}. Book was not found!` });
          }
        }).catch((err) => {
          res.status(500).send({ message: `DB server internal error` });
        });

        // Delete from BookInfo Entity
        condition = { _id: id };
        BookInfo.deleteOne(condition).then((data) => {
          if (data.n != 1) {
            res.status(404).send({ message: `Cannot delete BookInfo with id=${id}. Book was not found!` });
          }
        }).catch((err) => {
          res.status(500).send({ message: `DB server internal error` });
        });

        // Add notifications to those recipients who were shared by the owner that the book has been deleted
        condition = { book_id: id };
        UserBooks.find(condition)
          .then((userbooks) => {
            for (const userbook of userbooks) {
              if (userbook.user_id != req.query.user_id) {
                condition = { _id: userbook.user_id }
                User.findOne(condition).then((sharedUserData) => {
                  // update recipient user notifications
                  var notificationStr = ownerUserData.name + " has deleted the shared book \"" + bookData.pdfName + "\".";
                  sharedUserData.notifications.push(notificationStr);

                  User.findByIdAndUpdate(sharedUserData._id, { $set: { notifications: sharedUserData.notifications } }).catch((err) => {
                    console.log(err.message);
                  });
                });
              }
            }
          });
        // Delete from UserBooks (Recipients can no longer access the book)
        condition = { book_id: id };
        UserBooks.deleteMany(condition).then((data) => {
          if (data.n != 0) {
            res.status(204).send();
          } else {
            res.status(404).send({ message: `Cannot delete UserBooks with id=${id}. Book was not found!` });
          }
        }).catch((err) => {
          res.status(500).send({ message: `DB server internal error` });
        });
      } else {
        // If the recipient of the book requests delete
        condition = { book_id: id, user_id: req.query.user_id };
        UserBooks.deleteOne(condition).then((data) => {
          if (data.n == 1) {
            res.status(204).send();
          } else {
            res.status(404).send({ message: `Cannot delete UserBooks with id=${id}. Book was not found!` });
          }
        }).catch((err) => {
          res.status(500).send({ message: `DB server internal error` });
        });
      }
    }
  }).catch((err) => {
    res.status(404).send({ message: `Book with id=${id}. not found` });
  });

};