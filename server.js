const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
require("dotenv").config();

var corsOptions = {
    //   origin: "http://localhost:8081"
    origin: "https://ecstatic-lichterman-fad233.netlify.app",
};

app.use(cors(corsOptions));
// parse requests of content-type - application/json
app.use(bodyParser.json());
// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

require("./app/routes/books.routes")(app);
require("./app/routes/upload.routes")(app);
require("./app/routes/users.routes")(app);

//Database connection
const db = require("./app/models");
db.mongoose
    .connect(process.env.MONGODB_URI || db.url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    })
    .then(() => {
        console.log("Connected to the database!");
    })
    .catch((err) => {
        console.log("Cannot connect to the database!", err);
        process.exit();
    });

if (process.env.NODE_ENV === "production") {
    app.use(express.static("./client/build"));
}

// simple route for testing
app.get("/", (req, res) => {
    res.json({ message: "Welcome to jay's application." });
});

// set port, listen for requests
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
