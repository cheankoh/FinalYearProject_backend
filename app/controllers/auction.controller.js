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
            res.status(500).send({ message: "User not found" }).end();

        // Update the name of NFT
        res.status(200).send({ auctions: data });
    })
}

// Bid for NFT that is being auctioned
exports.bid = (req, res) => {
    var condition = { _id: req.body.id }
    User.findOne(condition).then(user => {
        // Check if user is found
        if (!user) res.status(500).send({ message: "User not found." }).end();
        // Check if user has enough to bid
        if (user.token_amount < req.body.amount)
            res.status(500).send({ message: "Insufficient amount of token." }).end();

        condition = { _id: req.body.auction_id };

        Auction.findOne(condition).then(data => {
            // Check if the auction is expired
            if (data && data.bid_end_time < req.body.bid_time)
                res.status(500).send({ message: "The auction has ended." }).end();

            // Otherwise, deduct from the user tokenAmount and create bid model
            // Deduct amount from user
            let balance = parseInt(user.token_amount) - parseInt(req.body.amount);
            User.findByIdAndUpdate(req.body.id, { $set: { token_amount: balance } })
                .catch((err) => console.log(err.message));

            // Create Bid model
            const newBid = new Bid({
                user_id: req.body.id,
                auction_id: req.body.auction_id,
                amount: req.body.amount,
                blockchain_status: false
            })
            // Save bid in the database 
            newBid.save(newBid)
                .then(() => { res.status(201).send({ message: "You've succesfully bid for the NFT" }) })
                .catch(err => {
                    console.log(err.message);
                    res.status(500).send({ message: "You've failed to bid the NFT" });
                })
        });
    });
}

// Level up his/her NFT
exports.levelUp = (req, res) => {
    var condition = { _id: req.body.nft_id }
    Nft.findOne(condition).then(data => {
        // Check if NFT exists
        if (!data) res.status(500).send({ message: "NFT not found" }).end();

        // Deduct amount from user to levelUp
        User.findById(req.body.id, (err, user) => {
            if (err) res.status(500).send({ message: "User not found" }).end();
            user.token_amount = parseInt(user.token_amount);
            req.body.amount = parseInt(req.body.amount);
            // Check if user has enough to level up
            if (user.token_amount < req.body.amount)
                res.status(500).send({ message: "Insufficient amount of token." }).end();
            user.token_amount -= req.body.amount;
            user.save((err) => {
                if (err) res.status(500).send({ message: "Deduction of amount on user failed" }).end();
            })

            // Update the level of NFT
            Nft.findByIdAndUpdate(data.id, { $set: { level: data.level + 1, blockchain_status: false } })
                .then(() => { res.status(204).send({ message: "You've succesfully leveled up the NFT to " + (data.level + 1) }) })
                .catch((err) => console.log(err.message));
        })
    }).catch((err) => console.log(err.message));
}

// Change the name of NFT
exports.changeName = (req, res) => {
    var condition = { _id: req.body.nft_id }

    Nft.findOne(condition).then(data => {
        // Check if NFT exists
        if (!data)
            res.status(500).send({ message: "NFT not found" }).end();

        // Update the name of NFT
        Nft.findByIdAndUpdate(data.id, { $set: { name: req.body.name, blockchain_status: false } })
            .then(() => res.status(204).send({ message: "You've succesfully the name of your NFT to " + req.body.name }))
            .catch((err) => console.log(err.message));
    })
}