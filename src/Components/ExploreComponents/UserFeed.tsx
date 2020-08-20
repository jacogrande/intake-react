import React from "react";
import { IFriends } from "../../redux/modules/user";
import { NavLink } from "react-router-dom";
import { Tooltip } from "@material-ui/core";
import AccountBoxIcon from "@material-ui/icons/AccountBox";
import PersonAddIcon from "@material-ui/icons/PersonAdd";
import TheatersIcon from "@material-ui/icons/Theaters";
import ChatBubbleIcon from "@material-ui/icons/ChatBubble";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import moment from "moment";
import Snackbar from "../Snackbar";

import { RootState } from "../../redux";
import { connect } from "react-redux";
import { Dispatch, bindActionCreators } from "redux";
import { loadProfile } from "../../redux/modules/explore";
import { addFriend } from "../../redux/modules/user";

const mapStateToProps = (state: RootState) => ({
  friends: state.user.friends,
  username: state.user.username,
});

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators({ loadProfile, addFriend }, dispatch);

type IMappedState = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

interface IUserFeed extends IMappedState {
  users: IFriends[];
}

/**
 * Component that renders a feed of the top users that match a search or filter criteria.
 * @param {IUserFeed} props Component props taken from redux store.
 * @param {IFriends[]} props.users List of users that match the filter criteria
 */
const UserFeed = (props: IUserFeed) => {
  const [addOpen, setAddOpen] = React.useState<boolean>(false);
  const [selectedUser, setSelectedUser] = React.useState<IFriends | null>(null);
  const [snackbarOpen, setSnackbarOpen] = React.useState<boolean>(false);
  const [errorMessage, setErrorMessage] = React.useState<string>('');
  const handleClose = () => {
    setAddOpen(false);
  };

  /**
   * Sends an api request to add the specified user as a friend
   * @param {IFriends} user User data to be passed to the api server 
   */
  const addFriend = async (user: IFriends) => {
    setErrorMessage('');
    const response = await fetch("/api/friends/addFriend", {
      method: "post",
      body: JSON.stringify({ id: user._id }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    switch (response.status) {
      case 200:
        props.addFriend(user);
        handleClose();
        setSnackbarOpen(true);
        break;
      default:
        const err = await response.json();
        handleClose();
        setErrorMessage(err.error);
        setSnackbarOpen(true);
    }
  };

  const handleAddFriend = (user: IFriends) => {
    setSelectedUser(user);
    setAddOpen(true);
  };

  return (
    <div className="user-feed">
      {props.users.map((user) => {
        const isFriend = props.friends.find(
          (friend) => user && friend.username === user.username
        );
        return (
          <div
            className={
              !isFriend && props.username !== user.username
                ? "user-container"
                : "user-container-friend"
            }
            key={user.username}
          >
            <NavLink
              onClick={() => props.loadProfile(user._id)}
              to={`/explore/user/${user._id}`}
            >
              <div className="identicon-wrapper">
                <svg className="avatar">
                  {user.avatar?.tilemap.map((row, y) =>
                    row.map((col, x) => (
                      <rect
                        x={x * 25}
                        y={y * 25}
                        width={25}
                        height={25}
                        style={{
                          fill:
                            user.avatar?.tilemap[y][x] === 1
                              ? user.avatar?.color
                              : "#171e22",
                        }}
                        key={`${x}-${y}-rect`}
                      ></rect>
                    ))
                  )}
                </svg>
              </div>
            </NavLink>
            <NavLink
              onClick={() => props.loadProfile(user._id)}
              to={`/explore/user/${user._id}`}
              className="link white hover-green"
            >
              <h2 className="username">
                {user.username}{" "}
                <p className="italics text-small grey">
                  User since{" "}
                  {moment(user.date_registered).format("MMM DD, YYYY")}
                </p>
              </h2>
            </NavLink>
            <div className="icons">
              {props.username && !isFriend && props.username !== user.username && (
                <>
                  <Tooltip title="Add Friend" className="icon">
                    <p className="text-small">
                      <button
                        type="button"
                        aria-label="Add Friend Link"
                        className="hover-green button-icon"
                        onClick={() => handleAddFriend(user)}
                        aria-controls="add-friend-dialog"
                        aria-haspopup="true"
                      >
                        <PersonAddIcon />
                      </button>
                    </p>
                  </Tooltip>
                </>
              )}
              <Tooltip title="Friends" className="icon">
                <p className="text-small">
                  <AccountBoxIcon /> {user.friends.length}
                </p>
              </Tooltip>
              <Tooltip title="Movies" className="icon">
                <p className="text-small">
                  <TheatersIcon /> {user.movies.length}
                </p>
              </Tooltip>
              <Tooltip title="Reviews" className="icon">
                <p className="text-small">
                  <ChatBubbleIcon /> {user.reviews.length}
                </p>
              </Tooltip>
            </div>
          </div>
        );
      })}
      <Dialog
        open={addOpen}
        onClose={handleClose}
        aria-labelledby="add-friend-title"
        aria-describedby="add-friend-description"
        id="add-friend-dialog"
      >
        <DialogTitle id="add-friend-title">{`Add  ${selectedUser?.username} as a friend?`}</DialogTitle>
        <DialogContent>
          <DialogContentText id="add-friend-description">
            Once {selectedUser?.username} accepts your friend request, their
            movie ratings and reviews will be added to your explore feed.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <button className="button-cancel" onClick={handleClose}>
            Cancel
          </button>
          <button
            className="button-submit"
            onClick={() => addFriend(selectedUser as IFriends)}
          >
            Add Friend
          </button>
        </DialogActions>
      </Dialog>
      <Snackbar error={errorMessage} success="Friend request sent" handleClose={()=>setSnackbarOpen(false)} open={snackbarOpen} />
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(UserFeed);
