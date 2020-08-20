import React from "react";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogTitle from "@material-ui/core/DialogTitle";
import "../Styles/Movies.css"

import { RootState } from "../redux";
import { logout } from "../redux/modules/user";
import {setMovies} from "../redux/modules/movies";
import { connect } from "react-redux";

const mapStateToProps = (state: RootState) => ({
  username: state.user.username
});

const mapDispatchToProps = {logout, setMovies}

type ILogoutDispatch = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

interface ILogout extends ILogoutDispatch {
  open: boolean;
  closeDialog: () => void;
}

/**
 * Dialog component that comfirms if a user would like to log out of their account
 * @param props Component properties taken from redux store and basic dialog props
 */
const UnconnectedLogout = (props: ILogout) => {

  // submission handler that sends a logout request to the api server
  const handleSubmit=async (): Promise<void>=>{
    const response = await fetch("/api/user/logout");
    switch(response.status){
      case 200:
        props.closeDialog();
        props.setMovies(null);
        props.logout();
        break;
      default:
        console.log('unknown error');
    }
  }

  return (
    <Dialog
      open={props.open}
      onClose={props.closeDialog}
      aria-labelledby="dialog-title"
      aria-describedby="dialog-description"
      className="dialog"
    >
      <DialogTitle id="dialog-title">{"Log out of Intake?"}</DialogTitle>
      <DialogActions>
        <button onClick={props.closeDialog} className="button-cancel">
          Cancel
        </button>
        <button type="submit" onClick={handleSubmit} className="button-submit">
          Logout
        </button>
      </DialogActions>
    </Dialog>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(UnconnectedLogout);
