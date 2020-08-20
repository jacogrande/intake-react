const Movie = require("../schemas/movie.js");
const omdb = require("../apis/omdb.js");

/**
 * Function that adds a new movie to the Movie collection
 * @param {IMovieData} movieData data for the movie to be added to the movie collection
 * @returns {string} the id of the new movie
 */
const addMovie = (movieData) => {
  const newMovie = new Movie(movieData);
  newMovie.save((err) => {
    if (err) console.error(err);
  });
  return newMovie._id;
};

/**
 * Function that finds a movie with the provided title
 * @param {string} title title to be used as mongo query
 * @returns {IMovie} the movie with the provided title
 */
const findMovieByTitle = async (title) => {
  const movie = Movie.findOne({ title }, (err, movie) => {
    if (err) return err;
    return movie;
  }).lean();
  return movie;
};

/**
 * Function that removes all content a specified user has attached to a movie document
 * @param {string} userId The ObjectId for the user who's content will be removed
 * @param {string} movieId The id of the movie to remove data from
 */
const removePresence = async (userId, movieId) => {
  Movie.findOne({ _id: movieId }, (err, movie) => {
    if (err) return console.error(err);
    let loopLength = movie.ratings.length;
    for (let i = 0; i < loopLength; i++) {
      if (movie.ratings[i].user_id.toString() === userId.toString()) {
        movie.ratings.splice(i, 1);
        i--;
        loopLength--;
      }
    }
    loopLength = movie.themes.length;
    for (let i = 0; i < loopLength; i++) {
      if (movie.themes[i].user_id.toString() === userId.toString()) {
        movie.themes.splice(i, 1);
        i--;
        loopLength--;
      }
    }
    loopLength = movie.date_added.length;
    for (let i = 0; i < loopLength; i++) {
      if (movie.date_added[i].user_id.toString() === userId.toString()) {
        movie.date_added.splice(i, 1);
        i--;
        loopLength--;
      }
    }

    movie.save((err) => {
      if (err) console.error(err);
    });
  });
};

/**
 * Function that adds a user's new ratings to a movie document
 * @param {IRatings} ratings new ratings to be added to a movie
 * @param {string} movieId ObjectId for the movie to be updated
 */
const addRating = (ratings, movieId) => {
  Movie.findOne({ _id: movieId }, (err, movie) => {
    if (err) return err;
    movie.ratings.push(ratings);
    movie.save((err) => err);
  });
};

/**
 * Function that adds new themes to a movie document
 * @param {string[]} themes list of themes to be added to the specified movie
 * @param {string} movieId ObjectId for the movie to be updated
 */
const addThemes = (themes, movieId) => {
  Movie.findOne({ _id: movieId }, (err, movie) => {
    if (err) return err;
    movie.themes.push(themes);
    movie.save((err) => err);
  });
};

/**
 * Function that adds a viewing date to a movie
 * @param {IDates} dates The date the movie was seen
 * @param {string} movieId ObjectId for the movie to be updated
 */
const addDates = (dates, movieId) => {
  Movie.findOne({ _id: movieId }, (err, movie) => {
    if (err) return err;
    movie.date_added.push(dates);
    movie.save((err) => err);
  });
};

/**
 * Function that gets a user's ratings of a movie
 * @param {IMovieData} movie Movie to gather ratings from
 * @param {string} userId Id of the user whose ratings will be fetched
 * @returns {IRatings} The specified user's ratings
 */
const getRatings = (movie, userId) => {
  for (let i = 0; i < movie.ratings.length; i++) {
    if (movie.ratings[i].user_id === userId.toString()) {
      return movie.ratings[i];
    }
  }
  return null;
};

/**
 * Function that gets a user's themes of a movie
 * @param {IMovieData} movie Movie to gather themes from
 * @param {string} userId Id of the user whose themes will be fetched
 * @returns {stringp[]} The specified user's themes
 */
const getThemes = (movie, userId) => {
  for (let i = 0; i < movie.themes.length; i++) {
    if (movie.themes[i].user_id === userId.toString()) {
      return movie.themes[i];
    }
  }
  return null;
};

/**
 * Function that gets a user's viewing date of a movie
 * @param {IMovieData} movie Movie to gather viewing date from
 * @param {string} userId Id of the user whose viewing date will be fetched
 * @returns {string} The specified user's viewing date
 */
const getDates = (movie, userId) => {
  for (let i = 0; i < movie.date_added.length; i++) {
    if (movie.date_added[i].user_id === userId.toString()) {
      return movie.date_added[i];
    }
  }
  return null;
};

/**
 * Function that returns the data attached to a movie by a specified user
 * @param {IMovieData} movie Movie to filter
 * @param {string} userId Id of user to gather data from
 */
const filterByUser = (movie, userId) => {
  const ratings = getRatings(movie, userId);
  const themes = getThemes(movie, userId);
  const date_added = getDates(movie, userId);
  if (ratings && themes && date_added) {
    const movieData = {
      title: movie.title,
      year: movie.year,
      rated: movie.rated,
      genres: movie.genres,
      director: movie.director,
      director_gender: movie.director_gender,
      writer_gender: movie.writer_gender,
      writer: movie.writer,
      plot: movie.plot,
      entertainment_rating: ratings.entertainment_rating,
      plot_rating: ratings.plot_rating,
      style_rating: ratings.style_rating,
      bias_rating: ratings.bias_rating,
      total_rating: ratings.total_rating,
      themes: themes.themes,
      runtime: movie.runtime,
      poster: movie.poster,
      date_added,
      reviews: movie.reviews,
      _id: movie._id,
    };

    return movieData;
  }
  return {};
};

/**
 * Function that gets all of the users movies
 * @param {string[]} movieList list of movie id's
 * @param {string} userId ObjectId of the user whose movies will be populated
 * @returns {IMovieData[]} Array of movie data
 */
const findMoviesByUser = async (movieList, userId) => {
  const movies = await Movie.find().where("_id").in(movieList).lean().exec();
  let filteredMovies = movies.map((movie) => filterByUser(movie, userId));
  filteredMovies = [...new Set(filteredMovies)];
  filteredMovies = filteredMovies.filter((e) => e.title);
  return filteredMovies;
};

/* FEED INTERFACE
{
  feed: [{movie: string, date: Date}],
  username: string,
  user_id: string
}
*/
/**
 * Function that populates a user's feed with movie data
 * @param {IFeed} feed A user's monthly movie feed
 * @returns A user's populated monthly feed
 */
const findMoviesByFeed = async (feed) => {
  const movieList = feed.feed.map((entry) => entry.movie);
  return await findMoviesByUser(movieList, feed.user_id);
};

/**
 * Function that fetches all of the movie data in the Movie collection
 */
const getAllMovies = async () => await Movie.find();

/**
 * Function that finds a movie based on the inputted id
 * @param {string} _id Id to be queried
 * @returns {IMovieData} The movie with the matching id
 */
const findMovieById = async (_id) => {
  const movie = await Movie.findOne({ _id }, (err, hit) => {
    if (err) return err;
    return hit;
  }).lean();
  return movie;
};

/**
 * Function that updates a specified user's ratings attached to the given movie document
 * @param {IRatings} ratings New ratings
 * @param {string[]} themes new themes
 * @param {string} userId ObjectId of user updating ratings
 * @param {string} _id ObjectId of movie to be updated
 */
const updateMovieRating = async (ratings, themes, userId, _id) => {
  Movie.findOne({ _id }, (err, movie) => {
    if (err) throw err;
    if (movie) {
      for (let i = 0; i < movie.ratings.length; i++) {
        if (movie.ratings[i].user_id.toString() === userId.toString()) {
          movie.ratings[i] = ratings;
        }
      }
      for (let i = 0; i < movie.themes.length; i++) {
        if (movie.themes[i].user_id.toString() === userId.toString()) {
          movie.themes[i] = themes;
        }
      }
      return movie.save((err) => err);
    }
    throw new Error("no movie found");
  });
};

/**
 * Function that adds a new review to a movie document
 * @param {string} review A user's new review
 * @param {string} userId the reviewer's id
 * @param {string} username the reviewer's username
 * @param {string} _id the reviewed movie's ObjectId
 */
const addReview = async (review, userId, username, _id) => {
  const movie = await Movie.findOne({ _id });
  if (movie) {
    const alreadyReviewed = movie.reviews.find(
      (review) => review.username === username
    );
    if (alreadyReviewed) throw new Error("Review already made");
    movie.reviews.push({
      review,
      user_id: userId,
      username,
    });
    await movie.save((err) => err);
    return movie;
  }
};

/**
 * Function that deletes a specified review from a movie document
 * @param {string} _id id of the movie the review belongs to
 * @param {string} review_id id of the review to be deleted
 * @param {string} username username of the reviewer
 */
const deleteReview = async (_id, review_id, username) => {
  const reviews = await Movie.findOne({ _id }).select("reviews");
  const target = reviews.reviews.find(
    (e) => e._id.toString() === review_id.toString()
  );
  if (target.username === username) {
    // validated
    const users = target.upvoted_by;
    reviews.reviews.splice(reviews.reviews.indexOf(target), 1);
    await reviews.save((err) => {
      if (err) console.error(err);
    });
    return users;
  }
  return [];
};

/**
 * Function that adds 1 upvote to a specified movie review
 * @param {string} _id Id of the reviewed movie
 * @param {string} reviewId Id of the review
 * @param {string} userId id of the upvoter
 */
const upvoteReview = async (_id, reviewId, userId) => {
  const movie = await Movie.findOne({ _id }).select("reviews");
  const reviewIndex = movie.reviews.findIndex(
    (e) => e._id.toString() === reviewId.toString()
  );
  if (movie.reviews[reviewIndex].upvoted_by.indexOf(userId) === -1) {
    movie.reviews[reviewIndex].upvotes++;
    movie.reviews[reviewIndex].upvoted_by.push(userId);
    return await movie.save((err) => {
      if (err) console.error(err);
    });
  }
  console.log("already upvoted");
};

/**
 * Function that removes 1 upvote to a specified movie review
 * @param {string} _id Id of the reviewed movie
 * @param {string} reviewId Id of the review
 * @param {string} userId id of the downvoter
 */
const downvoteReview = async (_id, reviewId, userId) => {
  const movie = await Movie.findOne({ _id }).select("reviews"); // get the reviews
  const reviewIndex = movie.reviews.findIndex(
    (e) => e._id.toString() === reviewId.toString()
  ); // find the target review
  if (movie.reviews[reviewIndex].upvoted_by.indexOf(userId) != -1) {
    // if the user has upvoted the review
    movie.reviews[reviewIndex].upvotes -= 1;
    movie.reviews[reviewIndex].upvoted_by.splice(
      movie.reviews[reviewIndex].upvoted_by.indexOf(userId),
      1
    );
    return await movie.save((err) => {
      if (err) console.error(err);
    });
  }
  console.log("already downvoted");
};

/**
 * Function that updates a specified movie review
 * @param {string} _id id of the reviewed movie
 * @param {string} reviewId id of the review
 * @param {string} username the reviewer's username
 * @param {string} review the new review to be uploaded
 */
const updateReview = async (_id, reviewId, username, review) => {
  const movie = await Movie.findOne({ _id }).select("reviews");
  const reviewIndex = movie.reviews.findIndex(
    (e) => e._id.toString() === reviewId.toString()
  );
  if (movie.reviews[reviewIndex].username === username) {
    console.log("movie found and validated");
    movie.reviews[reviewIndex].review = review;
    return await movie.save((err) => {
      if (err) console.error(err);
    });
  }
  return false;
};

/**
 * Function that finds movies with titles similar to the given string
 * @param {string} title String to compare movie titles to
 * @return {IMovieData[]} An array of movies with similar titles
 */
const findLikeNames = async (title) => {
  const movies = await Movie.find({
    title: new RegExp(title, "i"),
  }).lean();
  return movies;
};

/**
 * Function that updates movie poster sources via omdb api call
 */
const refreshPosters = async () => {
  const allMovies = await Movie.find().select("title poster");

  for (let i = 0; i < allMovies.length; i++) {
    let movieTitle = allMovies[i].title;
    if (movieTitle.indexOf("-") != -1) {
      movieTitle = movieTitle.replace(" - ", "-");
    }
    const movie = await omdb.getMovies(movieTitle);
    if (movie instanceof Array) {
      const selectedMovie = movie.find(
        (selection) => selection.Title === allMovies[i].title
      );
      allMovies[i].poster =
        selectedMovie.Poster.substring(0, selectedMovie.Poster.length - 7) +
        "600.jpg";
      allMovies[i].save();
    }
  }
};

/**
 * Function that sorts movies and returns the top 10 based on the provided filter
 * @param {any} filter Filter to be applied to movies
 * @returns {Movie} The top 10 movies sorted by the provided filter
 */
const getMoviesByFilter = async (filter) =>
  await Movie.find({ ratings_length: { $gt: 1 } })
    .sort(filter)
    .limit(10)
    .lean();

/**
 * Function that cleans up movie data (for new movie schemas)
 */
const cleanupMovies = async () => {
  await Movie.updateMany({}, [
    { $set: { ratings: { $setUnion: [{ $ifNull: ["$ratings", []] }] } } },
    { $set: { ratings_length: { $size: "$ratings" } } },
  ]);

  const averages = await Movie.aggregate([
    { $unwind: "$ratings" },
    {
      $group: {
        _id: "$_id",
        total_rating_average: { $avg: "$ratings.total_rating" },
        entertainment_rating_average: { $avg: "$ratings.entertainment_rating" },
        plot_rating_average: { $avg: "$ratings.plot_rating" },
        style_rating_average: { $avg: "$ratings.style_rating" },
        bias_rating_average: { $avg: "$ratings.bias_rating" },
      },
    },
  ]);

  for (let i = 0; i < averages.length; i++) {
    const doc = averages[i];
    await Movie.updateOne({ _id: doc._id }, [
      { $set: { total_rating_average: doc.total_rating_average } },
      {
        $set: {
          entertainment_rating_average: doc.entertainment_rating_average,
        },
      },
      { $set: { plot_rating_average: doc.plot_rating_average } },
      { $set: { style_rating_average: doc.style_rating_average } },
      { $set: { bias_rating_average: doc.bias_rating_average } },
    ]);
  }

  await refreshPosters;
};

module.exports = {
  addMovie,
  findMovieByTitle,
  addRating,
  addThemes,
  addDates,
  findMoviesByUser,
  removePresence,
  getAllMovies,
  findMovieById,
  filterByUser,
  updateMovieRating,
  addReview,
  deleteReview,
  upvoteReview,
  downvoteReview,
  updateReview,
  refreshPosters,
  findMoviesByFeed,
  getMoviesByFilter,
  cleanupMovies,
  findLikeNames,
};
