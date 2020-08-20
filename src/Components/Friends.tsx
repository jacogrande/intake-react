import React from "react";
import SearchIcon from "@material-ui/icons/Search";
import { IFriends } from "../redux/modules/user";
import AccountBoxIcon from "@material-ui/icons/AccountBox";
import CameraRollIcon from "@material-ui/icons/CameraRoll";
import { addFriend } from "../redux/modules/user";

import { RootState } from "../redux";
import { connect } from "react-redux";
import { Dispatch, bindActionCreators } from "redux";
import { loadProfile } from "../redux/modules/explore";
import { Tooltip } from "@material-ui/core";
import { NavLink } from "react-router-dom";

const mapStateToProps = (state: RootState) => ({
  friends: state.user.friends,
  friend_requests: state.user.friend_requests,
});

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators({ loadProfile, addFriend }, dispatch);

type IMappedProps = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

interface IUnconnectedFriends extends IMappedProps {
  closeDrawer: () => void;
}

/**
 * Component that renders a drawer containing a list of the current user's friends
 * @param props props taken from redux store.
 * @param {()=>void} closeDrawer function to close friends drawer
 */
const UnconnectedFriends = (props: IUnconnectedFriends) => {
  const [search, setSearch] = React.useState<string>("");
  const [friendResults, setFriendResults] = React.useState<IFriends[]>(
    props.friends || []
  );

  React.useEffect(() => {
    setFriendResults(
      props.friends.filter((friend) => friend.username.includes(search))
    );
  }, [props.friends]);

  // handle friend searching
  const handleSubmit = async (e: any): Promise<void> => {
    e.preventDefault();
    setFriendResults(
      [...props.friends].filter((friend) => friend.username.includes(search))
    );
  };

  // handle friend requests
  let requestContent;
  if (props.friend_requests.length > 0) {
    // function that accepts a friend request through an api call
    const acceptRequest = async (user: IFriends) => {
      props.addFriend(user);
      const response = await fetch("/api/friends/acceptFriendRequest", {
        method: "post",
        body: JSON.stringify({ id: user._id }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      switch (response.status) {
        case 200:
          console.log("success");
          break;
        default:
          console.log("error");
      }
    };
    requestContent = (
      <>
        <div className="drawer-header">
          <h2>Friend Requests</h2>
        </div>
        <div className="drawer-body">
          {props.friend_requests.map((user, i) => (
            <div
              className={`friend-grid ${i % 2 === 0 && "background-dark"}`}
              key={user.username}
            >
              <NavLink
                onClick={() => props.loadProfile(user._id)}
                to={`/explore/user/${user._id}`}
              >
                <div className="identicon-wrapper-small">
                  <svg className="avatar-small">
                    {user.avatar?.tilemap.map((row, y) =>
                      row.map((col, x) => (
                        <rect
                          x={x * 17}
                          y={y * 17}
                          width={17}
                          height={17}
                          style={{
                            fill:
                              user.avatar?.tilemap[y][x] === 1
                                ? user.avatar?.color
                                : "#101518",
                          }}
                          key={`${x}-${y}-rect`}
                        ></rect>
                      ))
                    )}
                  </svg>
                </div>
              </NavLink>
              <div className="username-title-small">
                <p>{user.username}</p>
              </div>
              <div className="username-title-small">
                <Tooltip title="Friends">
                  <p className="inline-flex text-small">
                    <AccountBoxIcon /> {user.friends.length}
                  </p>
                </Tooltip>
                <span className="horizontal-padding"> </span>
                <Tooltip title="Movies" className="margin-left">
                  <p className="inline-flex text-small margin-left-x">
                    <CameraRollIcon /> {user.friends.length}
                  </p>
                </Tooltip>
              </div>
              <span> </span>
              <div className="text-right">
                <button
                  type="button"
                  className="button-cancel margin-right friend-button"
                >
                  Decline
                </button>
              </div>
              <button
                type="submit"
                className="button-submit friend-button"
                onClick={() => acceptRequest(user)}
              >
                Accept
              </button>
            </div>
          ))}
        </div>
      </>
    );
  }
  return (
    <div className="drawer-content">
      {props.friend_requests && requestContent}
      <div className="drawer-header">
        <h2>Friends</h2>
      </div>
      <div className="drawer-body">
        <form autoComplete="off" onSubmit={handleSubmit}>
          <div className="inline-flex full-width">
            <SearchIcon />
            <input
              type="text"
              aria-labelledby="movieSearchLabel"
              placeholder="Search"
              className="full-width"
              id="searchInput"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="button-submit float-right margin-top"
          >
            Search
          </button>
        </form>
        {friendResults.map((user, i) => (
          <NavLink
            onClick={() => props.loadProfile(user._id)}
            to={`/explore/user/${user._id}`}
            className={`friend-grid ${i % 2 === 0 && "background-dark"}`}
            key={user.username}
          >
            <div className="identicon-wrapper-small">
              <svg className="avatar-small">
                {user.avatar?.tilemap.map((row, y) =>
                  row.map((col, x) => (
                    <rect
                      x={x * 17}
                      y={y * 17}
                      width={17}
                      height={17}
                      style={{
                        fill:
                          user.avatar?.tilemap[y][x] === 1
                            ? user.avatar?.color
                            : "#101518",
                      }}
                      key={`${x}-${y}-rect`}
                    ></rect>
                  ))
                )}
              </svg>
            </div>
            <div className="username-title-small">
              <p>{user.username}</p>
            </div>
            <div className="username-title-small">
              <Tooltip title="Friends">
                <p className="inline-flex text-small">
                  <AccountBoxIcon /> {user.friends.length}
                </p>
              </Tooltip>
              <span className="horizontal-padding"> </span>
              <Tooltip title="Movies" className="margin-left">
                <p className="inline-flex text-small margin-left-x">
                  <CameraRollIcon /> {user.friends.length}
                </p>
              </Tooltip>
            </div>
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(UnconnectedFriends);
