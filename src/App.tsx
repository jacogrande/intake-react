import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { bindActionCreators, Dispatch } from "redux";

import "./Styles/Positions.css";
import "./Styles/Elements.css";
import "./Styles/App.css";
import "./Styles/AppPhone.css";
import Header from "./Components/Header";
import Movies from "./Components/Movies";
import Stats from "./Components/Stats";
import MovieRatings from "./Components/MovieRatings";
import Login from "./Components/Login";
import CreateAccount from "./Components/CreateAccount";
import Profile from "./Components/Profile";
import ResetPassword from "./Components/ResetPassword";
import Explore from "./Components/Explore";
import StatProperty from "./Components/StatProperty";
import Loading from "./Components/Loading";
import ProtectedRoute from "./Components/ProtectedRoute";
import LoggedOutRoute from "./Components/LoggedOutRoute";
import LandingPage from "./Components/LandingPage";
import Verify from "./Components/Verify";

import { RootState } from "./redux";
import { connect } from "react-redux";
import { checkSessionLogin } from "./redux/modules/user";
import { loadMovies } from "./redux/modules/movies";

const mapStateToProps = (state: RootState) => ({
  username: state.user.username,
  movies: state.movies.movies,
  guest: state.user.guest,
});

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators({ checkSessionLogin, loadMovies }, dispatch);

type IApp = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

const UnconnectedApp: React.FC<IApp> = ({
  username,
  guest,
  checkSessionLogin,
  loadMovies,
  movies,
}) => {
  if (!username && !guest) {
    checkSessionLogin();
    return <Loading />;
  }
  if (!movies && username) {
    loadMovies();
    return <Loading />;
  }

  return (
    <div className="App">
      <Router>
        <Header />
        <Switch>
          {/* Movie Routes */}
          <ProtectedRoute path="/movies/:id" render={() => <MovieRatings />} />
          <ProtectedRoute path="/movies" render={() => <Movies />} />
          {/* Stats Route */}
          <ProtectedRoute path="/stats/:property/:value" component={Stats} />
          <ProtectedRoute path="/stats/:title" component={StatProperty} />
          <ProtectedRoute path="/stats" component={Stats} />
          {/* Login Route */}
          <LoggedOutRoute path="/login" component={Login} />
          <LoggedOutRoute path="/verify/:token" component={Verify} />
          <LoggedOutRoute path="/verify" component={Verify} />
          <LoggedOutRoute path="/createAccount" component={CreateAccount} />
          <LoggedOutRoute
            path="/resetPassword/:id/:token"
            component={ResetPassword}
          />
          <LoggedOutRoute path="/resetPassword" component={ResetPassword} />
          {/* Profile Route */}
          <ProtectedRoute path="/profile" component={Profile} />
          {/* Explore Route */}
          <Route path="/explore/:type/:id" component={Explore} />
          <Route path="/explore/" component={Explore} />
          {/* verofy */}
          {/* Home Route */}
          <Route path="/">
            <LandingPage />
          </Route>
        </Switch>
        <div className="footer">© JACKSON PROWELL</div>
      </Router>
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(UnconnectedApp);
