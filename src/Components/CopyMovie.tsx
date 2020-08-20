import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Snackbar from "./Snackbar";

import { RootState } from "../redux";
import { loadMovies, IMovieData } from "../redux/modules/movies";
import { connect } from "react-redux";
import { Dispatch, bindActionCreators } from "redux";
import { NavLink } from "react-router-dom";

const mapStateToProps = (state: RootState) => ({
  movies: state.movies.movies,
  username: state.user.username,
});

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators({ loadMovies }, dispatch);

type ICopyMovieDispatch = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

interface ICopyMovie extends ICopyMovieDispatch {
  movie: IMovieData;
  closeDrawer: () => void;
}

/**
 * Component for adding movies that already exist in the database
 * @param {ICopyMovie} props component properties taken from redux store
 * @param {IMovieData} props.movie Movie data to be copied
 * @param {()=>void} props.closeDrawer function that closes the add movie drawer
 */
const UnconnectedCopyMovie = (props: ICopyMovie) => {
  const [entertainment, setEntertainment] = React.useState<string>("");
  const [plot, setPlot] = React.useState<string>("");
  const [style, setStyle] = React.useState<string>("");
  const [bias, setBias] = React.useState<string>("");
  const [dateViewed, setDateViewed] = React.useState<Date | null>(new Date());
  const [themes, setThemes] = React.useState<string[]>([]);
  const [error, setError] = React.useState<string>("");
  const [open, setOpen] = React.useState<boolean>(false);

  if (!props.username) {
    return (
      <div className="rate-movie">
        <img
          src={props.movie.poster}
          alt={props.movie.title}
          className="poster"
        />
        <h2>{props.movie.title}</h2>
        <p className="grey italics">
          <NavLink to="/login" className="link green">
            Login
          </NavLink>{" "}
          or{" "}
          <NavLink to="/createAccount" className="link green">
            create an account
          </NavLink>{" "}
          to add this movie.
        </p>
      </div>
    );
  }

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
   */
  const handleSubmit = async (e: any): Promise<void> => {
    e.preventDefault();

    // api request to add movie that already exists to the users account
    const response = await fetch("/api/movies/addExistingMovie", {
      method: "post",
      body: JSON.stringify({
        id: props.movie._id,
        entertainment_rating: parseInt(entertainment) || 0,
        plot_rating: parseInt(plot) || 0,
        style_rating: parseInt(style) || 0,
        bias_rating: parseInt(bias) || 0,
        themes,
        date: dateViewed,
        movie: props.movie,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    switch (response.status) {
      case 200:
        console.log("success");
        props.loadMovies();
        props.closeDrawer();
        break;
      default:
        setError("Unable to add movie. Try again later.");
        setOpen(true);
        console.error("error saving movie");
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
        src={props.movie.poster}
        alt={props.movie.title}
        className="poster"
      />
      <h2>{props.movie.title}</h2>
      <form autoComplete="off" onSubmit={handleSubmit}>
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
      <Snackbar
        error={error}
        success="Movie added."
        handleClose={() => setOpen(false)}
        open={open}
      />
    </div>
  );
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UnconnectedCopyMovie);
