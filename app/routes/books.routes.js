//Routes for books
module.exports = app => {
    const books = require("../controllers/books.controller.js");
  
    var router = require("express").Router();

    //Get Audiobook of a specific user.
    router.get("/titles", books.getAllTitles);
  
    //Get BookContent for a specific Audiobook.
    router.get("/:id", books.findOne);

    //Update the name of a specific book.
    router.put("/:id", books.updateName);

    //Get the progress of a specific book of a specific user.
    router.get("/:id/progress", books.getProgress);

    //Update the progress of a specific book of a specific user.
    router.put("/:id/progress", books.updateProgress);
  
    // Delete a books with id
    router.delete("/:id", books.delete);
  
    app.use('/api/audiobooks', router);
  };