import React from "react";
import { IMovieData } from "../redux/modules/movies";

import { RootState } from "../redux";
import { loadMovies } from "../redux/modules/movies";
import { connect } from "react-redux";
import { Dispatch, bindActionCreators } from "redux";

const mapStateToProps = (state: RootState) => ({
  movies: state.movies.movies,
});

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators({ loadMovies }, dispatch);

type IEditMovieDispatch = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

interface IEditMovie extends IEditMovieDispatch {
  movie: IMovieData;
  entertainment_rating: number;
  plot_rating: number;
  style_rating: number;
  bias_rating: number;
  themes: string[];
  closeDrawer: () => void;
  id: string;
}

/**
 * 
 * @param {IEditMovie} props component properties taken from redux store.
 * @param {IMovieData} movie The movie to be edited
 * @param {number} entertainment_rating The movie's entertainment_rating
 * @param {number} plot_rating The movie's plot_rating
 * @param {number} style_rating The movie's style_rating
 * @param {number} bias_rating The movie's bias_rating
 * @param {string[]} themes The movie's themes
 * @param {()=>void} closeDrawer function to close edit movie drawer
 * @param {string} id The movie's id
 */
const UnconnectedEditMovie = (props: IEditMovie) => {
  const [entertainment, setEntertainment] = React.useState<string>(
    props.entertainment_rating.toString()
  );
  const [plot, setPlot] = React.useState<string>(props.plot_rating.toString());
  const [style, setStyle] = React.useState<string>(
    props.style_rating.toString()
  );
  const [bias, setBias] = React.useState<string>(props.bias_rating.toString());
  const [themes, setThemes] = React.useState<string[]>(props.themes);

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

  // submission handler that sends an api request to the server, saving the updated movie data
  const handleSubmit = async (e: any): Promise<void> => {
    e.preventDefault();
    const response = await fetch(`/api/movies/${props.id}`, {
      method: "post",
      body: JSON.stringify({
        id: props.id,
        entertainment_rating: parseInt(entertainment),
        plot_rating: parseInt(plot),
        style_rating: parseInt(style),
        bias_rating: parseInt(bias),
        themes,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    switch (response.status) {
      case 200:
        props.loadMovies();
        props.closeDrawer();
        break;
      case 401:
        console.log("error saving");
        break;
      default:
        console.log("unkown error");
    }
  };

  return (
    <div className="drawer-content">
      <div className="drawer-header">
        <h2 id="movieEditLabel">Edit Ratings</h2>
        <hr></hr>
        <div className="vertical-padding"></div>
      </div>
      <div className="drawer-body text-centered">
        <img
          src={props.movie.poster}
          alt={props.movie.title}
          className="poster"
        />
        <h2>{props.movie.title}</h2>
        <form autoComplete="off" onSubmit={handleSubmit}>
          {ratingData.map((rating, i) => (
            <div key={rating.title} className="row margin-top">
              <label
                id={`${rating.title}Label`}
                className="green col text-right"
              >
                {rating.title}:
              </label>
              <div className="col text-left">
                <input
                  type="string"
                  className="small-input"
                  aria-labelledby={`${rating.title}Label`}
                  value={rating.value}
                  onChange={rating.changeHandler}
                />
                {' '}
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
    </div>
  );
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UnconnectedEditMovie);
