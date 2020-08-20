import React from "react";
import { IProcessedMovieData } from "../util/api";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { RootState } from "../redux";
import { loadMovies } from "../redux/modules/movies";
import { connect } from "react-redux";
import { Dispatch, bindActionCreators } from "redux";

const mapStateToProps = (state: RootState) => ({
  movies: state.movies.movies,
});

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators({ loadMovies }, dispatch);

type IRateMovieDispatch = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

interface IRateMovie extends IRateMovieDispatch {
  movie: IProcessedMovieData;
  closeDrawer: () => void;
}

/**
 * 
 * @param props movies taken from movie redux store
 * @param {IProcessedMovieData} props.movie movie data returned from api server after search
 * @param {()=>void} props.closeDrawer function to close the add movie drawer
 */
const UnconnectedRateMovie = (props: IRateMovie) => {
  const [entertainment, setEntertainment] = React.useState<string>("");
  const [plot, setPlot] = React.useState<string>("");
  const [style, setStyle] = React.useState<string>("");
  const [bias, setBias] = React.useState<string>("");
  const [dateViewed, setDateViewed] = React.useState<Date | null>(new Date());
  const [themes, setThemes] = React.useState<string[]>([]);

  /* ===== onChange handlers ===== */
  const handleEntertainmentChange = (e: any): void => {
    if (e.target.value) {
      const rating = parseInt(e.target.value);
      setEntertainment(rating <= 5 ? e.target.value : entertainment);
    } else {
      setEntertainment("");
    }
  };

  const handlePlotChange = (e: any): void => {
    if (e.target.value) {
      const rating = parseInt(e.target.value);
      setPlot(rating <= 5 ? e.target.value : plot);
    } else {
      setPlot("");
    }
  };

  const handleStyleChange = (e: any): void => {
    if (e.target.value) {
      const rating = parseInt(e.target.value);
      setStyle(rating <= 5 ? e.target.value : style);
    } else {
      setStyle("");
    }
  };

  const handleBiasChange = (e: any): void => {
    if (e.target.value) {
      const rating = parseInt(e.target.value);
      setBias(rating <= 5 ? e.target.value : bias);
    } else {
      setBias("");
    }
  };

  const handleThemeChange = (index: number, e: any): void => {
    const updatedThemes = [...themes];
    updatedThemes[index] = e.target.value;
    setThemes(updatedThemes);
  };

  const handleThemeDelete = (index: number): void => {
    const updatedThemes = [...themes];
    updatedThemes.splice(index, 1);
    setThemes(updatedThemes);
  };

  const addNewTheme = (e: any): void => {
    setThemes((prev) => [...prev, ""]);
  };

  /**
   * Function that handles the form submission
   * @param {any} e The form element
   * @returns {void} void
   * @todo Send form data to the server
   */
  const handleSubmit = async (e: any): Promise<void> => {
    e.preventDefault();

    console.log("submitted");
    const response = await fetch("/api/movies", {
      method: "post",
      body: JSON.stringify({
        imdbid: props.movie.imdbID,
        entertainment_rating: parseInt(entertainment) || 0,
        plot_rating: parseInt(plot) || 0,
        style_rating: parseInt(style) || 0,
        bias_rating: parseInt(bias) || 0,
        themes,
        date: dateViewed,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    switch (response.status) {
      case 200:
        console.log("movie successfully added");
        props.closeDrawer();

        props.loadMovies();
        break;
      case 400:
        console.log("movie already seen");
        break;
      default:
        console.log("unknown error");
    }
  };

  /* ===== rating data to be mapped to rating drawer */
  const ratingData = [
    {
      title: "Entertainment",
      changeHandler: handleEntertainmentChange,
      value: entertainment,
    },
    {
      title: "Writing",
      changeHandler: handlePlotChange,
      value: plot,
    },
    {
      title: "Style",
      changeHandler: handleStyleChange,
      value: style,
    },
    {
      title: "Bias",
      changeHandler: handleBiasChange,
      value: bias,
    },
  ];

  return (
    <div className="rate-movie">
      <img
        src={props.movie.Poster}
        alt={props.movie.Title}
        className="poster"
      />
      <h2>{props.movie.Title}</h2>
      <form autoComplete="off" onSubmit={handleSubmit} id="rate-movie-form">
        {ratingData.map((rating, i) => (
          <div key={rating.title} className="row margin-top">
            <label id={`${rating.title}Label`} className="green col text-right">
              {rating.title}:
            </label>
            <div className="col text-left">
              <input
                type="string"
                className="small-input"
                aria-labelledby={`${rating.title}Label`}
                value={rating.value}
                onChange={rating.changeHandler}
              />{" "}
              <span className="grey">/ 5</span>
            </div>
          </div>
        ))}
        {themes.map((theme, i) => (
          <div key={`theme-${i}`} className="fade-in">
            <input
              type="string"
              placeholder="theme"
              className="margin-top"
              value={theme}
              onChange={(e) => handleThemeChange(i, e)}
            />
            <button
              className="button-escape margin-top"
              aria-label="delete theme"
              onClick={() => handleThemeDelete(i)}
            >
              &times;
            </button>
          </div>
        ))}
        <button
          type="button"
          className="button-submit margin-top"
          onClick={addNewTheme}
        >
          + Add Theme
        </button>
        <div className="text-centered margin-top">
          <label id="datePickerLabel" className="green text-right">
            Date Viewed:{" "}
          </label>
          <DatePicker
            selected={dateViewed}
            onChange={(date) => setDateViewed(date)}
          />
        </div>
        <div className="inline-flex full-width row-reverse margin-top">
          <button type="submit" className="button-submit">
            Submit
          </button>
          <button
            onClick={props.closeDrawer}
            type="button"
            className="button-cancel margin-right"
          >
            Cancel
          </button>
        </div>
        <div className="vertical-padding"></div>
      </form>
    </div>
  );
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UnconnectedRateMovie);
