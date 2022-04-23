// Routes for users
module.exports = app => {
  const users = require("../controllers/user.controller.js");

  var router = require("express").Router();

  // Login to the application
  router.post("/login", users.login);

  // Link Metamask wallet to the account
  router.post("/login", users.linkWallet);

  // Claim its steps for steptokens.
  router.post("/claim", users.claim);

  // Auction NFT onto the auction page
  router.post('/auction', users.auction);

  // Bid for other's NFT
  router.post('/bid', users.bid);

  // Level Up NFT
  router.put('/nft/levelUp', users.levelUp);

  // Change the name of NFT
  router.put('/nft/changeName', users.changeName)

  app.use('/api/users', router);
};