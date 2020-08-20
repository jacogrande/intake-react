import React from "react";
import CircularProgress from "@material-ui/core/CircularProgress";
import Backdrop from "@material-ui/core/Backdrop";

const Loading = () => (
  <Backdrop open={true}>
    <CircularProgress color="inherit" className="loading-icon" />
  </Backdrop>
);

export default Loading;