import React from "react";
import { RootState } from "../../redux";
import { connect } from "react-redux";
import { Dispatch, bindActionCreators } from "redux";
import { getFeed, loadProfile } from "../../redux/modules/explore";
import moment from "moment";
import { NavLink } from "react-router-dom";
import { Tooltip, Drawer } from "@material-ui/core";
import { IMovieData } from "../../redux/modules/movies";
import AddMovieDrawer from "../AddMovieDrawer";

const mapStateToProps = (state: RootState) => ({
  friends: state.user.friends,
  feed: state.explore.feed,
  movies: state.movies.movies,
});

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators({ getFeed, loadProfile }, dispatch);

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

  /**
   * Component that renders the current user's monthly feed.
   * @param {Props} props properties taken from redux store.
   */
const Feed = (props: Props) => {
  const [open, setOpen] = React.useState<boolean>(false);
  const [selectedMovie, setSelectedMovie] = React.useState<IMovieData | null>(
    null
  );

  const closeDrawer = () => {
    setOpen(false);
  };

  const handleClick = (movie: IMovieData) => {
    setSelectedMovie(movie);
    setOpen(true);
  };

  if (!props.feed) {
    props.getFeed();
    return <p>loading</p>;
  }

  if(props.feed.length === 0){
    return (
      <div className="profile-content margin-top">
        <p className="grey italics">Your friends haven't been very active... check back soon!</p>
      </div>
    )
  }

  return (
    <div className="profile-content margin-top">
      {props.feed.map((entry, i) => {
        const movie = entry.movie;
        const entertainmentElements = new Array(5).fill(false);
        const plotElements = new Array(5).fill(false);
        const styleElements = new Array(5).fill(false);
        const biasElements = new Array(5).fill(false);
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
          <div className="feed-item" key={entry.movie.title}>
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
                  {!props.movies?.find(
                    (movie: IMovieData) => movie._id === entry.movie._id
                  ) && (
                    <Tooltip
                      title="Add Movie"
                      aria-label="add_movie"
                      id="add_movie"
                      onClick={() => handleClick(entry.movie)}
                    >
                      <button className="add-button">+</button>
                    </Tooltip>
                  )}
                </h2>
                {ratingOrder.map((rating) => (
                  <div
                    className="feed-grid"
                    key={`${entry.movie.title}_${rating.title}`}
                  >
                    <p className="green text-left">{rating.title}:</p>
                    <div className="margin-top-x no-padding">
                      {rating.source.map((value: boolean, i: number) => (
                        <div
                          className="rating-dot"
                          key={`${entry.movie.title}_${
                            rating.title
                          }_${i.toString()}`}
                        >
                          {/* check if current dot should be filled */}
                          {rating.value - i > 0 &&
                            (rating.value - i < 1 ? (
                              <div className="rating-dot-filler"></div>
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
                  <p className="text-left">{movie.total_rating} / 20</p>
                </div>
                <NavLink
                  onClick={() => props.loadProfile(entry.user_id)}
                  to={`/explore/user/${entry.user_id}`}
                  className="feed-user-container link white"
                  aria-label={`See ${entry.username}'s profile`}
                >
                  <div className="feed-avatar-wrapper">
                    <svg className="feed-avatar">
                      {entry.avatar?.tilemap.map((row, y) =>
                        row.map((col, x) => (
                          <rect
                            x={x * 6}
                            y={y * 6}
                            width={6}
                            height={6}
                            style={{
                              fill:
                                entry.avatar?.tilemap[y][x] === 1
                                  ? entry.avatar?.color
                                  : "#171e22",
                            }}
                            key={`${x}-${y}-rect`}
                          ></rect>
                        ))
                      )}
                    </svg>
                  </div>
                  <p className="feed-username">{entry.username}</p>
                </NavLink>
                <div className="feed-date">
                  <p className="italics gray full-width">
                    {moment(entry.movie.date_added.date).format("MMM DD, YYYY")}
                  </p>
                </div>
              </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(Feed);
