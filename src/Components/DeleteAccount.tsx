import React from "react";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import "../Styles/Movies.css"

import { RootState } from "../redux";
import { logout } from "../redux/modules/user";
import { connect } from "react-redux";

const mapStateToProps = (state: RootState) => ({
  username: state.user.username
});

const mapDispatchToProps = {logout}

type IDeleteAccountDispatch = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

interface IDeleteAccount extends IDeleteAccountDispatch {
  open: boolean;
  closeDialog: () => void;
}

/**
 * Dialog popup to confirm account deletion
 * @param {IDeleteAccount} props component properties taken from redux store.
 * @param {boolean} props.open boolean value that opens and closes the dialog
 * @param {()=>void} props.closeDialog function that closes the delete account dialog when called
 */
const UnconnectedDeleteAccount = (props: IDeleteAccount) => {

  /**
   * Function to handle form submission and subsequent api request
   */
  const handleSubmit=async (): Promise<void>=>{
    // make api call
    const response = await fetch("/api/user/delete", {method:"delete"});
    switch(response.status){
      case 200:
        props.closeDialog();
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
      <DialogTitle id="dialog-title">{"Delete your Intake account?"}</DialogTitle>
      <DialogContent>
        <DialogContentText id="dialog-description">
          Deleting your account will result in all of your entered movie data being permanently deleted from our database.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <button onClick={props.closeDialog} className="button-cancel">
          Cancel
        </button>
        <button type="submit" onClick={handleSubmit} className="button-submit">
          Delete Account
        </button>
      </DialogActions>
    </Dialog>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(UnconnectedDeleteAccount);
