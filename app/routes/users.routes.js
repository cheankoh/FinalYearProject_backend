//Routes for users
module.exports = app => {
    const users = require("../controllers/users.controller.js");
  
    var router = require("express").Router();

    //Login to the application
    router.post("/login", users.login);

    //Share a Audiobook with a peer.
    router.post("/share", users.share);

    //Add Bookmark to the progress of a specific book.
    router.put('/bookmark', users.addBookmark);

    //Delete Bookmark to the progress of a specific book.

    router.delete('/bookmark', users.removeBookmark);

    app.use('/api/users', router);
  };