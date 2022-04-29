const { count } = require("console");
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

async function* retrieveNfts(nftIds) {
    var nftList = []
    try {
        await nftIds.map(async (id) => {
            let condition = { _id: id }
            Nft.findOne(condition).then(nft => {
                if (!nft)
                    res.status(500).send({ message: "Retrieving nft failed." }).end();
                nftList.push(nft)
            })
        })
    } finally {
        return nftList
    }
}

exports.getAllAuctionsNft = async (req, res) => {
    // retrieveNfts(req.body.nftIds).then(nftList => res.status(200).send({ nftList: nftList }));
    var nftList = []
    var condition = {}
    for (const nftId of req.body.nftIds) {
        try {
            condition = { _id: nftId }
            const nft = await Nft.findOne(condition);
            nftList.push(nft);
        } catch (error) {
            console.log(error);
        }
    }
    res.status(200).send({ nftList: nftList })
}