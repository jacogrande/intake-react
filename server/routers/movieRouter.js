const express = require("express");
const passport = require("../auth.js");
const omdb = require("../apis/omdb.js");
const db = require("../db/db.js");

const movieController = require("../db/movieController");
const userController = require("../db/userController");
const cache = require("../db/cache.js");

const movieRouter = express.Router();

movieRouter
  .route("/")
  .get(passport.isAuthenticated, async (req, res) => {
    const existsInCache = cache.checkCache(req.user._id);
    let movieList = null;
    if (existsInCache) {
      // the movie list exists in the cache
      console.log(`cache hit for user with username: ${req.user.username}`);
      movieList = existsInCache;
    } else {
      movieList = await movieController.findMoviesByUser(
        req.user.movies,
        req.user._id
      );
      cache.cacheMovieList(req.user._id.toString(), movieList);
      console.log(`movies cached to user with username: ${req.user.username}`);
    }
    res.json(movieList);
  })
  .post(passport.isAuthenticated, async (req, res) => {
    const { imdbid } = req.body;
    const apiData = await omdb.getMovie(imdbid); // fetch movie info using omdb api
    if (apiData.err) {
      return res.send({ error: apiData.err });
    }

    if (!cache.checkCache(req.user._id)) {
      const movieList = await movieController.findMoviesByUser(
        req.user.movies,
        req.user._id
      );
      cache.cacheMovieList(req.user._id.toString(), movieList);
      console.log(`movies cached to user with username: ${req.user.username}`);
    }

    const {
      entertainment_rating,
      plot_rating,
      style_rating,
      bias_rating,
      themes,
      director_gender,
      writer_gender,
      date,
    } = req.body; // pull data from post request

    // create theme and rating objects to append to movie object
    const ratings = {
      entertainment_rating,
      plot_rating,
      style_rating,
      bias_rating,
      total_rating:
        plot_rating + style_rating + bias_rating + entertainment_rating,
      user_id: req.user.id,
    };
    const themeData = {
      themes,
      user_id: req.user.id,
    };

    const dates = {
      date,
      user_id: req.user.id,
    };

    // check if the movie already exists in the database
    const movieExists = await movieController.findMovieByTitle(apiData.Title);

    if (movieExists) {
      // if the movie exists in the db
      const viewedByUser = req.user.movies.indexOf(movieExists._id) !== -1;
      if (!viewedByUser) {
        // if the movie exists but the user hasn't seen it
        const ratingsAdded = movieController.addRating(
          ratings,
          movieExists._id
        ); // add the user's ratings
        const themesAdded = movieController.addThemes(
          themeData,
          movieExists._id
        ); // and themes
        const datesAdded = movieController.addDates(dates, movieExists._id); // and date
        const movieAdded = userController.addMovie(
          req.user._id,
          movieExists._id,
          date
        ); // then add the movie to the user's seen movie list
        const parallelAwait = [
          await ratingsAdded,
          await themesAdded,
          await datesAdded,
          await movieAdded,
        ];

        const cachedMovie = movieExists; // create personalized movie for cache
        cachedMovie.entertainment_rating = entertainment_rating;
        cachedMovie.plot_rating = plot_rating;
        cachedMovie.style_rating = style_rating;
        cachedMovie.bias_rating = bias_rating;
        cachedMovie.total_rating =
          entertainment_rating + plot_rating + style_rating + bias_rating;
        cachedMovie.themes = themes;
        cachedMovie.date_added = dates;
        cache.addMovie(req.user._id, cachedMovie); // update the cache

        return res.status(200).json({ response: "new ratings / theme added" });
      }
      console.log("movie already seen by user");
      return res
        .status(400)
        .json({ response: "error: movie already seen by user" });
    } // if the movie doesn't exist in the db
    const movieData = {
      // create a new movie
      title: apiData.Title,
      year: apiData.Year,
      rated: apiData.Rated,
      genres: apiData.Genre.split(", "),
      director: apiData.Director.split(", "),
      director_gender,
      writer_gender,
      writer: apiData.Writer.split(", "),
      plot: apiData.Plot,
      ratings: [ratings],
      themes: [themeData],
      date_added: [dates],
      runtime: apiData.Runtime,
      poster: apiData.Poster,
    };

    const movieId = await movieController.addMovie(movieData); // add the movie to the db
    await userController.addMovie(req.user._id, movieId, date); // add the movie's id to the user's movie list

    const cachedMovie = movieData; // create personalized movie for cache
    cachedMovie.entertainment_rating = entertainment_rating;
    cachedMovie.plot_rating = plot_rating;
    cachedMovie.style_rating = style_rating;
    cachedMovie.bias_rating = bias_rating;
    cachedMovie.total_rating =
      entertainment_rating + plot_rating + style_rating + bias_rating;
    cachedMovie.themes = themes;
    cachedMovie.date_added = dates;
    cachedMovie._id = movieId;
    cachedMovie.reviews = [];
    cache.addMovie(req.user._id, cachedMovie); // update the cache

    return res.status(200).json({ response: "new movie added" });
  });

movieRouter
  .route("/addExistingMovie")
  .post(passport.isAuthenticated, async (req, res) => {
    const {
      entertainment_rating,
      plot_rating,
      style_rating,
      bias_rating,
      themes,
      date,
      id,
      movie,
    } = req.body; // pull data from post request

    // create theme and rating objects to append to movie object
    const ratings = {
      entertainment_rating,
      plot_rating,
      style_rating,
      bias_rating,
      total_rating:
        plot_rating + style_rating + bias_rating + entertainment_rating,
      user_id: req.user.id,
    };
    const themeData = {
      themes,
      user_id: req.user.id,
    };

    const dates = {
      date,
      user_id: req.user.id,
    };

    const viewedByUser = req.user.movies.indexOf(id) !== -1;
    if (!viewedByUser) {
      try {
        // if the movie exists but the user hasn't seen it
        const ratingsAdded = movieController.addRating(ratings, id); // add the user's ratings
        const themesAdded = movieController.addThemes(themeData, id); // and themes
        const datesAdded = movieController.addDates(dates, id); // and date
        const movieAdded = userController.addMovie(req.user._id, id, date); // then add the movie to the user's seen movie list
        const parallelAwait = [
          await ratingsAdded,
          await themesAdded,
          await datesAdded,
          await movieAdded,
        ];
        const existsInCache = cache.checkCache(req.user._id);
        if (!existsInCache) {
          movieList = await movieController.findMoviesByUser(
            req.user.movies,
            req.user._id
          );
          cache.cacheMovieList(req.user._id.toString(), movieList);
          console.log(
            `movies cached to user with username: ${req.user.username}`
          );
        }
        const cachedMovie = movie; // create personalized movie for cache
        cachedMovie.entertainment_rating = entertainment_rating;
        cachedMovie.plot_rating = plot_rating;
        cachedMovie.style_rating = style_rating;
        cachedMovie.bias_rating = bias_rating;
        cachedMovie.total_rating =
          entertainment_rating + plot_rating + style_rating + bias_rating;
        cachedMovie.themes = themes;
        cachedMovie.date_added = dates;
        cache.addMovie(req.user._id, cachedMovie); // update the cache

        return res.sendStatus(200);
      } catch (err) {
        console.error(err);
        return res.sendStatus(500);
      }
    }
  });

movieRouter.route("/getTopMovies/:filter").get(async (req, res) => {
  const { filter } = req.params;
  let movies;
  try {
    switch (filter) {
      case "popularity":
        movies = await movieController.getMoviesByFilter({
          ratings_length: -1,
        });
        break;
      case "total":
        movies = await movieController.getMoviesByFilter({
          total_rating_average: -1,
        });
        break;
      case "entertainment":
        movies = await movieController.getMoviesByFilter({
          entertainment_rating_average: -1,
        });
        break;
      case "plot":
        movies = await movieController.getMoviesByFilter({
          plot_rating_average: -1,
        });
        break;
      case "style":
        movies = await movieController.getMoviesByFilter({
          style_rating_average: -1,
        });
        break;
      case "bias":
        movies = await movieController.getMoviesByFilter({
          bias_rating_average: -1,
        });
        break;
    }
    res.json(movies);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

movieRouter
  .route("/omdb/:title")
  .get(passport.isAuthenticated, async (req, res) => {
    const { title } = req.params;
    try {
      const movieOptions = await omdb.getMovies(title);
      return res.status(200).json({ results: movieOptions });
    } catch (err) {
      console.error(err);
      return res.sendStatus(500);
    }
  });

movieRouter.route("/search/:query").get(async (req, res) => {
  const { query } = req.params;
  try {
    const movies = await movieController.findLikeNames(query);
    res.json(movies);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

movieRouter
  .route("/:id")
  .post(passport.isAuthenticated, async (req, res) => {
    const { id } = req.params;
    const {
      entertainment_rating,
      plot_rating,
      style_rating,
      bias_rating,
    } = req.body;

    const total_rating =
      entertainment_rating + plot_rating + style_rating + bias_rating;

    const ratings = {
      entertainment_rating,
      plot_rating,
      style_rating,
      bias_rating,
      total_rating,
      user_id: req.user._id,
    };

    const themes = {
      themes: req.body.themes,
      user_id: req.user._id,
    };

    try {
      await movieController.updateMovieRating(
        ratings,
        themes,
        req.user._id,
        id
      );
    } catch (err) {
      console.error(err);
      return res.sendstatus(401);
    }

    const cacheResponse = cache.updateRating(req.user._id, id, ratings, themes);
    if (cacheResponse) {
      console.log("cache updated");
    }

    res.sendStatus(200);
  })
  .delete(passport.isAuthenticated, async (req, res) => {
    const { id } = req.params;
    try {
      if (cache.checkCache(req.user._id)) {
        cache.removeMovie(req.user._id, id);
      } else {
        movieList = await movieController.findMoviesByUser(
          req.user.movies,
          req.user._id
        );
        cache.cacheMovieList(req.user._id.toString(), movieList);
        console.log(
          `movies cached to user with username: ${req.user.username}`
        );
        cache.removeMovie(req.user._id, id);
      }
      // await new Promise
      await movieController.removePresence(req.user._id, id);
      await userController.removeMovie(req.user._id, id);
      res.sendStatus(200);
    } catch (err) {
      debug(err);
      res.sendStatus(401);
    }
  });
movieRouter
  .route("/:id/review")
  .post(passport.isAuthenticated, async (req, res) => {
    const { id } = req.params;
    const { review } = req.body;
    try {
      let reviewId = await movieController.addReview(
        review,
        req.user._id,
        req.user.username,
        id
      );
      reviewId = reviewId.reviews[reviewId.reviews.length - 1]._id;
      cache.addReview(req.user._id, req.user.username, review, id, reviewId);
      await userController.createReview(reviewId, req.user._id);
    } catch (err) {
      console.error(err);
      return res.sendStatus(500);
    }
    return res.sendStatus(200);
  });

movieRouter
  .route("/:id/review/:review_id") // upvote
  .post(passport.isAuthenticated, async (req, res) => {
    const { vote } = req.body;
    const { id, review_id } = req.params;
    // PROCESS:
    // check to see if user has upvoted the review
    // see if that correlates with the vote action (>0 = upvote, < 0 = downvote)
    // if it does, modify the review upvote count and the user's upvote history
    const { upvoted_reviews } = req.user;
    if (!upvoted_reviews) upvoted_reviews = [];
    const currentMovie = upvoted_reviews.find(
      (e) => e.movie_id.toString() === id.toString()
    ); // get the reviews for this movie

    if (vote === 1) {
      // if liked
      if (!currentMovie || currentMovie.reviews.indexOf(review_id) === -1) {
        // if the review doesn't exist in the movie or the movie doesn't exist
        try {
          userController.addReview(req.user._id, id, review_id); // add to users reviewed list
          movieController.upvoteReview(id, review_id, req.user._id);
          cache.clearCache(req.user._id);
        } catch (err) {
          console.error(err);
          return res.sendStatus(500);
        }
      }
    } else if (currentMovie.reviews.indexOf(review_id) != -1 && vote === -1) {
      try {
        userController.removeReview(req.user._id, id, review_id);
        movieController.downvoteReview(id, review_id, req.user._id);
        cache.clearCache(req.user._id);
      } catch (err) {
        console.error(err);
        return res.sendStatus(500);
      }
    }
    res.sendStatus(200);
  })
  .delete(passport.isAuthenticated, async (req, res) => {
    const { id, review_id } = req.params;
    try {
      const users = await movieController.deleteReview(
        id,
        review_id,
        req.user.username
      );
      users.forEach((user) => {
        console.log(`review data removed from user with id: ${user}`);
        userController.removeReview(user, id, review_id);
      });
      cache.deleteReview(id, review_id, req.user.username, req.user._id);
      await userController.deleteReview(review_id, req.user._id);
      return res.sendStatus(200);
    } catch (err) {
      console.error(err);
      return res.sendStatus(500);
    }
  });
movieRouter
  .route("/:id/edit_review/:review_id")
  .post(passport.isAuthenticated, async (req, res) => {
    const { id, review_id } = req.params;
    const { review } = req.body;
    try {
      await movieController.updateReview(
        id,
        review_id,
        req.user.username,
        review
      );
      cache.updateReview(
        id,
        review_id,
        req.user.username,
        req.user._id,
        review
      );
      console.log("review updated!");
      return res.sendStatus(200);
    } catch (err) {
      console.error(err);
      return res.sendStatus(500);
    }
  });

movieRouter.route("/cleanup").get(async (req, res) => {
  if (db.checkCredentials(req.query.admin_key)) {
    try {
      await movieController.cleanupMovies();
    } catch(err) {
      console.error(err);
      return res.sendStatus(500);
    }
    return res.sendStatus(200);
  } else {
    return res.sendStatus(401);
  }
});

movieRouter.route("/cleanupDates").get(async (req, res) => {
  if (db.checkCredentials(req.query.admin_key)) {
    try {
      await movieController.cleanupMovieDates();
    } catch(err) {
      console.error(err);
      return res.sendStatus(500);
    }
    return res.sendStatus(200);
  } else {
    return res.sendStatus(401);
  }
});


module.exports = movieRouter;
