import React from "react";
import { RootState } from "../../redux";
import { connect } from "react-redux";
import "../../Styles/Profile.css";
import "../../Styles/Poster.css";
import "../../Styles/Explore.css";
import "../../Styles/ExplorePhone.css";
import { useParams, Redirect } from "react-router-dom";
import { Dispatch, bindActionCreators } from "redux";
import AccountBoxIcon from "@material-ui/icons/AccountBox";
import TheatersIcon from "@material-ui/icons/Theaters";
import PersonAddIcon from "@material-ui/icons/PersonAdd";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Feed from "../ProfileFeed";
import MetaTags from "react-meta-tags";

import { loadProfile } from "../../redux/modules/explore";
import { addFriend } from "../../redux/modules/user";
import { Tooltip } from "@material-ui/core";
import { IFriends } from "../../redux/modules/user";

const FavoriteMovie = (props: { user: IFriends }) => {
  return (
    <div id="favorite-movie-containter">
      {props.user.favorite_movie ? (
        <p>yo</p>
      ) : (
        <div>
          <div className="vertical-padding"></div>
          <p className="italics">This user hasn't added a favorite movie.</p>
        </div>
      )}
    </div>
  );
};

const mapStateToProps = (state: RootState) => ({
  currentUser: state.explore.currentUser,
  friends: state.user.friends,
  username: state.user.username,
});

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators({ loadProfile, addFriend }, dispatch);

type IViewProfile = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

/**
 * Component that renders another users profile, including their all time feed.
 * @param {IViewProfile} props Component props taken from redux store.
 */
const ViewProfile = (props: IViewProfile) => {
  const [addOpen, setAddOpen] = React.useState<boolean>(false);
  const [section, setSection] = React.useState<"favorite" | "feed">("feed");

  const { id } = useParams();

  if (!props.currentUser) {
    props.loadProfile(id);
    return <p>loading</p>;
  }

  if (props.currentUser?.username === props.username) {
    console.log(props.currentUser);
    return <Redirect to="/profile" />;
  }

  const handleClose = () => {
    setAddOpen(false);
  };

  const addFriend = async () => {
    props.currentUser && props.addFriend(props.currentUser);
    console.log(id);
    const response = await fetch("/api/friends/addFriend", {
      method: "post",
      body: JSON.stringify({ id }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    switch (response.status) {
      case 200:
        handleClose();
        break;
      default:
        console.log("error!");
    }
  };

  return (
    <div className="Profile margin-top">
      <MetaTags>
        <title>See {props.currentUser.username}'s Intake | INTAKE</title>
        <meta
          name="description"
          content={`See ${props.currentUser.username}'s feed and friends. Add any movie that ${props.currentUser.username} and make a friend request if you like what you see so that their activity will show up in your feed.`}
        />
      </MetaTags>
      <div className="banner-container">
        <div className="identicon-wrapper float-left">
          <svg className="avatar">
            {props.currentUser.avatar?.tilemap.map((row, y) =>
              row.map((col, x) => (
                <rect
                  x={x * 25}
                  y={y * 25}
                  width={25}
                  height={25}
                  style={{
                    fill:
                      props.currentUser?.avatar?.tilemap[y][x] === 1
                        ? props.currentUser?.avatar?.color
                        : "#171e22",
                  }}
                  key={`${x}-${y}-rect`}
                ></rect>
              ))
            )}
          </svg>
        </div>
        <div className="username-title float-left">
          <h1>{props.currentUser.username}</h1>
        </div>
        <div
          className="username-title float-right inline-flex bump-up"
          id="profileButtons"
        >
          <Tooltip title="Friends">
            <p className="text-small">
              <AccountBoxIcon /> {props.currentUser.friends.length}
            </p>
          </Tooltip>
          <Tooltip title="Movies" className="margin-left">
            <p className="text-small">
              <TheatersIcon /> {props.currentUser.movies.length}
            </p>
          </Tooltip>
          {!props.friends.find(
            (friend) =>
              props.currentUser &&
              friend.username === props.currentUser.username
          ) &&
            props.username && (
              <>
                <Tooltip title="Add Friend" className="margin-left">
                  <button
                    type="button"
                    aria-label="Add Friend Link"
                    className="hover-green button-icon"
                    onClick={() => setAddOpen(true)}
                    aria-controls="add-friend-dialog"
                    aria-haspopup="true"
                  >
                    <PersonAddIcon />
                  </button>
                </Tooltip>
                <Dialog
                  open={addOpen}
                  onClose={handleClose}
                  aria-labelledby="add-friend-title"
                  aria-describedby="add-friend-description"
                  id="add-friend-dialog"
                >
                  <DialogTitle id="add-friend-title">{`Add ${props.currentUser.username} as a friend?`}</DialogTitle>
                  <DialogContent>
                    <DialogContentText id="add-friend-description">
                      Once {props.currentUser.username} accepts your friend
                      request, their movie ratings and reviews will be added to
                      your explore feed.
                    </DialogContentText>
                  </DialogContent>
                  <DialogActions>
                    <button className="button-cancel" onClick={handleClose}>
                      Cancel
                    </button>
                    <button className="button-submit" onClick={addFriend}>
                      Add Friend
                    </button>
                  </DialogActions>
                </Dialog>
              </>
            )}
        </div>
      </div>
      <div className="profile-container">
        {section === "favorite" && <FavoriteMovie user={props.currentUser} />}
        {section === "feed" && (
          <Feed exploreMovies={props.currentUser.movies} />
        )}
      </div>
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(ViewProfile);
