import React from "react";
import UserFeed from "./UserFeed";
import SearchIcon from "@material-ui/icons/Search";

import { RootState } from "../../redux";
import { setTopUsers, setFilter, setSearch } from "../../redux/modules/explore";
import { connect } from "react-redux";
import { Dispatch, bindActionCreators } from "redux";
import { IFriends } from "../../redux/modules/user";

const mapStateToProps = (state: RootState) => ({
  topUsersByMovies: state.explore.topUsersByMovies,
  topUsersByFriends: state.explore.topUsersByFriends,
  topUsersByReviews: state.explore.topUsersByReviews,
  topUsersByDateAddedOldest: state.explore.topUsersByDateAddedOldest,
  topUsersByDateAddedNewest: state.explore.topUsersByDateAddedNewest,
  filter: state.explore.filter,
  search: state.explore.search,
  searchResults: state.explore.searchResults
});

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators({ setTopUsers, setFilter, setSearch }, dispatch);

type IUsers = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

  /**
   * Users component renders a container for the user feed.
   * @param {IUsers} props Component props taken from redux store.
   */
const Users = (props: IUsers) => {
  const [users, setUsers] = React.useState<IFriends[]>([]);

  // Whenever the filter is changed, get the top users based on that filter
  React.useEffect(() => {
    switch (props.filter) {
      case "movies":
        if (!props.topUsersByMovies) props.setTopUsers("movies");
        break;
      case "friends":
        if (!props.topUsersByFriends) props.setTopUsers("friends");
        break;
      case "reviews":
        if (!props.topUsersByReviews) props.setTopUsers("reviews");
        break;
      case "date_added_oldest":
        if (!props.topUsersByDateAddedOldest)
          props.setTopUsers("date_added_oldest");
        break;
      case "date_added_newest":
        if (!props.topUsersByDateAddedNewest)
          props.setTopUsers("date_added_newest");
        break;
    }
  }, [props.filter]);

  React.useEffect(() => {
    switch (props.filter) {
      case "movies":
        props.topUsersByMovies && setUsers(props.topUsersByMovies);
        break;
      case "friends":
        props.topUsersByFriends && setUsers(props.topUsersByFriends);
        break;
      case "reviews":
        props.topUsersByReviews && setUsers(props.topUsersByReviews);
        break;
      case "date_added_oldest":
        props.topUsersByDateAddedOldest &&
          setUsers(props.topUsersByDateAddedOldest);
        break;
      case "date_added_newest":
        props.topUsersByDateAddedNewest &&
          setUsers(props.topUsersByDateAddedNewest);
        break;
    }
    if(props.search) {
      setUsers(props.searchResults);
    }
  }, [props]);

  return (
    <div className="profile-container">
      <div className="two-col-grid margin-top">
        <form onSubmit={(e) => e.preventDefault()} className="align-right">
          <select
            aria-label="user filter"
            value={props.filter}
            onChange={(e) => props.setFilter(e.target.value)}
            className="float-right margin-top explore-select"
          >
            <option value="movies">Movies Seen</option>
            <option value="friends">Friends</option>
            <option value="reviews">Reviews</option>
            <option value="date_added_oldest">Date Registered (Oldest)</option>
            <option value="date_added_newest">Date Registered (Newest)</option>
          </select>
        </form>
        <form onSubmit={(e) => e.preventDefault()} className="align-left bump-down-form">
          <div className="inline-flex">
            <SearchIcon className="form-icon" />
            <input
              type="text"
              value={props.search}
              onChange={(e) => props.setSearch(e.target.value)}
              placeholder="Search"
              className="explore-input"
            />
          </div>
        </form>
      </div>
      <UserFeed users={users} />
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Users);
