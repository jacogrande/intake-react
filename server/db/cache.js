const NodeCache = require('node-cache');
const debug = require('debug')('index');

const cache = new NodeCache();

/**
 * Function that caches the provided user's movie data
 * @param {string} userId the current user's id
 * @param {IMovieData[]} movieList the list of movie objects that the user has inputted
 */
const cacheMovieList = (userId, movieList) => {
  cache.set(userId.toString(), movieList, 1800);
};

/**
 * Function that checks to see if the user with the given user id has had their movies cached
 * @param {string} userId the current user's id
 */
const checkCache = (userId) => cache.get(userId.toString());

/**
 * Function that adds a movie to the current user's cache
 * @param {string} userId the current user's id
 * @param {IMovieData} movie the movie to be added
 */
const addMovie = (userId, movie) => {
  const cacheData = checkCache(userId);
  console.log('adding movie to cache');
  cacheData.push(movie);
  cache.del(userId.toString());
  cacheMovieList(userId, cacheData);
};

/**
 * Function that deletes a movie from the current user's cache
 * @param {string} userId the current user's id
 * @param {string} id the id of the movie to be deleted
 */
const removeMovie = (userId, id) => {
  const cacheData = checkCache(userId);
  cacheData.splice(cacheData.findIndex((v) => v._id.toString() === id), 1);
  cache.del(userId.toString());
  cacheMovieList(userId, cacheData);
};

/**
 * Function for updating a user's movie ratings in the cache
 * @param {string} userId the current user's id
 * @param {string} movieId the id of the movie to be edited
 * @param {IRatings} ratings new ratings 
 * @param {string[]} themes new themes
 */
const updateRating = (userId, movieId, ratings, themes) => {
  debug('updating rating');
  const cacheData = checkCache(userId);
  for (let i = 0; i < cacheData.length; i++) {
    if (cacheData[i]._id.toString() === movieId.toString()) {
      cacheData[i].entertainment_rating = ratings.entertainment_rating;
      cacheData[i].plot_rating = ratings.plot_rating;
      cacheData[i].style_rating = ratings.style_rating;
      cacheData[i].bias_rating = ratings.bias_rating;
      cacheData[i].total_rating = ratings.total_rating;
      cacheData[i].themes = themes.themes;
      cache.del(userId.toString());
      cacheMovieList(userId, cacheData);
      return true;
    }
  }
  return false;
};

/**
 * Function that adds a review to a movie in the current user's cache
 * @param {string} userId the current user's id
 * @param {string} username the current user's username
 * @param {string} review the user's review of the movie
 * @param {string} _id the reviewed movie's id
 * @param {string} reviewId the ObjectId of the review object
 */
const addReview = (userId, username, review, _id, reviewId) => {
  debug('adding review');
  const cacheData = checkCache(userId);
  if (cacheData) {
    for (let i = 0; i < cacheData.length; i++) {
      if (cacheData[i]._id.toString() === _id.toString()) {
        cacheData[i].reviews.push({
          review,
          user_id: userId,
          username,
          upvotes: 0,
          _id: reviewId,
        });
        cache.del(userId.toString());
        cacheMovieList(userId, cacheData);
      }
    }
  }
};

/**
 * Function that deletes a review with the specified reviewId from the movie with the specified movie id from the user's cache
 * @param {string} _id The reviewed movie's ObjectId
 * @param {string} reviewId The ObjectId of the review to be deleted
 * @param {string} username The current user's username
 * @param {string} userId the current user's id
 */
const deleteReview = (_id, reviewId, username, userId) => {
  debug('deleting review');
  const cacheData = checkCache(userId);
  if (cacheData) {
    for (let i = 0; i < cacheData.length; i++) {
      if (cacheData[i]._id.toString() === _id.toString()) {
        for (let j = 0; j < cacheData[i].reviews.length; j++) {
          if (cacheData[i].reviews[j]._id.toString() === reviewId.toString() && cacheData[i].reviews[j].username === username) {
            cacheData[i].reviews.splice(j, 1);
            break;
          }
        }
      }
    }
    cache.del(userId.toString());
    cacheMovieList(userId, cacheData);
  }
};

/**
 * Function that updates a review in the cache
 * @param {string} _id The reviewed movie's ObjectId
 * @param {string} reviewId The ObjectId of the review to be deleted
 * @param {*} username The current user's username
 * @param {*} userId the current user's id
 * @param {*} updatedReview The user's new review
 */
const updateReview = (_id, reviewId, username, userId, updatedReview) => {
  const cacheData = checkCache(userId);
  if (cacheData) {
    const movie = cacheData.findIndex((e) => e._id.toString() === _id.toString());
    if (cacheData[movie]) {
      const review = cacheData[movie].reviews.findIndex((e) => e._id.toString() === reviewId.toString() && e.username === username);
      if (review != -1) {
        debug('review updated in cache');
        cacheData[movie].reviews[review].review = updatedReview;
        cache.del(userId.toString());
        cacheMovieList(userId, cacheData);
      }
    }
  }
};

/**
 * Function that clears all of a user's cached data
 * @param {string} userId the current user's id
 */
const clearCache = (userId) => {
  cache.del(userId.toString());
};

/**
 * Function that deletes the entire cache
 */
const flushCache = () => {
  cache.flushAll();
};

module.exports = {
  cacheMovieList,
  checkCache,
  addMovie,
  removeMovie,
  updateRating,
  addReview,
  deleteReview,
  clearCache,
  updateReview,
  flushCache,
};
