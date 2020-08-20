// use different locations for keys depending on dev environment
if (process.env.NODE_ENV === "production") {
  omdb_api_key = process.env.OMDB_API_KEY;
} else if (process.env.NODE_ENV === "dev") {
  const config = require("../config.js");
  omdb_api_key = config.OMDB_API_KEY;
}

const axios = require("axios");

/**
 * OMDB api module
 */
module.exports = (() => {
  /**
   * Function that finds movies with titles similar to the provided query string via omdb api call
   * @param {string} title string to use as omdb query
   */
  const getMovies = async (title) => {
    const response = await axios.get(
      `https://www.omdbapi.com/?apikey=${omdb_api_key}&s=${title}`
    );
    let data = response.data;
    if (data.Search) {
      data = data.Search.filter((movie) => movie.Type === "movie");
      return data.map((movie) => ({
        Title: movie.Title,
        Poster: movie.Poster,
        imdbID: movie.imdbID,
      }));
    } else {
      throw new Error("no results");
    }
  };
  /**
   * Function that gets all of the movie data of the movie with the provided imdb id
   * @param {string} imdbid the movie's id on the imdb database
   */
  const getMovie = async (imdbid) => {
    const url = `http://www.omdbapi.com/?apikey=${omdb_api_key}&i=${imdbid}`;
    try {
      const response = await axios.get(url);
      const poster = response.data.Poster;
      const newPosterPath = poster.substring(0, poster.length - 7) + "600.jpg";
      response.data.Poster = newPosterPath;
      return response.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };
  return {
    getMovie,
    getMovies,
  };
})();
