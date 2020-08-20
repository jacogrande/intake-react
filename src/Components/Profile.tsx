import React from "react";
import { RootState } from "../redux";
import { connect } from "react-redux";
import AccountBoxIcon from "@material-ui/icons/AccountBox";
import TheatersIcon from "@material-ui/icons/Theaters";
import SettingsIcon from "@material-ui/icons/Settings";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import Logout from "./Logout";
import DeleteAccount from "./DeleteAccount";
import Friends from "./Friends";
import MetaTags from "react-meta-tags";

import "../Styles/Profile.css";
import { Tooltip, Drawer } from "@material-ui/core";
import { NavLink } from "react-router-dom";
import Feed from "./ProfileFeed";
import { IMovieData } from "../redux/modules/movies";

const mapStateToProps = (state: RootState) => ({
  username: state.user.username,
  avatar: state.user.avatar,
  friends: state.user.friends,
  reviews: state.user.reviews,
  movies: state.movies.movies,
  friend_requests: state.user.friend_requests,
  favorite_movie: state.user.favorite_movie
});

type IProfile = ReturnType<typeof mapStateToProps>;

/**
 * Profile component that renders the logged in user's profile, including friends and feed.
 * @param props props taken from user redux store
 */
const UnconnectedProfile = (props: IProfile) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [openLogoutDialog, setOpenLogoutDialog] = React.useState<boolean>(
    false
  );
  const [openDeleteDialog, setOpenDeleteDialog] = React.useState<boolean>(
    false
  );
  const [openDrawer, setOpenDrawer] = React.useState<boolean>(false);
  const [section, setSection] = React.useState<string>("feed");

  return (
    <div className="Profile margin-top">
      <MetaTags>
        <title>Your Intake profile. | Intake</title>
        <meta name="description" content="See your feed, friends, and more at your Intake profile page." />
      </MetaTags>
      <div className="banner-container">
        <div className="identicon-wrapper float-left">
          <svg className="avatar">
            {props.avatar?.tilemap.map((row, y) =>
              row.map((col, x) => (
                <rect
                  x={x * 25}
                  y={y * 25}
                  width={25}
                  height={25}
                  style={{
                    fill:
                      props.avatar?.tilemap[y][x] === 1
                        ? props.avatar?.color
                        : "#171e22",
                  }}
                  key={`${x}-${y}-rect`}
                ></rect>
              ))
            )}
          </svg>
        </div>
        <div className="username-title float-left">
          <h1>{props.username}</h1>
        </div>
        <div className="username-title float-right inline-flex">
          {props.friend_requests.length > 0 && (
            <span className="profile-alert">{props.friend_requests.length}</span>
          )}
          <Tooltip title="Friends">
            <button
              type="button"
              aria-label="Friends Link"
              className="hover-green button-icon"
              onClick={() => setOpenDrawer(true)}
            >
              <p className="inline-flex text-small">
                <AccountBoxIcon /> {props.friends?.length}
              </p>
            </button>
          </Tooltip>
          <Tooltip title="Movies" className="margin-left">
            <NavLink
              to="/movies"
              aria-label="Movies Link"
              className="hover-green link true-white text-small button-icon"
            >
              <p className="inline-flex text-small">
                <TheatersIcon /> {props.movies?.length}
              </p>
            </NavLink>
          </Tooltip>
          <Tooltip title="Settings" className="margin-left">
            <button
              type="button"
              aria-label="Account Settings Link"
              className="hover-green button-icon"
              onClick={(e) => setAnchorEl(e.currentTarget)}
              aria-controls="profile-menu"
              aria-haspopup="true"
            >
              <SettingsIcon />
            </button>
          </Tooltip>
          <Menu
            id="profile-menu"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
          >
            <MenuItem onClick={() => setOpenLogoutDialog(true)}>Logout</MenuItem>
            <MenuItem className="red" onClick={() => setOpenDeleteDialog(true)}>
              Delete Account
            </MenuItem>
          </Menu>
          <DeleteAccount
            open={openDeleteDialog}
            closeDialog={() => setOpenDeleteDialog(false)}
          />
          <Logout
            open={openLogoutDialog}
            closeDialog={() => setOpenLogoutDialog(false)}
          />
          <Drawer
            className="drawer"
            open={openDrawer}
            anchor="right"
            onClose={() => setOpenDrawer(false)}
          >
            <Friends closeDrawer={() => setOpenDrawer(false)} />
          </Drawer>
        </div>
      </div>
      <div className="profile-container margin-top">
        {/* {section === "favorite" && <FavoriteMovie user={props.currentUser} />} */}
        {section === "feed" && <Feed exploreMovies={props.movies as IMovieData[]} />} 
      </div>
    </div>
  );
};

export default connect(mapStateToProps)(UnconnectedProfile);
