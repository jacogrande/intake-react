const express = require("express");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../schemas/user.js");
const passport = require("../auth.js");
const identicon = require("../db/identicon.js");
const validator = require("email-validator");
const db = require("../db/db.js");

const movieController = require("../db/movieController");
const userController = require("../db/userController");
const cache = require("../db/cache.js");

const userRouter = express.Router();

userRouter
  .route("/register") // registration route
  .get((req, res) => {
    // if the user is registered, send them to the profile page, otherwise, set them up with a registration page
    if (req.user != null) {
      res.redirect("/movies");
    } else {
      res.render("login");
    }
  })
  .post(async (req, res) => {
    // post request to add a new user
    const { username, password, email } = req.body;
    if (!validator.validate(email)) {
      return res.status(500).json({ error: "Invalid email address." });
    }
    const newUser = new User({
      // create a new user with the sent data
      username,
      password,
      email,
    });
    try {
      const emailInUse = await User.findOne({ email: newUser.email })
        .select("")
        .lean();
      if (emailInUse) {
        console.log("email already in use");
        return res.status(500).json({ error: "Email already in use." });
      }
      const usernameInUse = await User.findOne({ username: newUser.username })
        .select("")
        .lean();
      if (usernameInUse) {
        console.log("username already in use");
        return res.status(500).json({ error: "Username already in use." });
      }
      const avatar = identicon(username);
      if (avatar.color && avatar.tilemap) {
        newUser.avatar = avatar;
      } else {
        throw new Error("failure generating identicon");
      }
      newUser.save((err) => {
        if (err) {
          console.error(err);
          return res.status(500).json(err);
        }
        console.log(`new user created with username: ${newUser.username}`);
        return res.sendStatus(200);
      });
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ error: "An unexpected error occured. Try again later." });
    }
  });

userRouter
  .route("/login")
  .get((req, res) => {
    if (req.flash().error.includes("account not verified")) {
      return res.status(401).json({ error: "account not verified" });
    }
    if (req.user != null) {
      res.sendStatus(200);
    } else {
      res.status(401).json({ error: null });
    }
  })
  .post(
    passport.authenticate("local", {
      failureRedirect: "/api/user/login",
      failureFlash: true,
    }),
    async (req, res) => {
      console.log(`${req.user.username} logged in`);
      cache.clearCache(req.user._id);
      const [friends, friend_requests] = [
        await userController.populateFriends(req.user.friends),
        await userController.populateFriendRequests(req.user.friend_requests),
      ];
      res.json({
        username: req.user.username,
        avatar: req.user.avatar,
        reviews: req.user.reviews,
        upvoted_reviews: req.user.upvoted_reviews,
        friends,
        friend_requests,
        favorite_movie: req.user.favorite_movie,
        _id: req.user._id,
      });
    }
  );

userRouter.route("/checkSession").get(async (req, res) => {
  if (req.user) {
    if(req.user.verified != true) {
      return res.json({username: null});
    }
    const [friends, friend_requests] = [
      await userController.populateFriends(req.user.friends),
      await userController.populateFriendRequests(req.user.friend_requests),
    ];
    res.json({
      username: req.user.username,
      avatar: req.user.avatar,
      reviews: req.user.reviews,
      upvoted_reviews: req.user.upvoted_reviews,
      friends,
      friend_requests,
      favorite_movie: req.user.favorite_movie,
      _id: req.user._id,
    });
  } else {
    res.json({ username: null });
  }
});

const getMailAuth = () => {
  if (process.env.NODE_ENV === "dev") {
    const config = require("../config.js");
    return {
      user: config.SENDGRID_USERNAME,
      pass: config.SENDGRID_PASSWORD,
    };
  }
  if (process.env.NODE_ENV === "production") {
    return {
      user: process.env.SENDGRID_USERNAME,
      pass: process.env.SENDGRID_PASSWORD,
    };
  }
};

const getMailAddress = () => {
  if (process.env.NODE_ENV === "dev") {
    const config = require("../config.js");
    return config.EMAIL_ADDRESS;
  }
  if (process.env.NODE_ENV === "production") {
    return process.env.EMAIL_ADDRESS;
  }
};

const getSecretKey = () => {
  if (process.env.NODE_ENV === "dev") {
    return "beese churger";
  }
  if (process.env.NODE_ENV === "production") {
    return process.env.JWT_SECRET;
  }
};

userRouter.route("/passwordReset").post(async (req, res) => {
  const { email } = req.body;
  if (email) {
    let userId = null;
    try {
      userId = await userController.findByEmail(email);
    } catch (err) {
      return res.status(500).json(err);
    }
    if (!userId) {
      return res.sendStatus(200);
    }
    if (userId.err) return res.sendStatus(500);

    const payload = {
      id: userId._id,
      email,
      exp: Math.floor(Date.now() / 1000) + 60 * 60,
    };

    const secret = getSecretKey();
    const token = jwt.sign(payload, secret);

    const transporter = nodemailer.createTransport({
      service: "SendGrid",
      auth: getMailAuth(),
    });

    let emailLink = "";
    if (process.env.NODE_ENV === "dev") {
      emailLink = `http://127.0.0.1:3000/resetPassword/${payload.id}/${token}`;
    }
    if (process.env.NODE_ENV === "production") {
      emailLink = `https://www.intake.space/passwordReset/${payload.id}/${token}`;
    }

    const sender = getMailAddress();
    const mailOptions = {
      from: sender,
      to: email,
      subject: "Intake Password Reset",
      text: `There has been a request to reset the password for your account on intake.space.\n\nPlease copy and paste or click the following link to reset your password.\n\n${emailLink}\n\nIf you did not request this change, please ignore this email and your password will remain unchanged.\n`,
      html: `
          <head>
            <style>
              .body{
                width:100%; font-family: Arial; font-weight: 150; background: #1E262A; color: #D5D5D5; text-align:center;
              }

              p {
                color:#d5d5d5
              }
              .nav{
                width:100%; height:50px; background: #181F24; text-align:center; font-family: Arial; font-size:25px; letter-spacing: 10px; padding-top:5px; padding-bottom:25px; border-bottom:1px solid black;
              }
              .nav p {
                color: #EF49B5;
              }
              a {
                color:#8EC3AF !important; text-decoration: none; cursor: pointer;
              }
              a:hover{
                opacity:0.85;
              }
            </style>
          </head>
          <body>
            <div class = 'body'>
              <div class = 'nav'><p>INTAKE</p></div>
              <p>There has been a request to reset the password for your account on <a href = 'https://www.intake.space'>intake.space</a>. Please copy and paste or click the following link to reset your password.</p>
              <br><br>
              <p><a href="${emailLink}">${emailLink}</a></p>
              <br><br><br>
              <p style = 'color:#aaa; padding-bottom:80px'><em>If you did not request this reset, please ignore this email and your password will remain unchanged.</em></p>
            </div>
          </body>
        `,
    };

    try {
      transporter.sendMail(mailOptions, (err, response) => {
        if (err) {
          console.log(err);
        } else {
          console.log(response);
          console.log("success");
          return res.sendStatus(200);
        }
      });
    } catch (err) {
      return res.sendStatus(500);
    }
  }
});

userRouter
  .route("/passwordReset/:id/:token")
  .get((req, res) => {
    try {
      const secret = getSecretKey();
      const payload = jwt.verify(req.params.token, secret);
      res.sendStatus(200);
    } catch (err) {
      res.sendStatus(403);
    }
  })
  .post(async (req, res) => {
    const secret = getSecretKey();
    const payload = jwt.verify(req.params.token, secret);
    try {
      await userController.resetPassword(payload.id, req.body.password);
      res.sendStatus(200);
    } catch (err) {
      console.error(err);
      res.sendStatus(500);
    }
  });

userRouter.route("/sendVerificationToken").post(async (req, res) => {
  const { email } = req.body;
  if (!validator.validate(email)) {
    return res.sendStatus(500);
  }
  try {
    const userId = await userController.findByEmail(email);
    if (await userController.checkForVerification(userId)) {
      console.log('verification token exists');
      return res.sendStatus(401);

    }
    const token = await userController.createVerification(userId._id);

    // send verification code in email
    const transporter = nodemailer.createTransport({
      service: "SendGrid",
      auth: getMailAuth(),
    });

    let emailLink = "";
    if (process.env.NODE_ENV === "dev") {
      emailLink = `http://127.0.0.1:3000/verify/${token}`;
    }
    if (process.env.NODE_ENV === "production") {
      emailLink = `https://www.intake.space/passwordReset/${token}`;
    }

    const sender = getMailAddress();
    const mailOptions = {
      from: sender,
      to: email,
      subject: "Verify your Intake account",
      text: `Please verify your email address to finish registering for an Intake account.\n\nClick or copy and paste the following link to verify your account:\n\n${emailLink}\n\n  This link expires in 1 hour.`,
      html: `
          <head>
            <style>
              .body{
                width:100%; font-family: Arial; font-weight: 150; background: #1E262A; color: #D5D5D5; text-align:center;
              }

              p {
                color:#d5d5d5
              }
              .nav{
                width:100%; height:50px; background: #181F24; text-align:center; font-family: Arial; font-size:25px; letter-spacing: 10px; padding-top:5px; padding-bottom:25px; border-bottom:1px solid black;
              }
              .nav p {
                color: #EF49B5;
              }
              a {
                color:#8EC3AF !important; text-decoration: none; cursor: pointer;
              }
              a:hover{
                opacity:0.85;
              }
            </style>
          </head>
          <body>
            <div class = 'body'>
              <div class = 'nav'><p>INTAKE</p></div>
              <p>Please verify your email address to finish registering for an <a href = 'https://www.intake.space'>Intake</a> account. Copy and paste or click the following link to verify your account:</p>
              <br><br>
              <p><a href="${emailLink}">${emailLink}</a></p>
              <br><br><br>
              <p style = 'color:#aaa; padding-bottom:80px'><em>This link expires in 1 hour.</em></p>
            </div>
          </body>
        `,
    };

    try {
      transporter.sendMail(mailOptions, (err, response) => {
        if (err) {
          throw err;
        } else {
          console.log("email verification successfully sent");
          return res.sendStatus(200);
        }
      });
    } catch (err) {
      return res.sendStatus(500);
    }
    return res.sendStatus(200);
  } catch (err) {
    return res.sendStatus(500);
  }
});

userRouter.route('/verifyAccount/:token').get(async (req, res) => {
  const {token} = req.params;
  try {
    await userController.verifyToken(token);
    res.sendStatus(200);
  } catch(err) {
    console.error(err);
    res.sendStatus(500);
  }
});

userRouter.route("/delete").delete(passport.isAuthenticated, (req, res) => {
  try {
    req.user.movies.forEach((movie) => {
      movieController.removePresence(req.user._id, movie);
    });
    User.deleteOne({ _id: req.user._id }, (err) => {
      if (err) throw err;
      cache.clearCache(req.user._id);
      res.sendStatus(200);
    });
  } catch(err) {
    console.error(err);
    res.sendStatus(500);
  }
});

userRouter.route("/logout").get((req, res) => {
  req.logout();
  res.sendStatus(200);
});

userRouter.route("/cleanup").get(async (req, res) => {
  const { admin_key } = req.query;
  if (db.checkCredentials(admin_key)) {
    try {
      await userController.cleanupUsers();
      await userController.createFeeds();
      console.log(await userController.getAllUsers());
      return res.sendStatus(200);
    } catch (err) {
      console.error(err);
      return res.sendStatus(500);
    }
  } else {
    return res.sendStatus(403);
  }
});

module.exports = userRouter;
