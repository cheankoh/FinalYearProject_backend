const fs = require("fs");
const PDFParser = require("pdf2json");

const path = require("path");

const mongoose = require("mongoose");
const db = require("../models");
const Page = db.pages;
const BookInfo = db.books_info;
const BookContent = db.books_content;
const UserBooks = db.user_books;

//Convert Uploaded PDF file to text and save into database.
exports.upload = async (req, res) => {
  const userID = req.body.id;
  var fileName = "";
  var bookTitle = "";

  try {
    if (req.file) {
      fileName = req.file.originalname ?? "test";
      bookTitle = req.body.bookTitle ?? fileName;
      var filepath = path.join(path.join(__dirname, "../../"), req.file.path);
      var stream = fs.readFileSync(filepath);
      var extracted_text = await getPDFText(stream);
      let re = /\r\n----------------Page.*Break----------------\r\n/g;
      var textArr = extracted_text.split(re);
      fs.unlink(filepath, () => { });
    } else {
      console.log("req.file == null");
      res.status(404).json({ errors });
      // stop further execution in this callback
    }
  } catch (err) {
    res.status(503).send({
      message: err.message || "Some error occurred while creating the Note.",
    });
  }

  var pageArr = [];
  var page_number = 1;

  textArr.forEach(function (entry) {
    entry = entry.replace(/\r\n/g, " ");
    const page = new Page({
      page_number: page_number,
      chapterNumber: 1,
      body: entry,
    });
    page_number++;
    pageArr.push(page);
  });

  const bookID = new mongoose.Types.ObjectId();

  var bookInfo = new BookInfo({
    _id: bookID,
    // bookID: bookID,
    ownerUserID: userID,
    pdfName: fileName,
    author: "Test",
  });

  var bookContent = new BookContent({
    bookID: bookID,
    page: pageArr,
  });

  var userBooks = new UserBooks({
    user_id: userID,
    book_id: bookID,
    book_title: bookTitle,
    currentPage: 1,
    currentSentence: 1,
  });

  userBooks.save(userBooks).catch((err) => {
    res.status(500).send({
      message: err.message || "Some error occurred while creating userBooks.",
    });
  });

  bookContent.save(bookContent).catch((err) => {
    res.status(500).send({
      message: err.message || "Some error occurred while creating bookContent.",
    });
  });

  bookInfo
    .save(bookInfo)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while creating bookInfo.",
      });
    });
};

//Function to retrieve PDf file from API call.
function getPDFText(data) {
  try {
    return new Promise((resolve, reject) => {
      const pdfParser = new PDFParser(null, 1);
      pdfParser.on("pdfParser_dataError", reject);
      pdfParser.on("pdfParser_dataReady", (pdfData) => {
        resolve(pdfParser.getRawTextContent());
      });
      pdfParser.parseBuffer(data);
    });
  } catch (e) {
    console.log(e);
  }
}
