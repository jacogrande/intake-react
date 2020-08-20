import React from "react";
import { useParams } from "react-router-dom";
import "../Styles/Profile.css";
import "../Styles/Explore.css";
import "../Styles/ExplorePhone.css";
import ViewProfile from "./ExploreComponents/ViewProfile";
import Users from "./ExploreComponents/Users";
import Feed from "./ExploreComponents/Feed";
import TopMovies from "./ExploreComponents/TopMovies";
import MetaTags from "react-meta-tags";

import { RootState } from "../redux";
import { connect } from "react-redux";

const mapStateToProps = (state: RootState) => ({
  username: state.user.username,
});

type Props = ReturnType<typeof mapStateToProps>;

/**
 * Container for the explore section
 * @param {Props} props Component properties taken from redux store
 */
const Explore = (props: Props) => {
  const [section, setSection] = React.useState<"movies" | "users" | "feed">(
    props.username ? "feed" : "movies"
  );
  
  // check if the current route should lead to a user's profile page
  const { type, id } = useParams();
  if (type) {
    switch (type) {
      case "user":
        if (id) return <ViewProfile />;
    }
  }
  return (
    <div className="Explore margin-top">
      <MetaTags>
        <title>Explore the Intake community | INTAKE</title>
        <meta name="description" content="Explore what the Intake community has been up to. See friends' feeds and top rated movies, and find new friends." />
      </MetaTags>
      <h1>Explore</h1>
      <div className="explore-nav-container">
        <nav className="explore-nav">
          {props.username && (
            <button
              className={`button-icon margin-right ${
                section === "feed" && "green"
              }`}
              onClick={() => setSection("feed")}
            >
              Feed
            </button>
          )}

          <button
            className={`button-icon margin-right ${
              section === "movies" && "green"
            }`}
            onClick={() => setSection("movies")}
          >
            Movies
          </button>
          <button
            className={`button-icon margin-right margin-left ${
              section === "users" && "green"
            }`}
            onClick={() => setSection("users")}
          >
            Users
          </button>
        </nav>
      </div>

      {/* conditionally render sectional components */}
      {section === "users" && <Users />}
      {section === "movies" && <TopMovies />}
      {section === "feed" && props.username && <Feed />}
    </div>
  );
};

export default connect(mapStateToProps)(Explore);
