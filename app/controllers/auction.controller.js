const db = require("../models");
const User = db.users;
const Nft = db.nonFungibleTokens;
const Claim = db.claims;
const Auction = db.auctions;
const Bid = db.bids;

// Link metamask wallet
exports.getAllAuctions = (req, res) => {
    let now = Date.now();
    var condition = { bid_end_time: { $gt: now }, bid_start_time: { $lte: now } }
    Auction.find(condition).then(data => {
        // Check if NFT exists
        if (!data)
            res.status(500).send({ message: "No ongoing auction." }).end();

        // Update the name of NFT
        res.status(200).send({ auctions: data });
    })
}

exports.getAllAuctionsNft = (req, res) => {
    var condition = {}
    var nftList = []
    req.body.nftIds.forEach((id) => {
        condition = { _id: id }
        Nft.findOne(condition).then(nft => {
            if (!nft)
                res.status(500).send({ message: "Retrieving nft failed." }).end();

            nftList.push(nft)
        })
    });
    res.status(200).send({ nftList: nftList });
}