import React from "react";
import { NavLink, useLocation } from "react-router-dom";

import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Tooltip from "@material-ui/core/Tooltip";
import IconButton from "@material-ui/core/IconButton";
import Drawer from "@material-ui/core/Drawer";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import InfoIcon from "@material-ui/icons/Info";
import TheatersIcon from "@material-ui/icons/Theaters";
import ExploreIcon from "@material-ui/icons/Explore";
import BarChartIcon from "@material-ui/icons/BarChart";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";

import MenuIcon from "@material-ui/icons/Menu";
import AddMovieDrawer from "./AddMovieDrawer";
import "../Styles/Header.css";
import "../Styles/Drawer.css";
import "../Styles/DrawerPhone.css";

import { MobileView, BrowserView } from "react-device-detect";

import { RootState } from "../redux";
import { connect } from "react-redux";

const mapStateToProps = (state: RootState) => ({
  username: state.user.username,
  friend_requests: state.user.friend_requests,
});

type IHeader = ReturnType<typeof mapStateToProps>;

/**
 * Header navigation component
 * @param {string} username The current user's username (taken from redux store)
 * @param {IFriends[]} friend_requests An array of users who have sent the current user friend requests
 */
const UnconnectedHeader: React.FC<IHeader> = ({
  username,
  friend_requests,
}) => {
  const [open, setOpen] = React.useState<boolean>(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClose = () => {
    setAnchorEl(null);
  };

  const openDrawer = (): void => {
    setOpen(true);
  };

  const closeDrawer = (): void => {
    setOpen(false);
  };

  const landing = useLocation().pathname === "/";

  const loggedInHeader = (
    <>
      <NavLink to="/movies" className="header-link" activeClassName="active">
        MOVIES
      </NavLink>
      <NavLink to="/stats" className="header-link" activeClassName="active">
        STATS
      </NavLink>
      <NavLink to="/explore" className="header-link" activeClassName="active">
        EXPLORE
      </NavLink>
      <NavLink to="/profile" className="header-link" activeClassName="active">
        PROFILE
      </NavLink>
      {friend_requests.length > 0 && (
        <span className="alert">{friend_requests.length}</span>
      )}
      <Tooltip title="Add Movie" aria-label="add_movie" id="add_movie">
        <button
          className={
            landing
              ? "header-link header-button-landing"
              : "header-link header-button"
          }
          aria-labelledby="add_movie"
          onClick={openDrawer}
        >
          +
        </button>
      </Tooltip>
    </>
  );

  const loggedOutHeader = (
    <>
      <NavLink to="/explore" className="header-link" activeClassName="active">
        EXPLORE
      </NavLink>
      <NavLink to="/login" className="header-link" activeClassName="active">
        LOGIN
      </NavLink>
    </>
  );

  const mobileLoggedOutHeader = [
    <MenuItem className="nav-item" key="explore-link">
      <NavLink onClick={handleClose} to="/explore" className="nav-link">
        <ExploreIcon className="landing-icon pink" /> Explore
      </NavLink>
    </MenuItem>,
    <MenuItem className="nav-item" key="login-link">
      <NavLink onClick={handleClose} to="/login" className="nav-link">
        <AccountCircleIcon className="landing-icon pink" /> Login
      </NavLink>
    </MenuItem>,
  ];

  const mobileLoggedInHeader = [
    <MenuItem className="nav-item" key="movie-link">
      <NavLink onClick={handleClose} to="/movies" className="nav-link">
        <TheatersIcon className="landing-icon pink" /> Movies
      </NavLink>
    </MenuItem>,
    <MenuItem className="nav-item" key="explore-link">
      <NavLink onClick={handleClose} to="/explore" className="nav-link">
        <ExploreIcon className="landing-icon pink" /> Explore
      </NavLink>
    </MenuItem>,
    <MenuItem className="nav-item" key="stats-link">
      <NavLink onClick={handleClose} to="/stats" className="nav-link">
        <BarChartIcon className="landing-icon pink" /> Stats
      </NavLink>
    </MenuItem>,
    <MenuItem className="nav-item" key="profile-link">
      <NavLink onClick={handleClose} to="/profile" className="nav-link">
        <AccountCircleIcon className="landing-icon pink" /> Profile
      </NavLink>
    </MenuItem>,
  ];

  return (
    <nav>
      <AppBar position="static">
        <Toolbar className={landing ? "navbar-landing" : "navbar"}>
          <h1 id="logo">INTAKE</h1>

          <BrowserView>
            <NavLink
              exact
              to="/"
              className="header-link"
              activeClassName="active"
            >
              ABOUT
            </NavLink>
            {username ? loggedInHeader : loggedOutHeader}
          </BrowserView>
          <MobileView>
            {username && (
              <button
                className={
                  landing
                    ? "header-link header-button-landing"
                    : "header-link header-button"
                }
                aria-labelledby="add_movie"
                onClick={openDrawer}
              >
                +
              </button>
            )}

            <IconButton
              edge="start"
              color="inherit"
              aria-label="see navigation menu"
              aria-controls="phone-menu"
              aria-haspopup="true"
              onClick={(e) => setAnchorEl(e.currentTarget)}
            >
              <MenuIcon fontSize="large" />
            </IconButton>
            <Menu
              id="phone-menu"
              anchorEl={anchorEl}
              keepMounted
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem className="nav-item">
                <NavLink onClick={handleClose} to="/" className="nav-link">
                  <InfoIcon className="landing-icon pink" /> About
                </NavLink>
              </MenuItem>
              {username ? mobileLoggedInHeader : mobileLoggedOutHeader}
            </Menu>
          </MobileView>
        </Toolbar>
      </AppBar>
      <Drawer
        className="drawer"
        open={open}
        anchor="right"
        onClose={closeDrawer}
      >
        <AddMovieDrawer closeDrawer={closeDrawer} />
      </Drawer>
    </nav>
  );
};

export default connect(mapStateToProps)(UnconnectedHeader);
