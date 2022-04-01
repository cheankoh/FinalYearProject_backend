const dbConfig = require("../config/db.config.js");

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const db = {};
db.mongoose = mongoose;
db.url = dbConfig.url;
db.auctions = require("./auctions.model.js")(mongoose);
db.bids = require("./bids.model.js")(mongoose);
db.claims = require("./claims.model.js")(mongoose);
db.users = require("./users.model.js")(mongoose);
db.nonFungibleTokens = require("./nonFungibleTokens.model.js")(mongoose);
module.exports = db;
