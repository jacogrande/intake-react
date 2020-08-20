import React from "react";
import { RootState } from "../redux";
import { login } from "../redux/modules/user";
import { loadMovies } from "../redux/modules/movies";
import { connect } from "react-redux";
import MetaTags from "react-meta-tags";

import AccountBoxIcon from "@material-ui/icons/AccountBox";
import LockIcon from "@material-ui/icons/Lock";
import LockOpenIcon from "@material-ui/icons/LockOpen";
import Tooltip from "@material-ui/core/Tooltip";


import "../Styles/Login.css";
import "../Styles/LoginPhone.css";
import { NavLink } from "react-router-dom";
import { Dispatch, bindActionCreators } from "redux";

const mapStateToProps = (state: RootState) => ({
  username: state.user.username,
});

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators({ login, loadMovies }, dispatch);

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

/**
 * Component that renders a login form
 * @param props Component props taken from redux store
 */
const UnconnectedLogin: React.FC<Props> = (props: Props) => {
  // state
  const [showPassword, setShowPassword] = React.useState<boolean>(false);
  const [username, setUsername] = React.useState<string>("");
  const [password, setPassword] = React.useState<string>("");
  const [error, setError] = React.useState<boolean>(false);
  const [verify, setVerify] = React.useState<boolean>(false);

  // Submission handler that sends an api request to verify login credentials
  const handleSubmit = async (e: any): Promise<void> => {
    e.preventDefault();
    // check to see if the form has been filled out
    if (username && password) {
      // send api request with login info
      const response = await fetch("/api/user/login", {
        method: "post",
        body: JSON.stringify({ username, password }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      switch (response.status) {
        case 200:
          const data = await response.json();
          props.login(data);
          props.loadMovies();
          break;
        case 401:
          // 401 status code may mean that the user has not verified their account yet
          const hasError = await response.json();
          if(hasError.error){
            setVerify(true);
          } else {
            setError(true);
          }
          break;
        default:
          setError(true);
      }
    }
  };

  const handlePasswordChange = (e: any): void => {
    setPassword(e.target.value);
    setError(false);
  };

  const handleUsernameChange = (e: any): void => {
    setUsername(e.target.value);
    setError(false);
  }

  return (
    <div className="Login text-centered margin-top">
      <MetaTags>
        <title>Login to your Intake account | INTAKE</title>
        <meta name="description" content={`Enter your username/email and password to gain access to your Intake account or register for a new account for free.`} />
      </MetaTags>
      <h1>Login</h1>
      <div className="vertical-padding"></div>
      <form onSubmit={handleSubmit} className="text-centered login-form">
        <div className="inline-flex">
          <AccountBoxIcon />
          <input
            type="text"
            placeholder="Username or email"
            className={error ? "input-large-error margin-left" : "input-large margin-left"}
            value={username}
            onChange={handleUsernameChange}
          />
        </div>
        <div className="margin-top"></div>
        <div className="inline-flex margin-top row-reverse">
          <input
            aria-label="password"
            placeholder="Password"
            className={error ? "input-large-error margin-left" : "input-large margin-left"}
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={handlePasswordChange}
          />
          {showPassword ? (
            <Tooltip title="Hide Password">
              <button
                type="button"
                className="button-icon"
                aria-label="hide password"
                onClick={() => setShowPassword(false)}
              >
                <LockOpenIcon />
              </button>
            </Tooltip>
          ) : (
            <Tooltip title="Show Password">
              <button
                type="button"
                className="button-icon"
                aria-label="hide password"
                onClick={() => setShowPassword(true)}
              >
                <LockIcon />
              </button>
            </Tooltip>
          )}
        </div>
        {error && <p className="red">Invalid username / password combination</p>}
        {verify && <p className="red">Please <NavLink to="/verify" className="link green">verify</NavLink> your Intake account.</p>}
        <div className="full-width margin-top login-buttons">
          <button type="button" className="button-icon margin-right">
            <NavLink to="/createAccount" className="green link">
              Create an account
            </NavLink>
          </button>
          <button
            type="button"
            className="button-icon margin-right"
            aria-label="forgot password"
          >
            <NavLink to="/resetPassword" className="white link">
              Forgot Password
            </NavLink>
          </button>
          <button type="submit" className="button-submit">
            Login
          </button>
        </div>
      </form>
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(UnconnectedLogin);
