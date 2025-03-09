import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css"; // Import the CSS file with the styles
import { FaGoogle } from "react-icons/fa";
import { GoogleLogin } from "react-google-login"; // Import the GoogleLogin component
import { Link } from "react-router-dom";
import { ClipLoader, PulseLoader } from "react-spinners"; // Import spinners

function AuthForm() {
  const [view, setView] = useState("login");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false); // State to toggle password visibility
  const [isLoading, setIsLoading] = useState(false); // Loading state for form submission
  const [viewTransitioning, setViewTransitioning] = useState(false); // Loading state for view transitions
  const navigate = useNavigate();

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [view]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e, endpoint) => {
    e.preventDefault();
    setMessage("");
    setIsLoading(true); // Start loading

    let requestData = { ...formData };
    if (endpoint === "login") delete requestData.username;
    
    try {
      const response = await fetch(
        `http://localhost:3000/api/auth/${endpoint}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestData),
        }
      );
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      
      setMessage(data.message || "Success");
      setMessageType("success");
      
      if (endpoint === "login") {
        localStorage.setItem("token", data.token);
        setTimeout(() => {
          navigate("/chatbot-page");
        }, 1000);
      }
    } catch (error) {
      setMessage(error.message);
      setMessageType("error");
    } finally {
      setIsLoading(false); // Stop loading regardless of outcome
    }
  };

  // Handle Google Sign-In success
  // const handleGoogleSuccess = (response) => {
  //   console.log("Google login success:", response);
  //   const { tokenId } = response; // Google access token
  //   setIsLoading(true); // Start loading
  //   // Send the token to your backend for verification
  //   fetch("http://localhost:3000/api/auth/google", {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify({ token: tokenId }),
  //   })
  //     .then((res) => res.json())
  //     .then((data) => {
  //       if (data.token) {
  //         localStorage.setItem("token", data.token); // Store the token
  //         navigate("/chatbot-page"); // Redirect to the chatbot page
  //       }
  //     })
  //     .catch((error) => {
  //       console.error("Error verifying token:", error);
  //       setMessage("Google Sign-In failed. Please try again.");
  //       setMessageType("error");
  //     })
  //     .finally(() => {
  //       setIsLoading(false); // Stop loading
  //     });
  // };

  // Handle Google Sign-In failure
  // const handleGoogleFailure = (error) => {
  //   console.error("Google login failed:", error);
  //   setMessage("Google Sign-In failed. Please try again.");
  //   setMessageType("error");
  // };

  const changeView = (newView) => {
    setIsAnimating(true);
    setViewTransitioning(true); // Start transition loading
    setFormData({ username: "", email: "", password: "" });
    setMessage("");
    
    setTimeout(() => {
      setView(newView);
      setViewTransitioning(false); // Stop transition loading
    }, 200);
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prevState) => !prevState);
  };

  return (
    <>
      <h1 className="heading">
        <Link to='/'>Empathy AI</Link>
      </h1>
      <div className="auth-container">
        <h2 className="auth-title">
          {view === "login"
            ? "Welcome Back"
            : view === "signup"
            ? "Create Account"
            : "Reset Password"}
        </h2>
        
        {viewTransitioning ? (
          <div className="view-transition-loader">
            <PulseLoader color="#667eea" size={10} margin={5} />
          </div>
        ) : (
          <form
            className={`auth-form ${isAnimating ? "form-slide" : ""}`}
            onSubmit={(e) => handleSubmit(e, view)}
          >
            {view === "signup" && (
              <div className="input-field">
                <input
                  type="text"
                  name="username"
                  className="auth-input"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  placeholder=" "
                  disabled={isLoading}
                />
                <label className="input-label">Username</label>
              </div>
            )}
            <div className="input-field">
              <input
                type="email"
                name="email"
                className="auth-input"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder=" "
                disabled={isLoading}
              />
              <label className="input-label">Email</label>
            </div>
            {view !== "forgot-password" && (
              <div className="input-field">
                <input
                  type={isPasswordVisible ? "text" : "password"} // Toggle password type
                  name="password"
                  className="auth-input"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder=" "
                  disabled={isLoading}
                />
                <label className="input-label">Password</label>
                <div className="password-toggle">
                  <input
                    type="checkbox"
                    checked={isPasswordVisible} // Checkbox state reflects password visibility
                    onChange={togglePasswordVisibility} // Toggle visibility
                    disabled={isLoading}
                  />
                  <label>
                    {isPasswordVisible ? "Hide Password" : "Show Password"} {/* Text for clarity */}
                  </label>
                </div>
              </div>
            )}
            <button 
              type="submit" 
              className={`submit-btn ${isLoading ? 'loading-btn' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <ClipLoader color="#ffffff" size={20} />
              ) : (
                view === "login"
                  ? "Login"
                  : view === "signup"
                  ? "Create Account"
                  : "Send Reset Link"
              )}
            </button>
          </form>
        )}
        
        {/* Conditionally render Google sign-in button */}
        {/* {view !== "forgot-password" && !isLoading && (
          <GoogleLogin
            clientId="55873950837-821ei690l12fvfocn6moeod7ic0rtt04.apps.googleusercontent.com" // Replace with your client ID
            buttonText="Sign in with Google"
            onSuccess={handleGoogleSuccess}
            onFailure={handleGoogleFailure}
            cookiePolicy={"single_host_origin"}
            render={(renderProps) => (
              <button
                onClick={renderProps.onClick}
                disabled={renderProps.disabled || isLoading}
                className="google-btn"
              >
                {isLoading ? (
                  <ClipLoader color="#4285F4" size={15} />
                ) : (
                  <>
                    <FaGoogle />
                    Sign in with Google
                  </>
                )}
              </button>
            )}
          />
        )} */}
        
        {message && (
          <div
            className={`auth-message ${messageType} ${message ? "show" : ""}`}
          >
            {message}
          </div>
        )}
        
        {!isLoading && (
          <div className="auth-nav">
            {view !== "login" && (
              <span
                className={`auth-nav-item ${view === "login" ? "active" : ""}`}
                onClick={() => changeView("login")}
              >
                Login
              </span>
            )}
            {view !== "signup" && (
              <span
                className={`auth-nav-item ${view === "signup" ? "active" : ""}`}
                onClick={() => changeView("signup")}
              >
                Sign Up
              </span>
            )}
            {view !== "forgot-password" && (
              <span
                className={`auth-nav-item ${
                  view === "forgot-password" ? "active" : ""
                }`}
                onClick={() => changeView("forgot-password")}
              >
                Forgot Password?
              </span>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default AuthForm;