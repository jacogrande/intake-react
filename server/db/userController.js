const User = require("../schemas/user.js");
const Verification = require("../schemas/verification.js");
const identicon = require("./identicon.js");
const mongoose = require("mongoose");
const crypto = require("crypto");

const movieController = require("./movieController");

/**
 * Function that adds a movie to the specified user doc
 * @param {string} userId Current user's ObjectId
 * @param {*} movieId Id of the movie document to be added to the user's account
 * @param {*} date The date the movie was seen
 */
const addMovie = (userId, movieId, date) => {
  User.findOne({ _id: userId }, (err, user) => {
    if (err) return error;
    if (user.movies.indexOf(movieId) === -1) {
      user.movies.push(movieId);
      user.feed.push({ movie: movieId, date });
      user.save((err) => {
        if (err) console.error(err);
      });
    }
  });
};

/**
 * Function that removes a movie from the specified user doc
 * @param {string} userId Current user's ObjectId
 * @param {string} movieId objectid of the movie to be removed
 */
const removeMovie = (userId, movieId) => {
  User.findOne({ _id: userId }, (err, user) => {
    if (err) return error;
    user.movies.splice(user.movies.indexOf(movieId), 1);
    user.save((err) => {
      if (err) return console.error(err);
    });
  });
};

/**
 * Function that finds a user using a provided email
 * @param {string} email email query
 * @returns {User} The user with the corresponding email
 */
const findByEmail = (email) =>
  User.findOne({ email }, (err, user) => {
    if (err) return { err };
    if (user) {
      return { _id: user._id };
    }
    return null;
  }).lean();

/**
 * Function that resets the specified user's password
 * @param {string} _id Current user's ObjectId
 * @param {string} password new password
 */
const resetPassword = (_id, password) =>
  User.findOne({ _id }, (err, user) => {
    if (err) throw err;
    user.password = password;
    user.save();
  });

/**
 * Function that upvotes a review and adds it to the specified user doc
 * @param {string} _id Current user's ObjectId
 * @param {string} movieId id of the reviewed movie
 * @param {string} reviewId id of the review
 */
const addReview = async (_id, movieId, reviewId) => {
  const data = await User.findOne({ _id }).select("upvoted_reviews");
  if (data.upvoted_reviews.length === 0) {
    // no upvoted reviews
    data.upvoted_reviews.push({
      movie_id: movieId,
      reviews: [reviewId],
    });
  } else {
    // history found
    const movie = data.upvoted_reviews.findIndex(
      (e) => e.movie_id.toString() === movieId.toString()
    );
    if (movie > -1) {
      // movie found
      data.upvoted_reviews[movie].reviews.push(reviewId);
    } else {
      // new movie made
      data.upvoted_reviews.push({
        movie_id: movieId,
        reviews: [reviewId],
      });
    }
  }
  data.save((err) => {
    if (err) console.error(err);
  });
};

/**
 * Function that removes a review from the specified user's upvoted reviews
 * @param {string} _id Current user's ObjectId
 * @param {string} movieId id of the reviewed movie
 * @param {string} reviewId id of the review
 */
const removeReview = async (_id, movieId, reviewId) => {
  const data = await User.findOne({ _id }).select("upvoted_reviews"); // find reviews
  if (data.upvoted_reviews.length === 0) {
    // no upvoted reviews
    return false;
  }
  // history found
  const movie = data.upvoted_reviews.findIndex(
    (e) => e.movie_id.toString() === movieId.toString()
  ); // find the target movie data
  if (movie > -1) {
    // movie found
    data.upvoted_reviews[movie].reviews.splice(
      data.upvoted_reviews[movie].reviews.indexOf(reviewId),
      1
    ); // remove the review
    return await data.save((err) => {
      // save the user's review data
      if (err) console.error(err);
    });
  }
  return false;
};

/**
 * Function that adds a review to the user doc
 * @param {string} reviewId id of the review to be created
 * @param {string} _id user id
 */
const createReview = async (reviewId, _id) => {
  console.log(`review created by user with id: ${_id}`);
  const user = await User.findOne({ _id }).select("reviews");
  if (user.reviews.indexOf(reviewId) === -1) {
    user.reviews.push(reviewId);
    await user.save((err) => {
      if (err) {
        console.error(err);
        throw err;
      }
    });
  }
};

/**
 * Function that removes a review from the user doc
 * @param {string} reviewId id of the review to be created
 * @param {string} _id user id
 */
const deleteReview = async (reviewId, _id) => {
  const user = await User.findOne({ _id }).select("reviews");
  if (user.reviews.indexOf(reviewId) != -1) {
    console.log(`deleting review by user with id: ${_id}`);
    user.reviews.splice(user.reviews.indexOf(reviewId), 1);
    user.save();
  }
};

/**
 * Function that removes all reviews from the given user doc
 * @param {string} _id the current user's objectId
 */
const flushReviews = (_id) =>
  User.findOne({ _id }, (err, user) => {
    console.log(user.upvoted_reviews);
    user.upvoted_reviews = [];
    user.save();
  });

/**
 * Function that genereates a unique identicon based on the given user's username
 * @param {string} _id ObjectId of the user whose avatar will be generated
 * @param {string} username user's username that will be used to generate identicon
 */
const createAvatar = async (_id, username) => {
  const user = await User.findOne({ _id }).select("avatar");
  const avatar = identicon(username);
  if (avatar.color && avatar.tilemap) {
    user.avatar = avatar;
    await user.save((err) => {
      if (err) {
        console.error(err);
        throw err;
      }
    });
    console.log(avatar);
    return avatar;
  }
};

/**
 * Function that finds users with names similar to the inputted username
 * @param {string} username query string to compare other user's name to
 * @returns {User[]} A list of users with similar names
 */
const findLikeNames = async (username) => {
  const users = await User.find({
    username: new RegExp(username, "i"),
  })
    .select(
      "username avatar movies reviews friends favorite_movie date_registered"
    )
    .lean();
  return users;
};

/**
 * Function that returns all of the target user's public information
 * @param {string} username the username of the target user
 */
const getPublicInfo = async (username) => {
  const user = await User.findOne({ username })
    .select("avatar movies friends reviews date_registered favorite_movie")
    .lean();
  if (!user.reviews) user.reviews = [];
  return user;
};

/**
 * Function that returns all of the target user's public information
 * @param {string} _id ObjectIddof the target user
 */
const getPublicInfoById = async (_id) => {
  const user = await User.findOne({ _id })
    .select(
      "avatar movies username friends reviews date_registered favorite_movie feed"
    )
    .lean();
  if (!user.reviews) user.reviews = [];
  return user;
};

/**
 * Function that adds a friend request to the target user's doc
 * @param {string} _id ObjectId of the target user
 * @param {string} userId ObjectId of the current user
 */
const makeFriendRequest = async (_id, userId) => {
  const target = await User.findOne({ _id }).select("friend_requests");
  if (target.friend_requests.indexOf(userId) === -1) {
    target.friend_requests.push(userId);
    await target.save();
    console.log("friend request made");
    return true;
  }
  throw new Error("Friend request already sent.");
};

/**
 * Function that populates the friendRequests string array with real user data
 * @param {string[]} friendRequests List of objectIds of users who have sent friend requests
 */
const populateFriendRequests = async (friendRequests) =>
  await User.find({
    _id: {
      $in: friendRequests.map((request) => mongoose.Types.ObjectId(request)),
    },
  })
    .select("avatar movies username friends favorite_movie")
    .lean();

/**
 * Function that populates the current user's friend data with real user data
 * @param {string[]} friends List of ObjectIds belonging to the current user's friends
 */
const populateFriends = async (friends) =>
  await User.find({
    _id: { $in: friends.map((request) => mongoose.Types.ObjectId(request)) },
  })
    .select("avatar username friends movies favorite_movie")
    .lean();

/**
 * Function that accepts a friend request, adding both users to each others' friend array
 * @param {string} _id ObjectId of friend who sent the request
 * @param {string} userId Current user's ObjectId
 */
const acceptFriendRequest = async (_id, userId) => {
  const user = await User.findOne({ _id }).select("friends");
  if (!user.friends) {
    user.friends = [];
    console.log(user);
  }
  if (user.friends.indexOf(userId) === -1) {
    user.friends.push(userId);
    await user.save();
  } else {
    throw new Error("Friend already added.");
  }
};

/**
 * Function that gets the top 10 users based on the provided criteria
 * @param {any} filter Criteria by which users will be sorted
 */
const getTopByFilter = async (filter) =>
  await User.find()
    .sort(filter)
    .limit(10)
    .select(
      "avatar movies username friends reviews date_registered favorite_movie"
    )
    .lean();

/**
 * Function that verifies all users data integrity (for schema updates)
 */
const cleanupUsers = async () =>
  await User.updateMany(
    {},
    [
      { $set: { movies: { $setUnion: [{ $ifNull: ["$movies", []] }] } } },
      { $set: { movies_length: { $size: "$movies" } } },
      { $set: { friends: { $setUnion: [{ $ifNull: ["$friends", []] }] } } },
      { $set: { friends_length: { $size: "$friends" } } },
      { $set: { reviews: { $setUnion: [{ $ifNull: ["$reviews", []] }] } } },
      { $set: { reviews_length: { $size: "$reviews" } } },
      { $set: { verified: false } },
    ],
    { multi: true, upsert: true }
  );

/**
 * Function that generates a feed for users who don't have any (schema update)
 */
const createFeeds = async () => {
  const users = await User.find();
  users.forEach(async (user) => {
    const movies = await movieController.findMoviesByUser(
      user.movies,
      user._id
    );
    const feed = movies.map((movie) => ({
      movie: movie._id,
      date: movie.date_added.date,
    }));
    user.feed = feed;
    user.save((err) => err & console.error(err));
    console.log(user);
  });
};

/**
 * Function that checks to see if a verification token for the target user exists
 * @param {string} user_id ObjectId of the user whose verification will be checked
 */
const checkForVerification = (user_id) =>
  Verification.findOne({ user_id: user_id }).lean();

/**
 * Function that creates a new verification token for a target user
 * @param {string} user_id ObjectId of the user whose verification token will be created
 */
const createVerification = async (user_id) => {
  const link = crypto.randomBytes(128).toString("hex");
  const newToken = new Verification({
    link,
    user_id: user_id,
  });
  await newToken.save();
  return link;
};

/**
 * Function that checks if the provided token is valid and verify the user attached to that token if so.
 * @param {string} token 128 random char string that will be verified
 */
const verifyToken = async (token) => {
  let userId = await Verification.findOne({ link: token }).lean();
  if (userId) {
    userId = userId.user_id;
    const user = await User.findOne({
      _id: new mongoose.Types.ObjectId(userId),
    });
    if (user) {
      user.verified = true;
      await user.save();
    } else {
      throw new Error("invalid token");
    }
  } else {
    throw new Error("invalid token");
  }
};

const dropVerification = async () => Verification.collection.drop();

/**
 * Function that updates a user's feed with new movie data
 * @param {string} id id of the user whose feed will be updated
 * @param {Feed} monthlyFeed the target user's new monthly feed
 */
const updateFeed = async (id, monthlyFeed) =>
  await User.updateOne({ _id: id }, { feed: monthlyFeed }, { upsert: true });

/**
 * Function that returns all user docs
 */
const getAllUsers = async () => await User.find({});

module.exports = {
  addMovie,
  removeMovie,
  findByEmail,
  resetPassword,
  addReview,
  removeReview,
  flushReviews,
  createAvatar,
  findLikeNames,
  getPublicInfo,
  createReview,
  deleteReview,
  makeFriendRequest,
  populateFriendRequests,
  populateFriends,
  acceptFriendRequest,
  getPublicInfoById,
  getTopByFilter,
  cleanupUsers,
  getAllUsers,
  createFeeds,
  updateFeed,
  checkForVerification,
  createVerification,
  verifyToken,
};
