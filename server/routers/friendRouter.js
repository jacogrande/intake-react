const express = require("express");
const passport = require("../auth.js");
const moment = require("moment");

const movieController = require("../db/movieController");
const userController = require("../db/userController");
const cache = require("../db/cache.js");

const friendRouter = express.Router();

friendRouter
  .route("/search/:username")
  .get(passport.isAuthenticated, async (req, res) => {
    const { username } = req.params;
    try {
      let possibilities = await userController.findLikeNames(username);
      res.status(200).json({ users: possibilities });
    } catch (err) {
      console.error(err);
      res.sendStatus(500);
    }
  });

friendRouter.route("/getTopUsers/:filter").get(async (req, res) => {
  const { filter } = req.params;
  let users;
  switch (filter) {
    case "movies":
      users = await userController.getTopByFilter({ movies_length: -1 });
      break;
    case "friends":
      users = await userController.getTopByFilter({ friends_length: -1 });
      break;
    case "reviews":
      users = await userController.getTopByFilter({ reviews_length: -1 });
      break;
    case "date_added_oldest":
      users = await userController.getTopByFilter({ date_registered: 1 });
      break;
    case "date_added_newest":
      users = await userController.getTopByFilter({ date_registered: -1 });
      break;
    default:
      return res.sendStatus(400);
  }
  return res.json(users);
});

friendRouter
  .route("/addFriend")
  .post(passport.isAuthenticated, async (req, res) => {
    console.log(req.body);
    const { id } = req.body;
    try {
      await userController.makeFriendRequest(id, req.user.id);
      res.sendStatus(200);
    } catch (err) {
      console.log(err);
      if(err.message === "Friend request already sent."){
        console.log('yo');
        return res.status(500).json({error:err.message});
      }
      return res.status(500).json({error:'An unexpected error occured.'});
    }
  });

friendRouter
  .route("/acceptFriendRequest")
  .post(passport.isAuthenticated, async (req, res) => {
    const { id } = req.body;
    if (req.user.friend_requests.indexOf(id) !== -1) {
      try {
        await userController.acceptFriendRequest(id, req.user.id);
        req.user.friend_requests.splice(
          req.user.friend_requests.indexOf(id),
          1
        );
        req.user.friends.push(id);
        await req.user.save();
        return res.sendStatus(200);
      } catch (err) {
        console.error(err);
        return res.sendStatus(500);
      }
    }
    return res.sendStatus(500);
  });

friendRouter.route("/feed").get(passport.isAuthenticated, async (req, res) => {
  // console.log(req.user.friends);
  if (res.user) {
    // user needs to add friends
    return res.json([]);
  }
  const feedContent = req.user.friends.map(async (friend) => {
    const id = friend;
    // get user data
    const userData = await userController.getPublicInfoById(id);
    // delete all data from feed that's more than 1 month old
    const expirationDate = moment().subtract(1, "months");
    const monthlyFeed = userData.feed.filter((entry) =>
      moment(entry.date).isAfter(expirationDate)
    );
    await userController.updateFeed(id, monthlyFeed);
    return {
      feed: monthlyFeed,
      username: userData.username,
      user_id: userData._id,
      avatar: userData.avatar,
    };
  });
  Promise.all(feedContent).then(async (results) => {
    let populate;
    if (results.length === 0) {
      return res.json([]);
    }
    try {
      populate = results.map(async (feed) => {
        const id = feed.user_id;
        const existsInCache = cache.checkCache(id);
        let movieList = null;
        if (existsInCache) {
          console.log("cache hit");
          movieList = feed.feed.map((entry) =>
            existsInCache.find((e) => e._id.toString() === entry.movie)
          );
        } else {
          try {
            movieList = await movieController.findMoviesByFeed(feed);
          } catch (err) {
            throw err;
          }
        }
        return movieList.map((movie) => ({
          movie,
          username: feed.username,
          user_id: feed.user_id,
          avatar: feed.avatar,
        }));
      });
    } catch (err) {
      console.error(err);
      return res.sendStatus(500);
    }
    Promise.all(populate).then(async (populatedFeed) => {
      // populatedFeed.filter((e) => );
      populatedFeed = populatedFeed.reduce((acc, elem) => acc.concat(elem));
      populatedFeed.sort(
        (a, b) =>
          new Date(b.movie.date_added.date) - new Date(a.movie.date_added.date)
      );
      return res.json(populatedFeed);
    });
  });
});

friendRouter.route("/:id").get(async (req, res) => {
  const { id } = req.params;
  const existsInCache = cache.checkCache(id);
  let movieList = null;
  const userData = await userController.getPublicInfoById(id);
  if (existsInCache) {
    // the movie list exists in the cache
    console.log("cache hit");
    movieList = existsInCache;
  } else {
    movieList = await movieController.findMoviesByUser(userData.movies, id);
    cache.cacheMovieList(id.toString(), movieList);
    console.log(`cached movies seen by user with id: ${id}`);
  }

  return res.json({
    movies: movieList,
    username: userData.username,
    avatar: userData.avatar,
    friends: userData.friends,
    favorite_movie: movieList.find(
      (movie) => movie._id.toString() === userData.favorite_movie
    ),
  });
});

module.exports = friendRouter;
