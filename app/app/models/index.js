const dbConfig = require("../config/db.config.js");

const mongoose = require("mongoose");
const { CLIENT_NO_SCHEMA } = require("mysql/lib/protocol/constants/client");
mongoose.Promise = global.Promise;
// async function main() {
//     await mongoose.connect(dbConfig.url);
// }
// main().catch(err => console.error(err));
/// TODO:
const db = {};
db.mongoose = mongoose;
db.url = dbConfig.url;
db.auctions = require("./auction.model.js")(mongoose);
db.bids = require("./bid.model.js")(mongoose);
db.claims = require("./claim.model.js")(mongoose);
db.users = require("./user.model.js")(mongoose);
db.nonFungibleTokens = require("./nonFungibleToken.model.js")(mongoose);
module.exports = db;
