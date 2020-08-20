import React from "react";
import AddMovieDrawer from "./AddMovieDrawer";
import { Tooltip, Drawer } from "@material-ui/core";
import { IFriends } from "../redux/modules/user";
import { IMovieData } from "../redux/modules/movies";
import SearchIcon from "@material-ui/icons/Search";
import moment from "moment";
import { RootState } from "../redux";
import { connect } from "react-redux";
import { isMobile, isBrowser } from "react-device-detect";

const mapStateToProps = (state: RootState) => ({
  movies: state.movies.movies,
});

type IProps = ReturnType<typeof mapStateToProps>;

interface IFeed extends IProps {
  exploreMovies: IMovieData[];
}

/**
 * Component that renders movie feeds for a user's profile
 * @param props movies taken from movie redux store
 * @param {IMovieData[]} epxloreMovies another user's movie list passed to Feed component
 */
const Feed = (props: IFeed) => {
  const [movieList] = React.useState<IMovieData[]>(() =>
    props.exploreMovies.sort((a, b) =>
      new Date(a.date_added.date) > new Date(b.date_added.date) ? -1 : 1
    )
  );
  const [results, setResults] = React.useState<IMovieData[]>(movieList);
  const [search, setSearch] = React.useState<string>("");
  const [open, setOpen] = React.useState<boolean>(false);
  const [selectedMovie, setSelectedMovie] = React.useState<IMovieData | null>(
    null
  );

  // filter the movies based on searches
  const handleSearchChange = (e: any) => {
    const query = e.target.value;
    setSearch(query);
    setResults(
      movieList.filter((movie) =>
        movie.title?.toLowerCase().includes(query.toLowerCase())
      )
    );
  };

  const handleClick = (movie: IMovieData) => {
    setSelectedMovie(movie);
    setOpen(true);
  };

  const closeDrawer = () => {
    setOpen(false);
  };

  return (
    <div className="profile-content margin-top">
      <SearchIcon className="form-icon explore-icon" />
      <input
        type="text"
        placeholder="Search"
        className=""
        value={search}
        onChange={handleSearchChange}
      />
      <div className="vertical-padding"></div>
      {results.map((movie, i) => {
        const entertainmentElements = new Array(5)
          .fill(false)
          .fill(true, 0, movie?.entertainment_rating);
        const plotElements = new Array(5)
          .fill(false)
          .fill(true, 0, movie?.plot_rating);
        const styleElements = new Array(5)
          .fill(false)
          .fill(true, 0, movie?.style_rating);
        const biasElements = new Array(5)
          .fill(false)
          .fill(true, 0, movie?.bias_rating);
        const ratingOrder = [
          {
            title: "Entertainment",
            source: entertainmentElements,
            value: movie.entertainment_rating,
          },
          {
            title: "Writing",
            source: plotElements,
            value: movie.plot_rating,
          },
          {
            title: "Style",
            source: styleElements,
            value: movie.style_rating,
          },
          {
            title: "Bias",
            source: biasElements,
            value: movie.bias_rating,
          },
        ];
        return (
          <div
            className="two-col-grid justify-center margin-top margin-bottom feed-item"
            key={movie.title}
          >
            <img
              src={movie.poster}
              alt={movie.title}
              className="poster-large"
            />
            <div className="full-width feed-rating">
              <h2 className={isBrowser ? "text-left" : ""}>
                {movie.title}{" "}
                {!props.movies?.find(
                  (uMovie: IMovieData) => uMovie._id.toString() === movie._id
                ) && (
                  <Tooltip
                    title="Add Movie"
                    aria-label="add_movie"
                    id="add_movie"
                    onClick={() => handleClick(movie)}
                  >
                    <button className="add-button">+</button>
                  </Tooltip>
                )}
              </h2>
              {ratingOrder.map((rating) => (
                <div className={isBrowser ? "two-col-grid" : "feed-grid"}>
                  <p className="green text-left">{rating.title}:</p>
                  <div className="margin-top-x no-padding">
                    {rating.source.map((value: boolean) => (
                      <div
                        className={value ? "rating-dot active" : "rating-dot"}
                      ></div>
                    ))}
                  </div>{" "}
                </div>
              ))}
              <div className={isBrowser ? "two-col-grid" : "feed-grid"}>
                <p className="green text-left">Total Rating:</p>
                <p className="text-left">{movie.total_rating} / 20</p>
              </div>
              <div className={isBrowser ? "two-col-grid" : "feed-grid"}>
                <p className="italics text-left">
                  {moment(movie.date_added.date).format("MMMM D, YYYY")}
                </p>
              </div>
              {isMobile && <div className="vertical-padding"></div>}
            </div>
          </div>
        );
      })}
      <Drawer
        className="drawer"
        open={open}
        anchor="right"
        onClose={closeDrawer}
      >
        <AddMovieDrawer closeDrawer={closeDrawer} propMovie={selectedMovie} />
      </Drawer>
    </div>
  );
};

export default connect(mapStateToProps)(Feed);
