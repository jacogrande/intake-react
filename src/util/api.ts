interface IBasicMovieData {
  Title: string,
  Year: string,
  imdbID: string,
  Type: string,
  Poster: string
}
export interface IProcessedMovieData {
  Title: string,
  Poster: string,
  imdbID: string
}

/**
 * Asynchronous function that returns a list of movies based on the given query string (uses the omdb api)
 * @param {string} title The title of the movie
 * @returns {IProcessedMovieData[]} A list of movies with titles similar to the query
 */
export const searchMovies = async (title: string): Promise<IProcessedMovieData[]>  => {
  const results = await fetch(`/api/movies/omdb/${title}`);
  if(results.status === 200) {
    let data = await results.json(); 
    return data.results;
  } else {
    throw new Error("invalid search");
  }
  
}
