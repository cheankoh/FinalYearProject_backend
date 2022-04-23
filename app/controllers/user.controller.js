const db = require("../models");
const User = db.users;
const Nft = db.nonFungibleTokens;
const Claim = db.claims;
const Auction = db.auctions;
const Bid = db.bids;
const ethersObj = require('./ethers.controller.js');

// Login and gain access to the application.
exports.login = (req, res) => {
  // Validate request
  if (!req.body.id) res.status(400).send({ message: "Invalid parameter!" }).end();
  var condition = { _id: req.body.id };
  User.findOne(condition).then(data => {
    // user exists, retrieve data and respond
    if (data) {
      condition = { _id: data.nft_id }
      Nft.findOne(condition).then(nft => {
        let dataWithLevel = { ...data._doc, level: nft.level }
        res.status(200).send(dataWithLevel).end();
      }).catch(err => res.status(500).send({ message: "Retrieving level of NFT failed", }).end())
    } else {
      // user does not exist, add the user into the database
      // Creation of NFT model, note that the id here isnt the same as the id on blockchain
      const newNFT = new Nft({
        name: req.body.name,
        level: 1,
        blockchain_status: false // Wait until successful creation of nft from blockchain then change to true
      });
      newNFT.save(newNFT).then(() => {
        // Creation of User model
        let userData = {
          _id: req.body.id,
          nft_id: newNFT.id,
          email: req.body.email,
          wallet: "0x00",
          token_amount: 0
        };
        const newUser = new User(userData);
        userData.level = 1;
        // Save User and NFT in the database
        newUser.save(newUser).then(() => res.status(201).send({ userInfo: userData }).end())
          .catch((err) => {
            console.log(err.message);
            res.status(500).send({ message: "User creation failed: " + req.body.id, }).end();
          });
      })
        .catch((err) => {
          console.error(err.message);
          res.status(500).send({ message: "NFT creation failed: " + req.body.nft_id }).end()
        })
    }
  })
    .catch(err => {
      console.error(err);
      res.status(500).send({ message: err.message || "Some error occurred while retrieving user's credentials." }).end();
    });
};

// Link metamask wallet
exports.linkWallet = (req, res) => {
  var condition = { _id: req.body.id }

  User.findOne(condition).then(data => {
    // Check if NFT exists
    if (!data)
      res.status(500).send({ message: "User not found" }).end();

    // Update the name of NFT
    User.findByIdAndUpdate(data.id, { $set: { wallet: req.body.wallet } })
      .then(() => res.status(204).send({ newWallet: req.body.wallet }))
      .catch((err) => console.log(err.message));
  })
}

// Claim Steps for StepTokens
exports.claim = (req, res) => {
  var condition = { user_id: req.body.id, claim_date: new Date() }
  Claim.findOne(condition).then(data => {
    // Stops when user has already claimed once
    if (data) res.status(500).send({ message: "Each user can only claim once per day!" })
    // Otherwise, proceed to claiming
    // Creation of claim model
    const newClaim = new Claim({
      user_id: req.body.id,
      claim_date: new Date(),
      amount: req.body.amount,
      blockchain_status: false // Wait until successful claim from blockchain then change to true
    });
    var newBalance = 0;
    // Invocation of Smart Contracts
    ethersObj.claim(req.body.wallet, req.body.amount).then(claimStatus => {
      console.log(claimStatus);
      typeof (claimStatus) != undefined ? newClaim.blockchain_status = true : newClaim.blockchain_status = false;
      // Save claim in the database
      if (newClaim.blockchain_status) {
        // If the claim is successful on chain, update the amount of token the user has
        User.findById(req.body.id, (err, user) => {
          if (err) res.status(500).send({ message: "User not found" }).end();
          user.token_amount += parseInt(req.body.amount);
          newBalance = user.token_amount;
          user.save((err) => {
            if (err) res.status(500).send({ message: "Deduction of amount on user failed" }).end();
          })
        });
      }
      newClaim.save(newClaim)
        .then(() => { res.status(201).send({ newBalance: newBalance }) })
        .catch(err => {
          console.log(err.message);
          res.status(500).send({ message: "Claim failed: " + req.body.id + ", Amount: " + req.body.amount });
        })
    });

  })
}

// Auction his/her NFT
exports.auction = (req, res) => {
  var condition = { nft_id: req.body.nft_id };
  Auction.findOne(condition).then(data => {
    // Check if the nft is currently being auctioned
    if (data && data.bid_end_time > req.body.bid_start_time)
      res.status(500).send({ message: "The nft is being auctioned." }).end();

    // Otherwise, create new Auction
    const newAuction = new Auction({
      beneficiary_id: req.body.id,
      nft_id: req.body.nft_id,
      bid_start_time: req.body.bid_start_time,
      bid_end_time: req.body.bid_end_time,
      blckchain_status: false
    })
    // Save auction in the database
    newAuction.save(newAuction)
      .then(() => { res.status(201).send({ message: "You've succesfully auctioned your NFT" }) })
      .catch(err => {
        console.log(err.message);
        res.status(500).send({ message: "You've failed to auction your NFT" });
      })
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
        .then(() => { res.status(204).send({ level: (data.level + 1) }) })
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
      .then(() => res.status(204).send({ name: req.body.name }))
      .catch((err) => console.log(err.message));
  })
}