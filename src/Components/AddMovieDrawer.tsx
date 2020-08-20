import React from "react";
import SearchIcon from "@material-ui/icons/Search";
import { searchMovies, IProcessedMovieData } from "../util/api";
import "../Styles/Poster.css";
import { IMovieData } from "../redux/modules/movies";
import CopyMovie from "./CopyMovie";
import RateMovie from "./RateMovie";

interface IAddMovieModal {
  closeDrawer: () => void;
  propMovie?: IMovieData | null;
}

/**
 * Container for the add movie drawer.
 * @param {IAddMovieModal} props Component properties
 * @param {()=>void} props.closeDrawer Function that closes the drawer component
 * @param {IMovieData | null} [props.propMovie] Optional movie passed to the modal. If it is passed, the drawer will copy the movie data.
 */
const AddMovieModal = (props: IAddMovieModal) => {
  const [search, setSearch] = React.useState<string>("");
  const [movies, setMovies] = React.useState<IProcessedMovieData[]>([]);
  const [
    selectedMovie,
    setSelectedMovie,
  ] = React.useState<IProcessedMovieData | null>(null);

  // Search for a movie
  const handleSubmit = async (e: any): Promise<void> => {
    e.preventDefault();
    try {
      if (search) {
        // make an api call to the server to fetch movies with similar titles
        const searchData = await searchMovies(search);
        setMovies(searchData);
        setSelectedMovie(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearchChange = (e: any): void => {
    setSearch(e.target.value);
  };

  const handlePosterClick = (movie: IProcessedMovieData): void => {
    setSelectedMovie(movie);
  };

  if(props.propMovie) {
    return (
      <div className="drawer-content">
        <div className="drawer-header">
          <h2 id="movieSearchLabel">Add Movie</h2>
        </div>
        <div className="drawer-body text-centered">
          <CopyMovie movie={props.propMovie} closeDrawer={props.closeDrawer} />
        </div>
      </div>
    )
  }

  return (
    <div className="drawer-content">
      <div className="drawer-header">
        <h2 id="movieSearchLabel">Add Movie</h2>
      </div>
      <div className="drawer-body">
        <form autoComplete="off" onSubmit={handleSubmit}>
          <div className="inline-flex full-width">
            <SearchIcon />
            <input
              type="text"
              aria-labelledby="movieSearchLabel"
              placeholder="Search"
              className="full-width"
              id="searchInput"
              value={search}
              onChange={handleSearchChange}
            />
          </div>
          <div className="inline-flex full-width row-reverse margin-top">
            <button type="submit" className="button-submit">
              Search
            </button>
            <button
              onClick={props.closeDrawer}
              type="button"
              className="button-cancel margin-right"
            >
              Cancel
            </button>
          </div>
        </form>
        <div className="vertical-padding"></div>
        {selectedMovie ? (
          <div className="text-centered">
            <RateMovie movie={selectedMovie} closeDrawer={props.closeDrawer} />
          </div>
        ) : (
          <div className="grid text-centered">
            {movies.map((movie) => (
              <img
                className="half-col hover-scale"
                src={movie.Poster}
                alt={movie.Title}
                onClick={() => handlePosterClick(movie)}
                key={`search-poster-${movie.Title}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddMovieModal;
