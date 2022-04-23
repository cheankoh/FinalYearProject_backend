// Routes for users
module.exports = app => {
    const auctions = require("../controllers/auction.controller.js");

    var router = require("express").Router();

    // Get ongoing auctions
    router.post("/getAllAuctions", auctions.getAllAuctions);


    app.use('/api/', router);
};