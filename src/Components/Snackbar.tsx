import React from "react";
import Snackbar from "@material-ui/core/Snackbar";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";

interface ISnackbar {
  error?: string;
  success: string;
  handleClose: () => void,
  open: boolean;
}

/**
 * 
 * @param props Component properties
 * @param {string} [props.error] An optional error message
 * @param {string} props.success The message to be displayed
 * @param {()=>void} props.handleClose function to close the snackbar
 * @param {boolean} props.open boolean that determines if the snackbar is open
 */
const SnackbarComponent = (props: ISnackbar) => {
  return (
    <Snackbar
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
      open={props.open}
      autoHideDuration={6000}
      onClose={props.handleClose}
      message={props.error ? props.error : props.success}
      action={
        <React.Fragment>
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={props.handleClose}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </React.Fragment>
      }
    />
  );
};

export default SnackbarComponent;