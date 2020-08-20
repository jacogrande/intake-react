import React from "react";
import "../Styles/Login.css";
import AccountBoxIcon from "@material-ui/icons/AccountBox";
import { useParams, NavLink } from "react-router-dom";
import LockIcon from "@material-ui/icons/Lock";
import LockOpenIcon from "@material-ui/icons/LockOpen";
import { Tooltip } from "@material-ui/core";
import Snackbar from "./Snackbar";
import MetaTags from "react-meta-tags";

/**
 * Component that renders a password reset form and sends reset emails to users
 */
const ResetPassword = () => {
  const [email, setEmail] = React.useState<string>("");
  const [password, setPassword] = React.useState<string>("");
  const [comfirmPassword, setComfirmPassword] = React.useState<string>("");
  const [showPassword, setShowPassword] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [validToken, setValidToken] = React.useState<boolean>(true);
  const [finished, setFinished] = React.useState<boolean>(false);
  const [snackbarOpen, setSnackbarOpen] = React.useState<boolean>(false);
  const [errorMessage, setErrorMessage] = React.useState<string>("");

  const { id, token } = useParams();

  // when the user follows the reset link sent to their email, send the jwt to the api server
  React.useEffect(() => {
    if (id && token) {
      setLoading(true);
      const asyncOps = async () => {
        const response = await fetch(`/api/user/passwordReset/${id}/${token}`);
        response.status !== 200 && setValidToken(false);
        setLoading(false);
      };
      asyncOps();
    }
  }, [id, token]);

  // send the inputted email to the api server to start the password reset process
  const handleSubmit = async (e: any): Promise<void> => {
    setErrorMessage("");
    e.preventDefault();
    const response = await fetch("/api/user/passwordReset", {
      method: "post",
      body: JSON.stringify({ email }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log(response);
    switch (response.status) {
      case 200:
        setSnackbarOpen(true);
        break;
      default:
        setErrorMessage("An unexpected error occured. Try again soon.");
        setSnackbarOpen(true);
    }
  };

  // verify that the user has entered valid passwords and send the new password to the api server
  const handlePasswordReset = async (e: any): Promise<void> => {
    e.preventDefault();

    if (password === comfirmPassword) {
      console.log("epic");
      const response = await fetch(`/api/user/passwordReset/${id}/${token}`, {
        method: "post",
        body: JSON.stringify({ password }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(response.status);
      if (response.status === 200) setFinished(true);
      else {
        setErrorMessage("An unexpected error occured. Try again later.");
      }
    } else {
      setErrorMessage("Passwords don't match");
    }
  };

  if (loading) return <p>loading</p>;

  if (!validToken) return <p>Reset link timed out...</p>;

  if (finished)
    return (
      <div className="Login text-centered margin-top">
        <MetaTags>
          <title>Reset your Intake account password. | INTAKE</title>
          <meta
            name="description"
            content="Enter your new password to complete the Intake account password reset process."
          />
        </MetaTags>
        <p>
          Password successfully reset. Please return to{" "}
          <NavLink className="link white button-icon" to="/login">
            login
          </NavLink>{" "}
        </p>
      </div>
    );

  return (
    <div className="Login text-centered margin-top">
      <MetaTags>
        <title>Reset your Intake account password. | INTAKE</title>
        <meta
          name="description"
          content="Send a password reset email to the email linked to your Intake account to start the password reset process."
        />
      </MetaTags>
      <h1>Reset Password</h1>
      <div className="vertical-padding"></div>
      {id && token ? (
        <form
          onSubmit={handlePasswordReset}
          className="text-centered login-form"
        >
          <div className="inline-flex margin-top row-reverse">
            <input
              aria-label="password"
              placeholder="Password"
              className="input-large margin-left"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Tooltip title={showPassword ? "Hide Password" : "Show Password"}>
              <button
                type="button"
                className="button-icon"
                aria-label={showPassword ? "hide password" : "show password"}
                onClick={() =>
                  showPassword ? setShowPassword(false) : setShowPassword(true)
                }
              >
                {showPassword ? <LockOpenIcon /> : <LockIcon />}
              </button>
            </Tooltip>
          </div>
          <div className="inline-flex margin-top row-reverse">
            <input
              aria-label="comfirm password"
              placeholder="Comfirm Password"
              className="input-large margin-left"
              type={showPassword ? "text" : "password"}
              value={comfirmPassword}
              onChange={(e) => setComfirmPassword(e.target.value)}
            />
            <button
              type="button"
              className="button-icon"
              aria-label={showPassword ? "hide password" : "show password"}
              onClick={() =>
                showPassword ? setShowPassword(false) : setShowPassword(true)
              }
            >
              {showPassword ? <LockOpenIcon /> : <LockIcon />}
            </button>
          </div>
          <button
            type="submit"
            className="button-submit float-right margin-top"
          >
            Reset Password
          </button>
          <p className="red">{errorMessage}</p>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="text-centered login-form">
          <div className="inline-flex">
            <AccountBoxIcon />
            <input
              type="text"
              placeholder="Email"
              className="input-large margin-left"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="button-submit float-right margin-top"
          >
            Send Reset Link
          </button>
        </form>
      )}
      <Snackbar
        error={errorMessage}
        open={snackbarOpen}
        handleClose={() => setSnackbarOpen(false)}
        success="Reset link sent"
      />
    </div>
  );
};

export default ResetPassword;
