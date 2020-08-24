import React from "react";
import Pie from "./Charts/Pie";
import ViewingTimeline from "./Charts/ViewingTimeline";
import ReleaseTimeline from "./Charts/ReleaseTimeline";
import "../Styles/Stats.css";
import "../Styles/StatsPhone.css";
import { IMovieData } from "../redux/modules/movies";
import MetaTags from "react-meta-tags";

import { RootState } from "../redux";
import { loadMovies } from "../redux/modules/movies";
import { connect } from "react-redux";
import { Dispatch, bindActionCreators } from "redux";
import { useParams, NavLink, Link } from "react-router-dom";
import { PieDatum } from "@nivo/pie";
import {
  ISortedStat,
  IDict,
  setGenres,
  setThemes,
  setDatesAdded,
  setReleaseDates,
  setRatings,
  setContentRatings,
  IRatings,
} from "../redux/modules/stats";
import Breadcrumbs from "./Breadcrumbs";
import { BrowserView, isMobile } from "react-device-detect";
import LazyLoad from "react-lazyload";

export const Green = ["#E4FAF2", "#C4E3D8", "#A5CCBD", "#85B5A3", "#659E88"];
export const Pink = ["#FFDAF2", "#EEAED8", "#DD83BD", "#CC57A3", "#BB2B88"];

// color palettes for charts
export const colors = [
  ["#FCF2D5", "#F7CAC1", "#F2A2AD", "#ED7A99", "#E85285"],
  ["#538DEC", "#70A8ED", "#8DC3EF", "#A9DEF0", "#C6F9F1"],
  ["#EAFFF7", "#C8F3E5", "#A5E7D2", "#83DBC0", "#60CFAD"],
  ["#F9E3F1", "#F6C0E3", "#F49ED6", "#F17BC8", "#EE58BA"],
  ["#F6BD60", "#F7EDE2", "#F5CAC3", "#84A59D", "#F28482"],
  ["#ff9f1c", "#ffbf69", "#ffffff", "#cbf3f0", "#2ec4b6"],
  ["#d4e09b", "#f6f4d2", "#cbdfbd", "#f19c79", "#e6867a"],
  ["#7bdff2", "#b2f7ef", "#eff7f6", "#f7d6e0", "#f2b5d4"],
];

/**
 *
 * @param {ISortedStat[]} arr Array of values of the specified property
 * @param {number} total the sum of all the values of the specified property
 * @param colors array of colors
 */
export const formatPieData = (
  arr: ISortedStat[],
  total: number,
  colors: string[]
): PieDatum[] => {
  return arr.map((value, i) => ({
    id: value.key,
    label: value.key,
    value: value.count,
    color: value.color ? value.color : colors[i % colors.length],
    percentage: ((value.count / total) * 100).toLocaleString("fullwide", {
      maximumFractionDigits: 2,
    }),
  }));
};

const mapStateToProps = (state: RootState) => ({
  movies: state.movies.movies,
  genres: state.stats.genres,
  contentRatings: state.stats.contentRatings,
  datesAdded: state.stats.datesAdded,
  releaseDates: state.stats.releaseDates,
  themes: state.stats.themes,
  ratings: state.stats.ratings,
});

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      loadMovies,
      setGenres,
      setThemes,
      setDatesAdded,
      setReleaseDates,
      setRatings,
      setContentRatings,
    },
    dispatch
  );

type IStats = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

type properties =
  | "title"
  | "year"
  | "genres"
  | "director"
  | "writer"
  | "rated"
  | "plot"
  | "themes"
  | "date_added"
  | "runtime"
  | "poster"
  | "entertainment_rating"
  | "plot_rating"
  | "style_rating"
  | "bias_rating"
  | "total_rating";

/**
 * Function that sorts a dictionary of values
 * @param arr dictionary of values
 */
const sortStats = (arr: IDict): ISortedStat[] => {
  let topFive = [];
  for (let key in arr) {
    topFive.push({ key, count: arr[key] });
  }
  topFive.sort((a, b) => b.count - a.count);
  return topFive;
};

const otherStats: string[] = [
  "Genres",
  "Themes",
  "Directors",
  "Runtimes",
  "Writers",
  "Content Ratings",
];

const titleMapping: { [key: string]: string } = {
  genres: "Genres",
  themes: "Themes",
  ratings: "Ratings",
  director: "Directors",
  writer: "Writers",
  rated: "Content Ratings",
  runtime: "Runtimes",
  year: "Years",
};

/**
 * Statistic container component
 * @param props props taken from redux store
 */
const UnconnectedStats = (props: IStats) => {
  const { property, value }: { property: properties; value: any } = useParams();

  const [movieList, setMovieList] = React.useState<IMovieData[] | null>(null);
  const [themes, setThemes] = React.useState<ISortedStat[]>([]);
  const [ratings, setRatings] = React.useState<IRatings>({
    total: 0,
    others: [],
  });
  const [genres, setGenres] = React.useState<ISortedStat[]>([]);
  const [contentRatings, setContentRatings] = React.useState<ISortedStat[]>([]);
  const [datesAdded, setDatesAdded] = React.useState<string[]>([]);
  const [releaseDates, setReleaseDates] = React.useState<string[]>([]);

  // whenever the user's movies changes or the filter is changed, update the movie list
  React.useEffect(() => {
    if (props.movies) {
      if (property && value) {
        setMovieList(
          props.movies.filter((movie) => {
            const filter = movie[property];
            return !Array.isArray(filter)
              ? filter === value
              : filter.includes(value);
          })
        );
      } else {
        setMovieList(props.movies);
      }
    }
  }, [props.movies, value]);

  /**
   * Function that gathers movie statistics in hash maps.
   */
  const getStats = () => {
    const themeDict: IDict = {};
    let entertainment_average = 0;
    let plot_average = 0;
    let style_average = 0;
    let bias_average = 0;
    let total_average = 0;
    let divisor = movieList?.length;
    const dates: string[] = [];
    const datesReleased: string[] = [];
    const genreDict: IDict = {};
    const contentRatingsDict: IDict = {};
    movieList?.forEach((movie) => {
      movie.themes.forEach((theme) =>
        themeDict[theme] ? themeDict[theme]++ : (themeDict[theme] = 1)
      );
      movie.genres.forEach((genre) =>
        genreDict[genre] ? genreDict[genre]++ : (genreDict[genre] = 1)
      );
      entertainment_average += movie.entertainment_rating;
      plot_average += movie.plot_rating;
      style_average += movie.style_rating;
      bias_average += movie.bias_rating;
      total_average += movie.total_rating;
      contentRatingsDict[movie.rated]
        ? contentRatingsDict[movie.rated]++
        : (contentRatingsDict[movie.rated] = 1);
      dates.push(movie.date_added.date);
      datesReleased.push(movie.year);
    });
    const sortedThemes = sortStats(themeDict);
    setThemes(sortedThemes);
    if (divisor) {
      entertainment_average = entertainment_average / divisor;
      plot_average = plot_average / divisor;
      style_average = style_average / divisor;
      bias_average = bias_average / divisor;
      total_average = total_average / divisor;
    }
    const averagedRatings: IRatings = {
      total: Number(
        total_average.toLocaleString("fullwide", { maximumFractionDigits: 2 })
      ),
      others: [
        {
          key: "Entertainment",
          count: Number(
            entertainment_average.toLocaleString("fullwide", {
              maximumFractionDigits: 2,
            })
          ),
        },
        {
          key: "Writing",
          count: Number(
            plot_average.toLocaleString("fullwide", {
              maximumFractionDigits: 2,
            })
          ),
        },
        {
          key: "Style",
          count: Number(
            style_average.toLocaleString("fullwide", {
              maximumFractionDigits: 2,
            })
          ),
        },
        {
          key: "Bias",
          count: Number(
            bias_average.toLocaleString("fullwide", {
              maximumFractionDigits: 2,
            })
          ),
        },
      ],
    };
    setRatings(averagedRatings);
    const sortedGenres = sortStats(genreDict);
    setGenres(sortedGenres);
    const sortedContent = sortStats(contentRatingsDict);
    setContentRatings(sortedContent);
    setDatesAdded(dates);
    setReleaseDates(datesReleased);
    return {
      genres: sortedGenres,
      contentRatings: sortedContent,
      datesAdded: dates,
      releaseDates: datesReleased,
      themes: sortedThemes,
      ratings: averagedRatings,
    };
  };

  // Set stat states when the movies are loaded (check redux stores for stored state);
  React.useEffect(() => {
    if (movieList) {
      if (!property && !value) {
        if (
          !props.genres &&
          !props.contentRatings &&
          !props.datesAdded &&
          !props.ratings &&
          !props.releaseDates &&
          !props.themes
        ) {
          const sortedValues = getStats();
          props.setGenres(sortedValues.genres);
          props.setDatesAdded(sortedValues.datesAdded);
          props.setContentRatings(sortedValues.contentRatings);
          props.setReleaseDates(sortedValues.releaseDates);
          props.setThemes(sortedValues.themes);
          props.setRatings(sortedValues.ratings);
        } else {
          setGenres(props.genres as ISortedStat[]);
          setContentRatings(props.contentRatings as ISortedStat[]);
          setDatesAdded(props.datesAdded as string[]);
          setReleaseDates(props.releaseDates as string[]);
          setThemes(props.themes as ISortedStat[]);
          setRatings(props.ratings as IRatings);
        }
      } else {
        getStats();
      }
    }
  }, [movieList]);

  const title = titleMapping[property];
  const crumbs = [
    {
      name: "Stats",
      href: "/stats",
    },
    {
      name: title,
      href: `/stats/${title}`,
    },
    {
      name: value,
    },
  ];

  return (
    <div className="Stats text-centered margin-top">
      <div className={property ? "border-bottom" : ""}>
        {property ? (
          <MetaTags>
            <title>Your personal {value} movie statistics | INTAKE</title>
            <meta
              name="description"
              content={`View statistics for all the movies you've seen with the ${titleMapping[
                property
              ].substring(
                0,
                titleMapping[property].length - 1
              )} ${value}. See the average rating, the most common themes, genres, and content ratings, and content timelines.`}
            />
          </MetaTags>
        ) : (
          <MetaTags>
            <title>Your personal movie statistics | INTAKE</title>
            <meta
              name="description"
              content={`View statistics for all the movies you've submitted to your Intake feed. See the average rating, the most common themes, genres, and content ratings, and content timelines.`}
            />
          </MetaTags>
        )}
        {property && <Breadcrumbs crumbs={crumbs} />}
        <h1>
          {property
            ? `${title.substring(0, title.length - 1)}: ${value}`
            : "All Movies"}
        </h1>
        {movieList?.length === 0 ? (
          <p className="grey italics">
            You don't have any movies that can be used to collect these
            statistics.{" "}
            <NavLink to="/movies" className="green link">
              Add More
            </NavLink>
          </p>
        ) : (
          <>
            <p className="green italics">Movies Seen: {movieList?.length}</p>
            <div className="two-col-grid">
              <Pie data={themes} title="Themes" />
              <Pie
                data={ratings.others}
                title="Average Rating"
                titleExtension={`: ${ratings.total}`}
              />
              <Pie data={genres} title="Genres" />
              <Pie data={contentRatings} title="Content Ratings" />
            </div>
            <BrowserView>
              <ViewingTimeline dates={datesAdded} />
              <div className="vertical-padding"></div>
              <ReleaseTimeline dates={releaseDates} />
              <div className="vertical-padding"></div>
              <div className="vertical-padding"></div>
            </BrowserView>
            {!property && (
              <div className="margin-top">
                <h1>Other Stats</h1>
                <div className="other-stats">
                  {otherStats.map((title) => (
                    <NavLink
                      to={`/stats/${title}`}
                      className="stat-link"
                      key={title}
                    >
                      <p>{title}</p>
                    </NavLink>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
      {property && (
        <div className="margin-top">
          <h1>Movies</h1>
          <div className="posters-container">
            {movieList?.map((movie) => (
              <div className="poster-wrapper" key={movie._id}>
                <LazyLoad
                  height={500 / 1.75}
                  offset={200}
                  once
                  key={movie.title}
                >
                  <Link to={`/movies/${movie._id}`}>
                    <img
                      src={
                        movie.poster.substring(0, movie.poster.length - 7) +
                        "300.jpg"
                      }
                      className="poster-medium hover-scale"
                      alt={movie.title}
                      aria-label={`${movie.title} | ${movie.total_rating}/20`}
                    />
                    <div className="hoverText">
                      <p>
                        {movie.total_rating} <br></br>{" "}
                        <span className="overlined">20</span>
                      </p>
                    </div>
                  </Link>
                </LazyLoad>
                {isMobile && <p>{movie.total_rating} / 20</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(UnconnectedStats);
