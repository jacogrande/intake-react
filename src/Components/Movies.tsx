import React from "react";
import { Link } from "react-router-dom";
import "../Styles/Movies.css";
import "../Styles/MoviesPhone.css";
import Drawer from "@material-ui/core/Drawer";
import AddMovieDrawer from "./AddMovieDrawer";
import LazyLoad from "react-lazyload";
import MetaTags from "react-meta-tags";

import { RootState } from "../redux";
import { loadMovies, IMovieData } from "../redux/modules/movies";
import { connect } from "react-redux";
import { Dispatch, bindActionCreators } from "redux";
import { isMobile, isBrowser } from "react-device-detect";

const mapStateToProps = (state: RootState) => ({
  movies: state.movies.movies,
});

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators({ loadMovies }, dispatch);

type IMovies = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

/**
 * Component that renders the user's movies in a CSS grid
 * @param props Pulls the user's movie from the redux store
 */
const UnconnectedMovies = (props: IMovies) => {
  const [movies, setMovies] = React.useState<IMovieData[]>([]);
  const [open, setOpen] = React.useState<boolean>(false);
  const [filter, setFilter] = React.useState<string>("Title");

  // Whenever the filter is changed, re-sort the movie array
  React.useEffect(() => {
    if (props.movies) {
      switch (filter) {
        case "Date Viewed":
          setMovies(
            [...props.movies].sort((a, b) => {
              const aDate = new Date(a.date_added.date).getTime();
              const bDate = new Date(b.date_added.date).getTime();
              return bDate > aDate
                ? -1
                : bDate === aDate
                ? b.title > a.title
                  ? -1
                  : 1
                : 1;
            })
          );
          break;
        case "Rating":
          setMovies(
            [...props.movies].sort((a, b) =>
              b.total_rating > a.total_rating
                ? 1
                : b.total_rating === a.total_rating
                ? b.title > a.title
                  ? -1
                  : 1
                : -1
            )
          );
          break;
        case "Title":
          setMovies(
            [...props.movies].sort((a, b) => (a.title > b.title ? 1 : -1))
          );
          break;
      }
    }
  }, [filter]);

  const closeDrawer = () => setOpen(false);

  // JSX component for users with no movies
  const noMovies = (
    <div className="Movies margin-top noMovies">
      <button
        type="button"
        id="big-add-button"
        aria-labelledby="big-add-button-label"
        className="margin-top"
        onClick={() => setOpen(true)}
      >
        +
      </button>
      <h1
        id="big-add-button-label"
        className="text-centered margin-top"
        aria-label="Add Movie"
      >
        Add Movie
      </h1>
      <Drawer
        className="drawer"
        open={open}
        anchor="right"
        onClose={closeDrawer}
      >
        <AddMovieDrawer closeDrawer={closeDrawer} />
      </Drawer>
    </div>
  );

  // JSX component for users with movies added
  const hasMovies = (
    <div className="Movies-main margin-top">
      <MetaTags>
        <title>Your movies | INTAKE</title>
        <meta
          name="description"
          content="See all of the movies you've entered into your Intake. Sort them by their rating, the date you watched them, or their title. Click a movie for more information."
        />
      </MetaTags>
      {isMobile && <h1 id="all-movies">All Movies</h1>}
      <form onSubmit={(e) => e.preventDefault()} id="movie-select">
        <select
          aria-label="select filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="float-right margin-top"
        >
          <option value="Title">Title</option>
          <option value="Date Viewed">Date Viewed</option>
          <option value="Rating">Rating</option>
        </select>
      </form>
      {isBrowser && <h1 id="all-movies">All Movies</h1>}
      
      <div className="posters-container">
        {movies &&
          movies.map((movie) => (
            <div className="poster-wrapper" key={movie._id}>
              <LazyLoad height={500 / 1.75} offset={200} once key={movie.title}>
                <Link to={`/movies/${movie._id}`}>
                  <img
                    src={
                      movie.poster.substring(0, movie.poster.length - 7) +
                      "300.jpg"
                    }
                    className="poster-medium hover-scale"
                    alt={movie.title}
                    aria-label={`${movie.title} | ${movie.total_rating}/20`}
                  />
                  <div className="hoverText">
                    <p>
                      {movie.total_rating} <br></br>{" "}
                      <span className="overlined">20</span>
                    </p>
                  </div>
                </Link>
              </LazyLoad>
              {isMobile && <p>{movie.total_rating} / 20</p>}
            </div>
          ))}
      </div>
    </div>
  );

  return props.movies && props.movies.length > 0 ? hasMovies : noMovies;
};

export default connect(mapStateToProps, mapDispatchToProps)(UnconnectedMovies);
