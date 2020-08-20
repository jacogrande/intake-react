import React from "react";
import { RootState } from "../redux";
import { login } from "../redux/modules/user";
import { connect } from "react-redux";
import MetaTags from "react-meta-tags";

import AccountBoxIcon from "@material-ui/icons/AccountBox";
import LockIcon from "@material-ui/icons/Lock";
import LockOpenIcon from "@material-ui/icons/LockOpen";
import Tooltip from "@material-ui/core/Tooltip";
import MailIcon from "@material-ui/icons/Mail";

import "../Styles/Login.css";
import { NavLink } from "react-router-dom";

const mapStateToProps = (state: RootState) => ({
  username: state.user.username,
});

const mapDispatchToProps = { login };


type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

/**
 * Create account component that returns a registration form
 * @param {Props} props component properties taken from redux store.
 */
const UnconnectedCreateAccount: React.FC<Props> = (props: Props) => {
  // state
  const [showPassword, setShowPassword] = React.useState<boolean>(false);
  const [showComfirmPassword, setShowComfirmPassword] = React.useState<boolean>(
    false
  );
  const [username, setUsername] = React.useState<string>("");
  const [email, setEmail] = React.useState<string>("");
  const [password, setPassword] = React.useState<string>("");
  const [comfirmPassword, setComfirmPassword] = React.useState<string>("");
  const [error, setError] = React.useState<string>("");
  const [verify, setVerify] = React.useState<boolean>(false);

  /**
   * Submission handler that makes an api request to check the validity of the account credentials
   * @param e form element
   */
  const handleSubmit = async (e: any): Promise<void> => {
    e.preventDefault();
    if (password !== comfirmPassword) {
      setError("Passwords don't match");
    } else {
      if (username && password) {
        const response = await fetch("/api/user/register", {
          method: "post",
          body: JSON.stringify({ email, username, password }),
          headers: {
            "Content-Type": "application/json",
          },
        });
        // check the registration status
        switch (response.status) {
          case 200:
            // if the user was successfully verified, send their inputted email a verification token
            const verificationSent = await fetch(
              "/api/user/sendVerificationToken",
              {
                method: "post",
                body: JSON.stringify({ email }),
                headers: {
                  "Content-Type": "application/json",
                },
              }
            )
            if(verificationSent.status === 200){
              setVerify(true);
            } else {
              setError("Verification token could not be sent. Try again later.")
            }
            break;
          default:
            const error = await response.json();
            setError(error.error);
        }
      } else {
        setError("Please enter valid user data.");
      }
    }
  };

  React.useEffect(() => {
    setError("");
  }, [username, email, password]);

  const handlePasswordChange = (e: any): void => {
    setPassword(e.target.value);
  };

  return (
    <div className="Login text-centered margin-top">
      <MetaTags>
        <title>Create a new account for free. | INTAKE</title>
        <meta
          name="description"
          content={`Sign up for a new Intake account with a valid email, username, and password. Once registered, you'll be able to start adding movies to your Intake feed.`}
        />
      </MetaTags>
      <h1>Create Account</h1>
      <div className="vertical-padding"></div>
      <form onSubmit={handleSubmit} className="text-centered login-form">
        <div className="inline-flex">
          <AccountBoxIcon />
          <input
            type="text"
            placeholder="Username"
            className={
              error
                ? "input-large-error margin-left"
                : "input-large margin-left"
            }
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="margin-top-x"></div>
        <div className="inline-flex">
          <MailIcon />
          <input
            type="text"
            placeholder="Email"
            className={
              error
                ? "input-large-error margin-left"
                : "input-large margin-left"
            }
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="inline-flex margin-top-x row-reverse">
          <input
            aria-label="password"
            placeholder="Password"
            className={
              error
                ? "input-large-error margin-left"
                : "input-large margin-left"
            }
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
        <div className="inline-flex margin-top-x row-reverse">
          <input
            aria-label="password"
            placeholder="Comfirm Password"
            className={
              error
                ? "input-large-error margin-left"
                : "input-large margin-left"
            }
            type={showComfirmPassword ? "text" : "password"}
            value={comfirmPassword}
            onChange={(e: any) => setComfirmPassword(e.target.value)}
          />
          {showComfirmPassword ? (
            <Tooltip title="Hide Password">
              <button
                type="button"
                className="button-icon"
                aria-label="hide password"
                onClick={() => setShowComfirmPassword(false)}
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
                onClick={() => setShowComfirmPassword(true)}
              >
                <LockIcon />
              </button>
            </Tooltip>
          )}
        </div>
        {error && <p className="red">{error}</p>}
        {verify && <p>A verification email has been sent to {email}.</p>}
        <div className="full-width margin-top login-buttons">
          <button type="button" className="button-icon margin-right-x">
            <NavLink to="/login" className="green link">
              Back to login
            </NavLink>
          </button>
          <span> </span>
          <button type="submit" className="button-submit float-right">
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(UnconnectedCreateAccount);
