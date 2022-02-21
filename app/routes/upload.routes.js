const multer = require("multer");
const upload = multer({ dest: "uploads/" });

//Routes for upload
module.exports = app => {
    const uploader = require("../controllers/upload.controller.js");
    var router = require("express").Router();
  
    //Upload PDF and save to database
    router.post("/", upload.single("pdf"), uploader.upload);
  
    app.use('/api/upload', router);
  };