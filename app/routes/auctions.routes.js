// Routes for users
module.exports = app => {
    const auctions = require("../controllers/auction.controller.js");

    var router = require("express").Router();

    // Get ongoing auctions
    router.get("/getAllAuctions", auctions.getAllAuctions);

    router.get("/getAllAuctionsNft", auctions.getAllAuctionsNft);

    app.use('/api/auction', router);
};