import React from "react";
import "../Styles/Login.css";
import AccountBoxIcon from "@material-ui/icons/AccountBox";
import MetaTags from "react-meta-tags";
import { useParams, NavLink } from "react-router-dom";
import Loading from "./Loading";

/**
 * Component that renders a verification form / sends a verification email to uesr
 */
const Verify = () => {
  const [email, setEmail] = React.useState<string>("");
  const [finished, setFinished] = React.useState<boolean>(false);
  const [error, setError] = React.useState<boolean>(false);
  const [success, setSuccess] = React.useState<boolean>(false);
  const { token } = useParams();

  // if the url contains a token, verify that token with api request
  React.useEffect(() => {
    const asyncOps = async () => {
      const response = await fetch(`/api/user/verifyAccount/${token}`);
      if (response.status === 200) {
        setFinished(true);
      } else {
        setFinished(true);
        setError(true);
      }
    };
    if(token){
      asyncOps();
    }
  }, [token]);

  if (token) {
    // render a message based on the api request result
    return finished ? (
      <div className="text-centered">
        <MetaTags>
          <title>Verify your Intake account. | INTAKE</title>
          <meta
            name="description"
            content="Send a verification email to the email linked to your Intake account to begin using Intake."
          />
        </MetaTags>
        <h1>Verify Intake Account</h1>
        {error ? (
          <p>
            Invalid verification token. Please
            <NavLink to="/verify" className="green link">
              {" "}
              request another one{" "}
            </NavLink>
            .
          </p>
        ) : (
          <p>
            Your account has been verified. Please return to{" "}
            <NavLink to="/login" className="green link">
              login
            </NavLink>
            .
          </p>
        )}
      </div>
    ) : (
      <Loading />
    );
  }

  // make an api request to send verification email
  const handleSubmit = async (e: any) => {
    setError(false);
    e.preventDefault();
    const response = await fetch("/api/user/sendVerificationToken", {
      method: "post",
      body: JSON.stringify({ email }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if(response.status === 200){
      setSuccess(true);
    }
  };

  return (
    <div className="Login text-centered margin-top">
      <MetaTags>
        <title>Verify your Intake account. | INTAKE</title>
        <meta
          name="description"
          content="Send a verification email to the email linked to your Intake account to begin using Intake."
        />
      </MetaTags>
      <h1>Verify Intake Account</h1>
      <div className="vertical-padding"></div>
      <form onSubmit={handleSubmit} className="text-centered login-form">
        <div className="inline-flex">
          <AccountBoxIcon />
          <input
            type="text"
            placeholder="Email"
            className="input-large margin-left"
            value={email}
            onChange={(e: any) => setEmail(e.target.value)}
          />
        </div>
        <button type="submit" className="button-submit float-right margin-top">
          Send Verification Email
        </button>
      </form>
      {success && <p className="italics">Verification email sent.</p>}
    </div>
  );
};

export default Verify;
