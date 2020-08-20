import React from "react";
import { useParams, NavLink } from "react-router-dom";
import SearchIcon from "@material-ui/icons/Search";
import { RootState } from "../redux";
import { connect } from "react-redux";
import { IMovieData } from "../redux/modules/movies";
import Bubble from "./Charts/Bubble";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import Breadcrumbs from "./Breadcrumbs";
import MetaTags from "react-meta-tags";
import { isBrowser } from "react-device-detect";

export const bubbleColors = [
  ["#FFF7F3", "#FCC5C0", "#FA9FB5", "#F768A1", "#DD3497"],
  ["#EAFFF7", "#C8F3E5", "#A5E7D2", "#83DBC0", "#60CFAD"],
  ["#DDDDDF", "#D0C4DF", "#DCABDF", "#C792DF"],
  ["#fef9ef", "#ffcb77", "#17c3b2", "#227c9d", "#fe6d73"],
  ["#598392", "#1a659e", "#ff6b35", "#f7c59f", "#efefd0"],
  ["#7bdff2", "#b2f7ef", "#eff7f6", "#f7d6e0", "#f2b5d4"],
];

const mapStateToProps = (state: RootState) => ({
  movies: state.movies.movies,
});

export interface IEntity {
  [key: string]: {
    [key: string]: any;
    movies: number;
    total: number;
    entertainment: number;
    plot: number;
    style: number;
    bias: number;
  };
}

const titleMapping: { [key: string]: string } = {
  Genres: "genres",
  Themes: "themes",
  Directors: "director",
  Runtimes: "runtime",
  Writers: "writer",
  "Content Ratings": "rated",
  Years: "year"
};

type IProps = ReturnType<typeof mapStateToProps>;

/**
 * Stat page for properties on the movie data type
 * @param props props taken from redux store
 */
const StatProperty = (props: IProps) => {
  const [values, setValues] = React.useState<IEntity>({});
  const [filter, setFilter] = React.useState<string>("movies");
  const [search, setSearch] = React.useState<string>("");
  const [results, setResults] = React.useState<string[]>([]);
  const [listOpen, setListOpen] = React.useState<boolean>(false);
  const [emptySearch, setEmptySearch] = React.useState<boolean>(false);

  const { title } = useParams();
  const property = titleMapping[title];

  // function for developing a property hash map
  const addValue = (
    entities: IEntity,
    val: any,
    movie: IMovieData
  ): IEntity => {
    if (entities[val]) {
      entities[val].movies++;
      entities[val].total += movie.total_rating;
      entities[val].entertainment += movie.entertainment_rating;
      entities[val].plot += movie.plot_rating;
      entities[val].style += movie.style_rating;
      entities[val].bias += movie.bias_rating;
    } else {
      entities[val] = {
        movies: 1,
        total: movie.total_rating,
        entertainment: movie.entertainment_rating,
        plot: movie.plot_rating,
        style: movie.style_rating,
        bias: movie.bias_rating,
      };
    }
    return entities;
  };

  // whenever the movie list is modified, generate and sort a hashmap of property values
  React.useEffect(() => {
    if (props.movies) {
      let entities: IEntity = {};
      // loop through each movie
      props.movies.forEach((movie) => {
        const result: any = movie[property];
        // if the specified property is a
        if (result instanceof Array) {
          const arr: any[] = result;
          arr.forEach((val: any) => {
            entities = addValue(entities, val, movie);
          });
        } else {
          entities = addValue(entities, result, movie);
        }
      });
      Object.keys(entities).forEach((key) => {
        const subEntities = Object.keys(entities[key]);
        for (let i = 1; i < subEntities.length; i++) {
          entities[key][subEntities[i]] = Number(
            (entities[key][subEntities[i]] / entities[key].movies).toFixed(2)
          );
        }
      });
      setValues(entities);
    }
  }, [props.movies]);

  const handleSearchChange = (e: any) => {
    setEmptySearch(false);
    setSearch(e.target.value);
    const keys = Object.keys(values);
    setResults(
      keys.filter((key) =>
        key.toLowerCase().includes(e.target.value.toLowerCase())
      )
    );
    if (results.length > 0 && e.target.value.length > 0) {
      setListOpen(true);
    } else if (results.length === 0 && e.target.value.length > 0) {
      setEmptySearch(true);
    } else {
      setListOpen(false);
    }
  };

  const breadcrumbData = [
    {
      name: "Stats",
      href: "/stats",
    },
    {
      name: title,
    },
  ];

  return (
    <div className="Stats text-centered margin-top">
      <MetaTags>
        <title>
          Your personal {title.substring(0, title.length - 1)} statistics |
          INTAKE
        </title>
        <meta name="description" content={`See the statistics for the ${title.toLowerCase()} of your favorite movies. Sort ${title.toLowerCase()} by popularity and ratings, search for specific ${title.toLowerCase()}, and find out what your favorite ${title.toLowerCase()} are.`} />
      </MetaTags>
      <Breadcrumbs crumbs={breadcrumbData} />

      <h1>{`${title.substring(0, title.length - 1)} Statistics`}</h1>
      <div className="two-col-grid margin-top">
        <form onSubmit={(e) => e.preventDefault()} className={isBrowser ? "align-right" : ""}>
          <select
            aria-label="user filter"
            className="float-right margin-top stat-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="movies">Movies Seen</option>
            <option value="total">Highest Rated</option>
            <option value="entertainment">Most Entertaining</option>
            <option value="plot">Best Writing</option>
            <option value="style">Most Stylish</option>
            <option value="bias">Favorite</option>
          </select>
        </form>
        <form
          onSubmit={(e) => e.preventDefault()}
          className="align-left bump-down-form"
        >
          <ClickAwayListener onClickAway={() => setListOpen(false)}>
            <div>
              <div className="inline-flex">
                <SearchIcon className="form-icon" />
                <input
                  type="text"
                  placeholder="Search"
                  className="stat-search"
                  value={search}
                  onChange={handleSearchChange}
                  aria-controls="results-menu"
                  aria-haspopup="true"
                />
              </div>
              <List
                component="nav"
                aria-label="search results"
                className="search-results"
                style={{ display: listOpen ? "block" : "none" }}
              >
                {!emptySearch ? (
                  results.map((result) => (
                    <NavLink
                      to={`/stats/${titleMapping[title]}/${result}`}
                      className="white link"
                      key={result}
                    >
                      <ListItem button className="search-result-wrapper">
                        <ListItemText primary={result} />
                      </ListItem>
                    </NavLink>
                  ))
                ) : (
                  <p className="grey italics" style={{ marginLeft: "10px" }}>
                    No {title.toLowerCase()} match your search.
                  </p>
                )}
              </List>
            </div>
          </ClickAwayListener>
        </form>
      </div>
      <Bubble
        values={values}
        filter={filter}
        link={`/stats/${titleMapping[title]}`}
      />
    </div>
  );
};

export default connect(mapStateToProps)(StatProperty);
