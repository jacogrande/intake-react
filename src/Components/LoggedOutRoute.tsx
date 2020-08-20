import React from "react";
import { RouteProps, Route, Redirect } from "react-router-dom";

import { RootState } from "../redux";
import { connect } from "react-redux";

interface ILoggedOutRoute extends RouteProps {
  redirect?: string
}

const mapStateToProps = (state: RootState) => ({
  username: state.user.username
})

type Props = ReturnType<typeof mapStateToProps> & ILoggedOutRoute;

/**
 * 
 * @param {Props} props component props taken from redux store
 * @param {string} props.username current user's username
 * @param {string} [props.redirect] redirect route in case of log out failure
 */
const UnconnectedLoggedOutRoute = (props: Props) => {
  if(!props.username) {
    return <Route {...props} />
  }
  else {
    return props.redirect ? <Redirect to={props.redirect} /> : <Redirect to="/" />
  }
}

export default connect(mapStateToProps)(UnconnectedLoggedOutRoute);