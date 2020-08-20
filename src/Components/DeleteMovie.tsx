import React from "react";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import "../Styles/Movies.css";

import { RootState } from "../redux";
import { loadMovies } from "../redux/modules/movies";
import { connect } from "react-redux";
import { Dispatch, bindActionCreators } from "redux";

const mapStateToProps = (state: RootState) => ({
  movies: state.movies.movies,
});

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators({ loadMovies }, dispatch);

type IDeleteMovieDispatch = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

interface IDeleteMovie extends IDeleteMovieDispatch {
  open: boolean;
  closeDialog: () => void;
  id: string;
}

/**
 * Dialog popup component for deleting movies
 * @param {ICopyMovie} props component properties taken from redux store.
 * @param {boolean} props.open boolean value that opens and closes the dialog
 * @param {()=>void} props.closeDialog function that closes the delete movie dialog when called
 * @param {string} props.id the movie id
 */
const UnconnectedDeleteMovie = (props: IDeleteMovie) => {
  /**
   * Function to handle form submission and subsequent api request
   */
  const handleSubmit = async (): Promise<void> => {
    // make api request
    const response = await fetch(`/api/movies/${props.id}`, {
      method: "delete",
    });
    switch (response.status) {
      case 200:
        props.loadMovies();
        props.closeDialog();
        break;
      case 401:
        console.log("error");
        break;
      default:
        console.log("unknown error");
    }
  };

  return (
    <Dialog
      open={props.open}
      onClose={props.closeDialog}
      aria-labelledby="dialog-title"
      aria-describedby="dialog-description"
      className="dialog"
    >
      <DialogTitle id="dialog-title">{"Delete Movie?"}</DialogTitle>
      <DialogContent>
        <DialogContentText id="dialog-description">
          Deleting this movie from your Intake will result in all of your
          inputted data (including ratings, themes, and reviews) being
          permanently removed from our database.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <button onClick={props.closeDialog} className="button-cancel">
          Cancel
        </button>
        <button type="submit" onClick={handleSubmit} className="button-submit">
          Delete
        </button>
      </DialogActions>
    </Dialog>
  );
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UnconnectedDeleteMovie);
