import React from "react";
import { RootState } from "../../redux";
import { connect } from "react-redux";
import { IMovieData, IAverageMovieData } from "../../redux/modules/movies";
import AddMovieDrawer from "../AddMovieDrawer";
import { Tooltip, Drawer } from "@material-ui/core";
import { format } from "util";

const mapStateToProps = (state: RootState) => ({
  userMovies: state.movies.movies,
});

type IProps = ReturnType<typeof mapStateToProps>;

interface IMovieFeed extends IProps {
  movies: IAverageMovieData[] | null;
}

/**
 * Component that renders a feed with the top movies.
 * @param {IMovieFeed} props Component properties taken from redux store.
 * @param {IAverageMovieData[] | null} props.movies A list of the top movies and their average ratings.
 */
const MovieFeed = (props: IMovieFeed) => {
  const [open, setOpen] = React.useState<boolean>(false);
  const [selectedMovie, setSelectedMovie] = React.useState<IMovieData | null>(
    null
  );

  const closeDrawer = () => {
    setOpen(false);
  };

  const handleClick = (movie: IAverageMovieData) => {
    let formattedMovie: IMovieData;
    formattedMovie = Object.assign({...movie})
    setSelectedMovie(formattedMovie);
    setOpen(true);
  };

  return (
    <div className="profile-content margin-top">
      {/* Map the movie list to feed items */}
      {props.movies && props.movies.length > 0 ? (
        props.movies?.map((movie, i) => {
          if (!movie.entertainment_rating_average)
            movie.entertainment_rating_average = 0;
          if (!movie.plot_rating_average) movie.plot_rating_average = 0;
          if (!movie.style_rating_average) movie.style_rating_average = 0;
          if (!movie.bias_rating_average) movie.bias_rating_average = 0;
          if (!movie.total_rating_average) movie.total_rating_average = 0;
          const entertainmentElements = new Array(5).fill(false);
          const plotElements = new Array(5).fill(false);
          const styleElements = new Array(5).fill(false);
          const biasElements = new Array(5).fill(false);
          const ratingOrder = [
            {
              title: "Entertainment",
              source: entertainmentElements,
              value: Number(movie.entertainment_rating_average.toLocaleString('fullwide', {maximumFractionDigits: 2})),
            },
            {
              title: "Writing",
              source: plotElements,
              value: Number(movie.plot_rating_average.toLocaleString('fullwide', {maximumFractionDigits: 2})),
            },
            {
              title: "Style",
              source: styleElements,
              value: Number(movie.style_rating_average.toLocaleString('fullwide', {maximumFractionDigits: 2})),
            },
            {
              title: "Bias",
              source: biasElements,
              value: Number(movie.bias_rating_average.toLocaleString('fullwide', {maximumFractionDigits: 2})),
            },
          ];
          return (
            <div className="feed-item" key={movie._id}>
              <div
                className="two-col-grid margin-top margin-bottom"
                key={movie.title}
              >
                <div className="feed-poster">
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="poster-large"
                  />
                </div>

                <div className="full-width feed-rating">
                  <h2 className="feed-title">
                    {movie.title}{" "}
                    {!props.userMovies?.find(
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
                    <div
                      className="feed-grid"
                      key={`${rating.title}_${movie.title}`}
                    >
                      <p className="green text-left">{rating.title}:</p>
                      <div className="margin-top-x no-padding">
                        {rating.source.map((value: boolean, i: number) => (
                          <div
                            className="rating-dot"
                            key={`${rating.title}_${movie.title}_${i}`}
                          >
                            {/* check if current dot should be filled */}
                            {rating.value - i > 0 &&
                              (rating.value - i < 1 ? (
                                <div
                                  className="rating-dot-filler"
                                  style={{
                                    width: `${(rating.value - i) * 10}px`,
                                  }}
                                ></div>
                              ) : (
                                <div
                                  className="rating-dot-filler"
                                  style={{ width: "10px" }}
                                ></div>
                              ))}
                          </div>
                        ))}
                      </div>{" "}
                    </div>
                  ))}
                  <div className="feed-grid">
                    <p className="green text-left">Total Rating:</p>
                    <p className="text-left">
                      {movie.total_rating_average.toLocaleString('fullwide', {maximumFractionDigits: 2})} / 20
                    </p>
                  </div>
                  <div className="feed-grid">
                    <p className="green text-left">Total Entries: </p>
                    <p className="text-left">{movie.ratings_length}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <p className="italics grey">No movies matches your query</p>
      )}
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

export default connect(mapStateToProps)(MovieFeed);
