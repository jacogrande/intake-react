const express = require("express");
const debug = require("debug")("index");
const morgan = require("morgan");
const path = require("path");
const mongoose = require("mongoose");
const helmet = require("helmet");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const compression = require("compression");
const passport = require("./auth.js");
const flash = require("connect-flash");

const User = require("./schemas/user.js");

let mongoUri = "";
if (process.env.NODE_ENV === "production") {
  mongoUri = process.env.MONGO_URI;
} else if (process.env.NODE_ENV === "dev") {
  mongoUri = "mongodb://localhost:27017/intake";
}

// mongoose implementation
mongoose.connect(mongoUri, { useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", () => debug("Connection error"));
db.once("open", () => {
  debug("mongodb online");
});

const app = express();
const PORT = process.env.PORT || 8080;
// const statisticRouter = require('./routers/statisticRouter.js');

app.use(
  session({
    secret:
      process.env.NODE_ENV === "production"
        ? process.env.SESSION_SECRET
        : "beese churger",
    resave: false,
    saveUninitialized: false,
    ttl: 30 * 24 * 60 * 6,
    store: new MongoStore({
      mongooseConnection: db,
    }),
  })
);

app.use(helmet());
app.disable("x-powered-by");

app.use(morgan("tiny"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(flash());

// passport middleware
app.use(passport.initialize());
app.use(passport.session());

const userRouter = require("./routers/userRouter.js");
app.use("/api/user/", userRouter);

const movieRouter = require("./routers/movieRouter.js");
app.use("/api/movies/", movieRouter);

const friendRouter = require("./routers/friendRouter.js");
app.use("/api/friends/", friendRouter);

// Serve static files from the React frontend app
app.use(express.static(path.join(__dirname, "/build")));

// Anything that doesn't match the above, send back index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname + "/build/index.html"));
});

app.listen(PORT, () => debug(`Socket to me on port ${PORT}...`));
