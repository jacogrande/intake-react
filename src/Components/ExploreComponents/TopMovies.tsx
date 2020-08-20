import React from "react";
import MovieFeed from "./MovieFeed";

import { RootState } from "../../redux";
import {
  setTopMovies,
  setFilter,
  IAverageMovieData,
  searchMovies,
  setSearch
} from "../../redux/modules/movies";
import { connect } from "react-redux";
import { Dispatch, bindActionCreators } from "redux";
import SearchIcon from "@material-ui/icons/Search";

const mapStateToProps = (state: RootState) => ({
  topMoviesByPopularity: state.movies.topMoviesByPopularity,
  topMoviesByEntertainment: state.movies.topMoviesByEntertainment,
  topMoviesByBias: state.movies.topMoviesByBias,
  topMoviesByPlot: state.movies.topMoviesByPlot,
  topMoviesByStyle: state.movies.topMoviesByStyle,
  topMoviesByTotal: state.movies.topMoviesByTotal,
  filter: state.movies.filter,
  search: state.movies.search,
  searchResults: state.movies.searchResults,
});

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators({ setTopMovies, setFilter, searchMovies, setSearch }, dispatch);

type ITopMovies = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

  /**
   * Component that renders a container for the movie feed, including a filter selector and a searchbar.
   * @param {ITopMovies} props component props taken from redux store.
   */
const TopMovies = (props: ITopMovies) => {
  const [movies, setMovies] = React.useState<IAverageMovieData[] | null>([]);

  const filterMap: { [key: string]: IAverageMovieData[] | null } = {
    popularity: props.topMoviesByPopularity,
    total: props.topMoviesByTotal,
    entertainment: props.topMoviesByEntertainment,
    plot: props.topMoviesByPlot,
    style: props.topMoviesByStyle,
    bias: props.topMoviesByBias,
  };
  React.useEffect(() => {
    if (!filterMap[props.filter]) {
      props.setTopMovies(props.filter);
    }
  }, [props.filter]);

  React.useEffect(() => {
    if(props.searchResults && props.search){
      return setMovies(props.searchResults);
    }
    if (filterMap[props.filter]) {
      setMovies(filterMap[props.filter]);
    }
    if(!props.filter){
      setMovies(filterMap['popularity']);
    }
  }, [props]);

  const handleSearch = (e: any) => {
    props.setSearch(e.target.value);
    props.searchMovies(e.target.value);
  }

  return (
    <div className="profile-container">
      <div className="two-col-grid margin-top">
        <form onSubmit={(e) => e.preventDefault()} className="align-right">
          <select
            aria-label="movie filter"
            value={props.filter}
            onChange={(e) => props.setFilter(e.target.value)}
            className="float-right margin-top explore-select"
            defaultValue="popularity"
          >
            <option value="popularity">Most Popular</option>
            <option value="total">Highest Rated</option>
            <option value="entertainment">Most Entertaining</option>
            <option value="plot">Best Written</option>
            <option value="style">Most Stylish</option>
            <option value="bias">Most Biased</option>
          </select>
        </form>
        <form
          onSubmit={(e) => e.preventDefault()}
          className="align-left bump-down-form"
        >
          <div className="inline-flex">
            <SearchIcon className="form-icon" />
            <input
              type="text"
              value={props.search}
              onChange={handleSearch}
              placeholder="Search"
              className="explore-input"
            />
          </div>
        </form>
      </div>
      <MovieFeed movies={movies} />
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(TopMovies);
