import React from "react";
import Jumbotron from "./Jumbotron";
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import CheckCircleOutlineIcon from "@material-ui/icons/CheckCircleOutline";
import MetaTags from "react-meta-tags";

const LandingPage = () => (
  <div className="text-centered">
    <MetaTags>
      <title>
        Welcome to Intake. Log movies you watch - get personalized statistics. |
        INTAKE
      </title>
      <meta
        name="description"
        content="Intake is a tool that tracks media consumption. Add movies to your feed, rate them using our one-of-a-kind rating system, and see personalized statistics based on the movies you watch. Explore what the most popular movies on Intake are, and find new friends with similar viewing tastes."
      />
    </MetaTags>
    <div className="jumbotron-filler"></div>
    <div className="z-indexed">
      <a className="button-icon white" type="button" href="/#purpose">
        <KeyboardArrowDownIcon />
      </a>
      <div className="grid">
        <div id="purpose" className="landing-entry">
          <h2>Mission</h2>
          <p className="text-left indented">
            Intake is a tool created to track media consumption. Add movies to
            your feed, rate them, review them, and then learn more about your
            tastes through the use of our built-in viewing statistics.
          </p>
        </div>
        <div className=" landing-entry">
          <h2>Rating Movies</h2>
          <p className="text-left indented">
            Intake stands out for the unique criteria that makes up its rating
            system. Each of the following categories is rated between 0 and 5:
          </p>
          <p className="text-left">
            <b className="green">
              <CheckCircleOutlineIcon className="landing-icon" /> Entertainment:{" "}
            </b>
            How fun was the movie?
          </p>
          <p className="text-left">
            <b className="green">
              <CheckCircleOutlineIcon className="landing-icon" /> Writing:{" "}
            </b>
            How strong was the plot? How about the characters?
          </p>
          <p className="text-left">
            <b className="green">
              <CheckCircleOutlineIcon className="landing-icon" /> Style:{" "}
            </b>{" "}
            Did the movie have a consistent and evocative style? How interesting
            was the cinematography?
          </p>
          <p className="text-left">
            <b className="green">
              <CheckCircleOutlineIcon className="landing-icon" /> Bias:{" "}
            </b>{" "}
            How would you, personally, rate this movie? Sometimes our favorite
            movies aren't the best movies, and sometimes the best movies aren't our favorite.
          </p>
        </div>
      </div>

      <Jumbotron />
    </div>
  </div>
);

export default LandingPage;
