import React from "react";
import { useParams, Redirect, Link } from "react-router-dom";
import moment from "moment";
import "../Styles/Movies.css";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import Tooltip from "@material-ui/core/Tooltip";
import Drawer from "@material-ui/core/Drawer";
import EditMovie from "./EditMovie";
import DeleteMovie from "./DeleteMovie";
import SettingsIcon from "@material-ui/icons/Settings";
import EditIcon from "@material-ui/icons/Edit";
import CloseIcon from "@material-ui/icons/Close";
import MetaTags from "react-meta-tags";

import { RootState } from "../redux";
import { loadMovies, IReview } from "../redux/modules/movies";
import { connect } from "react-redux";
import { Dispatch, bindActionCreators } from "redux";
import ThumbUpIcon from "@material-ui/icons/ThumbUp";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import { isMobile } from "react-device-detect";

interface IDeleteReview {
  open: boolean;
  closeDialog: () => void;
  handleSubmit: () => void;
}

// Delete Review dialog
const DeleteReview = (props: IDeleteReview) => {
  return (
    <Dialog
      open={props.open}
      onClose={props.closeDialog}
      aria-labelledby="dialog-title"
      aria-describedby="dialog-description"
      className="dialog"
    >
      <DialogTitle id="dialog-title">{"Delete Review?"}</DialogTitle>
      <DialogContent>
        <DialogContentText id="dialog-description">
          Deleting this review will result in it being permanently removed from
          our servers.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <button onClick={props.closeDialog} className="button-cancel">
          Cancel
        </button>
        <button
          type="submit"
          onClick={props.handleSubmit}
          className="button-submit"
        >
          Delete
        </button>
      </DialogActions>
    </Dialog>
  );
};

const mapStateToProps = (state: RootState) => ({
  movies: state.movies.movies,
  _id: state.user._id,
  upvoted_reviews: state.user.upvoted_reviews,
  username: state.user.username,
});

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators({ loadMovies }, dispatch);


type IMovieRatings = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

/**
 * Component that displays the user's rating for a given movie
 * @param props Component props taken from redux store
 */
const UnconnectedMovieRatings = (props: IMovieRatings) => {
  const { id } = useParams();
  const [showReviews, setShowReviews] = React.useState<boolean>(true);
  const [newReview, setNewReview] = React.useState<string>("");
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [drawerOpen, setDrawerOpen] = React.useState<boolean>(false);
  const [dialogOpen, setDialogOpen] = React.useState<boolean>(false);
  const [deleteReviewOpen, setDeleteReviewOpen] = React.useState<boolean>(
    false
  );
  const [editing, setEditing] = React.useState<boolean>(false);
  const [selectedReview, setSelectedReview] = React.useState<IReview | null>(
    null
  );

  const movie = props.movies?.find((movie) => movie._id === id);

  // if the user hasn't rated the movie, redirect them to the movies page
  if (!movie) {
    return <Redirect to="/movies" />;
  }

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

  // submission handler that sends the written review to the api serve
  const handleReviewSubmit = async (e: any): Promise<void> => {
    e.preventDefault();
    const response = await fetch(`/api/movies/${id}/review`, {
      method: "post",
      body: JSON.stringify({ review: newReview }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.status === 200) {
      console.log("success");
      setShowReviews(true);

      props.loadMovies();
    } else {
      console.log("failure");
    }
  };
  const tabListener = (e: any): void => {
    if (e.keyCode === 9) {
      e.preventDefault();
      setNewReview((prev) => prev + "    ");
    }
  };

  // submission handler that sends an edited review to the api server
  const handleReviewEdit = async (e: any): Promise<void> => {
    e.preventDefault();
    const response = await fetch(
      `/api/movies/${id}/edit_review/${selectedReview?._id}`,
      {
        method: "post",
        body: JSON.stringify({ review: newReview }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (response.status === 200) {
      setEditing(false);
      setShowReviews(true);
      props.loadMovies();
    } else {
      console.log("failure");
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  const handleEditClick = (): void => {
    handleClose();
    setDrawerOpen(true);
  };

  const handleDeleteClick = (): void => {
    handleClose();
    setDialogOpen(true);
  };

  const closeDialog = () => setDialogOpen(false);

  const closeDrawer = () => setDrawerOpen(false);

  // sends an api call to the server, upvoting the given review
  const upvoteReview = async (review: IReview, vote: 1 | -1) => {
    const response = await fetch(`/api/movies/${id}/review/${review._id}`, {
      method: "post",
      body: JSON.stringify({ vote }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.status === 200) {
      props.loadMovies();
    } else {
      console.log("error");
    }
  };

  const deleteReview = async (review: IReview) => {
    const response = await fetch(`/api/movies/${id}/review/${review._id}`, {
      method: "delete",
    });
    if (response.status === 200) props.loadMovies();
    else console.log("error");
  };

  const editReview = (review: IReview) => {
    setNewReview(review.review);
    setSelectedReview(review);
    setShowReviews(false);
    setEditing(true);
  };

  movie.reviews = movie.reviews.sort((a, b) => b.upvotes - a.upvotes);

  return (
    <div className="Movies">
      <MetaTags>
        <title> Your ratings for {movie.title} | INTAKE</title>
        <meta
          name="description"
          content={`See your inputted ratings for ${movie.title} as well as who directed it, who wrote it, its genres, themes, and more. See other user's opinion of ${movie.title}, and write your own review.`}
        />
      </MetaTags>
      <Tooltip title="Options" aria-label="options">
        <button
          type="button"
          id="options"
          className="float-right margin-top-xx button-icon"
          aria-controls="simple-menu"
          aria-haspopup="true"
          onClick={handleClick}
        >
          <SettingsIcon />
        </button>
      </Tooltip>
      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={handleEditClick}>Edit</MenuItem>
        <MenuItem onClick={handleDeleteClick}>Delete</MenuItem>
      </Menu>
      <Drawer
        className="drawer"
        open={drawerOpen}
        anchor="right"
        onClose={closeDrawer}
      >
        <EditMovie
          movie={movie}
          entertainment_rating={movie.entertainment_rating}
          plot_rating={movie.plot_rating}
          style_rating={movie.style_rating}
          bias_rating={movie.bias_rating}
          themes={movie.themes}
          closeDrawer={closeDrawer}
          id={id}
        />
      </Drawer>
      <DeleteMovie open={dialogOpen} closeDialog={closeDialog} id={id} />
      <div className="vertical-padding"></div>
      <div className="row">
        <div className="poster-large-container">
          <img
            src={movie.poster}
            className="poster-large margin-top"
            alt={movie.title}
          />
        </div>
        <div className={isMobile ? "col" : "col margin-left-x"}>
          <h1 className={isMobile ? "text-centered" : ""}>{movie.title}</h1>
          <div className="two-col-grid">
            <div className={isMobile ? "feed-grid" : "two-col-grid"}>
              {ratingOrder.map((rating) => (
                <React.Fragment key={rating.title}>
                  <p className="green">{rating.title}: </p>
                  <div className="margin-top-x no-padding">
                    {rating.source.map((value: boolean, i) => (
                      <div
                        className={value ? "rating-dot active" : "rating-dot"}
                        key={`${rating.title}_${i}`}
                      ></div>
                    ))}
                  </div>
                </React.Fragment>
              ))}
              <p className="green">Total Rating: </p>
              <p>{movie.total_rating}/20</p>
              <p className="green">Date Viewed:</p>
              <p>{moment(movie.date_added.date).format("MM-DD-YYYY")}</p>
            </div>
            <div className={isMobile ? "feed-grid-one-col" : ""}>
              <p>
                <span className="green">Director: </span>
                {movie.director.map((director, i) => (
                  <Tooltip
                    title={`See stats for director: ${director}`}
                    aria-label={`Link to see stats for director: ${director}`}
                    key={`${director}-director-link`}
                  >
                    <Link
                      to={`/stats/director/${director}`}
                      className="link white button-icon"
                    >
                      {i === 0 ? director : `, ${director}`}
                    </Link>
                  </Tooltip>
                ))}
              </p>
              <p>
                <span className="green">Writer: </span>
                {movie.writer.map((writer, i) => (
                  <Tooltip
                    title={`See stats for writer: ${writer}`}
                    aria-label={`Link to see stats for writer: ${writer}`}
                    key={`${writer}-writer-link`}
                  >
                    <Link
                      to={`/stats/writer/${writer}`}
                      className="link white button-icon"
                    >
                      {i === 0 ? writer : `, ${writer}`}
                    </Link>
                  </Tooltip>
                ))}
              </p>
              <p>
                <span className="green">Genres: </span>
                {movie.genres.map((genre, i) => (
                  <Tooltip
                    title={`See stats for genre: ${genre}`}
                    aria-label={`Link to see stats for genre: ${genre}`}
                    key={`${genre}-genre-link`}
                  >
                    <Link
                      to={`/stats/genres/${genre}`}
                      className="link white button-icon"
                    >
                      {i === 0 ? genre : `, ${genre}`}
                    </Link>
                  </Tooltip>
                ))}
              </p>
              <p>
                <span className="green">Year Released: </span>
                <Tooltip
                  title={`See stats for movies released in ${movie.year}`}
                  aria-label={`See stats for movies released in ${movie.year}`}
                >
                  <Link
                    to={`/stats/year/${movie.year}`}
                    className="link white button-icon"
                  >
                    {movie.year}
                  </Link>
                </Tooltip>
              </p>
              <p>
                <span className="green">Rated: </span>{" "}
                <Tooltip
                  title={`See stats for movies with a ${movie.rated} content rating.`}
                  aria-label={`See stats for movies with a ${movie.rated} content rating.}`}
                >
                  <Link
                    to={`/stats/rated/${movie.rated}`}
                    className="link white"
                  >
                    {movie.rated}
                  </Link>
                </Tooltip>
              </p>
              <p>
                <span className="green">Runtime: </span> {movie.runtime}
              </p>
              <p>
                <span className="green">Themes: </span>
                {movie.themes.map((theme, i) => (
                  <Tooltip
                    title={`See stats for theme: ${theme}`}
                    aria-label={`Link to see stats for theme: ${theme}`}
                    key={`${theme}-theme-link`}
                  >
                    <Link
                      to={`/stats/themes/${theme}`}
                      className="link white button-icon"
                    >
                      {i === 0 ? theme : `, ${theme}`}
                    </Link>
                  </Tooltip>
                ))}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="vertical-padding border-bottom"></div>
      <div className="two-col-grid">
        <div>
          <p className="green">Premise: </p>
          <p className="indented italics">{movie.plot}</p>
        </div>
        <div className="border-left">
          <div className="margin-left margin-top">
            <h2 className="bold float-left no-margin-top">Reviews</h2>
            {showReviews ? (
              <button
                type="button"
                className="button-submit float-right"
                onClick={() => {
                  setShowReviews(false);
                  setEditing(false);
                }}
              >
                Add a Review
              </button>
            ) : (
              <form
                autoComplete="off"
                onSubmit={editing ? handleReviewEdit : handleReviewSubmit}
              >
                <textarea
                  className="full-width"
                  placeholder="Your review"
                  onKeyDown={tabListener}
                  value={newReview}
                  onChange={(e) => setNewReview(e.target.value)}
                ></textarea>
                <div className="inline-flex full-width row-reverse margin-top margin-left-s">
                  {editing ? (
                    <button type="submit" className="button-submit">
                      Edit Review
                    </button>
                  ) : (
                    <button type="submit" className="button-submit">
                      Submit Review
                    </button>
                  )}

                  <button
                    type="button"
                    className="button-cancel margin-right"
                    onClick={() => setShowReviews(true)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
            <div className="vertical-padding"></div>
            <div className="review-container">
              {movie.reviews.map((review) => (
                <div className="review" key={review._id}>
                  <p className="green">
                    {review.username}:{" "}
                    {review.upvotes > 0 &&
                    review.upvoted_by.includes(props._id as string) ? (
                      <button
                        className="button-upvote"
                        onClick={() => upvoteReview(review, -1)}
                      >
                        <ThumbUpIcon
                          className="upvote-selected"
                          fontSize="small"
                        />
                      </button>
                    ) : (
                      <button
                        className="button-upvote"
                        onClick={() => upvoteReview(review, 1)}
                      >
                        <ThumbUpIcon className="upvote" fontSize="small" />
                      </button>
                    )}
                    <span className="white margin-left">{review.upvotes}</span>
                    {review.username === props.username && (
                      <span className="float-right inline-flex">
                        <Tooltip title="Edit Review">
                          <button
                            className="button-review-icon"
                            onClick={() => editReview(review)}
                          >
                            <EditIcon fontSize="small" />
                          </button>
                        </Tooltip>
                        <Tooltip title="Delete Review">
                          <button
                            className="button-review-icon"
                            onClick={() => setDeleteReviewOpen(true)}
                          >
                            <CloseIcon fontSize="small" />
                          </button>
                        </Tooltip>
                        <DeleteReview
                          open={deleteReviewOpen}
                          closeDialog={() => setDeleteReviewOpen(false)}
                          handleSubmit={() => deleteReview(review)}
                        />
                      </span>
                    )}
                  </p>
                  <p>{review.review}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="vertical-padding"></div>
    </div>
  );
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UnconnectedMovieRatings);
