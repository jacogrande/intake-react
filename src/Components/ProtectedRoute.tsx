import React from "react";
import { RouteProps, Route, Redirect } from "react-router-dom";

import { RootState } from "../redux";
import { connect } from "react-redux";

interface IProtectedRoute extends RouteProps {
  redirect?: string
}

const mapStateToProps = (state: RootState) => ({
  username: state.user.username
})

type Props = ReturnType<typeof mapStateToProps> & IProtectedRoute;

/**
 * 
 * @param props username taken from user redux store
 * @param {string} [props.redirect] redirect link for users who aren't logged in
 */
const UnconnectedProtectedRoute = (props: Props) => {
  // if the user is logged in, render the requested page
  if(props.username) {
    return <Route {...props} />
  }
  // otherwise, redirect to the redirect link or to the login page
  else {
    return props.redirect ? <Redirect to={props.redirect} /> : <Redirect to="/login" />
  }
}

export default connect(mapStateToProps)(UnconnectedProtectedRoute);