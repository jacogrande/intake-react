import { typedAction } from './user';
import { Dispatch, AnyAction } from 'redux';
import { clearStore } from "./stats";

interface IDateAdded {
  date: string,
  _id: string,
  user_id: string
}

export interface IReview {
  review: string,
  user_id: string,
  username: string,
  date_added: string,
  upvotes: number,
  upvoted_by: string[],
  _id: string
}

export interface IMovieData {
  [key: string]: any,
  title: string,
  year: string,
  genres: string[],
  director: string[],
  writer: string[],
  rated: string,
  plot: string,
  themes: string[],
  date_added: IDateAdded,
  runtime: string,
  poster: string,
  entertainment_rating: number,
  plot_rating: number,
  style_rating: number,
  bias_rating: number,
  total_rating: number,
  reviews: IReview[],
  _id: string
}

export interface IAverageMovieData {
  title: string,
  year: string,
  genres: string[],
  director: string[],
  writer: string[],
  rated: string,
  plot: string,
  runtime: string,
  poster: string,
  entertainment_rating_average: number,
  plot_rating_average: number,
  style_rating_average: number,
  bias_rating_average: number,
  total_rating_average: number,
  ratings_length: number
  _id: string
}

type MovieState = {
  movies: IMovieData[] | null,
  topMoviesByPopularity: IAverageMovieData[] | null,
  topMoviesByTotal: IAverageMovieData[] | null,
  topMoviesByEntertainment: IAverageMovieData[] | null,
  topMoviesByPlot: IAverageMovieData[] | null,
  topMoviesByStyle: IAverageMovieData[] | null,
  topMoviesByBias: IAverageMovieData[] | null,
  filter: string,
  search: string,
  searchResults: IAverageMovieData[]
}

const initialState: MovieState = {
  movies: null,
  topMoviesByPopularity: null,
  topMoviesByEntertainment: null,
  topMoviesByBias: null,
  topMoviesByPlot: null,
  topMoviesByStyle: null,
  topMoviesByTotal: null,
  filter: "popularity",
  search: '',
  searchResults: []
};

export type IFilter = "popularity" | "total" | "entertainment" | "plot" | "style" | "bias";

// search setters
export const setSearch = (search: string) => typedAction("movies/SET_SEARCH", search);
const setSearchResults = (results: IAverageMovieData[]) => typedAction("movies/SET_SEARCH_RESULTS", results)

/**
 * Function that finds movies with titles similar to the provided query via api call.
 * @param {string} query The desired movie title
 */
export const searchMovies = (query: string) => async (dispatch: Dispatch<AnyAction>) => {
  dispatch(setSearch(query));
  if (query) {
    const response = await fetch(`/api/movies/search/${query}`);
    switch (response.status) {
      case 200:
        const movies = await response.json();
        return dispatch(setSearchResults(movies));
      default:
        console.error('error searching for movies');
        return dispatch(setSearchResults([]));
    }
  } else {
    dispatch(setSearchResults([]));
  }

}

// top movies and filter setters
const setTopMoviesAction = (filter: string, movies: IAverageMovieData[]) => typedAction('movies/SET_TOP_MOVIES', { filter, movies });
export const setFilter = (filter: string) => typedAction('movies/SET_FILTER', filter);

/**
 * Function that fetches the top movies of the given criteria via api call
 * @param {string} filter criteria by which to sort movies
 */
const getTopMovies = async (filter: string) => {
  const response = await fetch(`/api/movies/getTopMovies/${filter}`);
  switch (response.status) {
    case 200:
      return await response.json();
    default:
      console.error('error fetching top movies');
  }
}

/**
  * Function that maps filters to search actions.
  * @param {string} filter criteria by which to sort movies
  */
export const setTopMovies = (filter: string) => async (dispatch: Dispatch<AnyAction>) => {
  try {
    if (!filter) {
      filter = "popularity";
    }
    const movies: IAverageMovieData[] = await getTopMovies(filter);
    dispatch(setTopMoviesAction(filter, movies));
  } catch (err) {
    console.error(err);
  }
}

// movie setter
export const setMovies = (movies: IMovieData[] | null) => typedAction('movies/SET_MOVIES', movies);

/**
 * Function that loads the current user's movies via api call
 */
export const loadMovies = () => {
  return async (dispatch: Dispatch<AnyAction>) => {
    dispatch(clearStore());
    dispatch(setMovies(null));
    const response = await fetch("/api/movies");
    switch (response.status) {
      case 200:
        const data = await response.json();
        dispatch(setMovies(data));
        break;
      case 401:
        // somehow logged out of the server
        console.log('logout');
        break;
      default:
        console.log('error fetching movies');
    }
  }
}

type MovieAction = ReturnType<typeof setMovies | typeof setTopMoviesAction | typeof setFilter | typeof setSearch | typeof setSearchResults>

export function movieReducer(state = initialState, action: MovieAction): MovieState {
  switch (action.type) {
    case 'movies/SET_SEARCH':
      state.search = action.payload;
      return { ...state };
    case 'movies/SET_SEARCH_RESULTS':
      state.searchResults = action.payload;
      return { ...state };
    case 'movies/SET_MOVIES':
      return action.payload ? Object.assign({ movies: action.payload.sort((a: IMovieData, b: IMovieData) => a.title > b.title ? 1 : -1) }) : { movies: null }
    case 'movies/SET_TOP_MOVIES':
      switch (action.payload.filter) {
        case "popularity":
          state.topMoviesByPopularity = action.payload.movies;
          break;
        case "entertainment":
          state.topMoviesByEntertainment = action.payload.movies;
          break;
        case "plot":
          state.topMoviesByPlot = action.payload.movies;
          break;
        case "style":
          state.topMoviesByStyle = action.payload.movies;
          break;
        case "bias":
          state.topMoviesByBias = action.payload.movies;
          break;
        case "total":
          state.topMoviesByTotal = action.payload.movies;
          break;
      }
      return { ...state };
    case 'movies/SET_FILTER':
      state.filter = action.payload;
      return { ...state };
    default:
      return state;
  }
}