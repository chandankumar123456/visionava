import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ClipLoader, BeatLoader } from "react-spinners";
import "./ResetPassword.css"; // We'll create this CSS file

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Password strength checker
  const checkPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    setPasswordStrength(strength);
  };

  const handlePasswordChange = (e) => {
    const newValue = e.target.value;
    setNewPassword(newValue);
    checkPasswordStrength(newValue);
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (newPassword !== confirmPassword) {
      setMessage("Passwords don't match");
      setMessageType("error");
      return;
    }
    
    if (passwordStrength < 3) {
      setMessage("Please use a stronger password");
      setMessageType("error");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch(`http://localhost:3000/api/auth/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage(data.message || "Password reset successfully");
        setMessageType("success");
        
        // Show success animation before redirecting
        setTimeout(() => navigate("/"), 2000);
      } else {
        setMessage(data.message || "Failed to reset password");
        setMessageType("error");
      }
    } catch (error) {
      setMessage("Failed to connect to the server");
      setMessageType("error");
      console.log(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="reset-password-container">
      <div className="reset-card">
        <div className="card-header">
          <h2 className="card-title">Reset Your Password</h2>
          <p className="card-subtitle">Create a new secure password</p>
        </div>

        <form onSubmit={handleSubmit} className="reset-form">
          <div className="input-group">
            <div className="input-field">
              <input
                type={isPasswordVisible ? "text" : "password"}
                value={newPassword}
                onChange={handlePasswordChange}
                className="password-input"
                placeholder=" "
                required
                disabled={isLoading}
              />
              <label className="floating-label">New Password</label>
              <button 
                type="button" 
                className="toggle-visibility" 
                onClick={togglePasswordVisibility}
                disabled={isLoading}
              >
                {isPasswordVisible ? "Hide" : "Show"}
              </button>
            </div>
            
            {/* Password strength indicator */}
            <div className="password-strength-container">
              <div className="strength-bars">
                <div className={`strength-bar ${passwordStrength >= 1 ? "active" : ""}`}></div>
                <div className={`strength-bar ${passwordStrength >= 2 ? "active" : ""}`}></div>
                <div className={`strength-bar ${passwordStrength >= 3 ? "active" : ""}`}></div>
                <div className={`strength-bar ${passwordStrength >= 4 ? "active" : ""}`}></div>
              </div>
              <span className="strength-text">
                {passwordStrength === 0 && ""}
                {passwordStrength === 1 && "Weak"}
                {passwordStrength === 2 && "Fair"}
                {passwordStrength === 3 && "Good"}
                {passwordStrength === 4 && "Strong"}
              </span>
            </div>
          </div>

          <div className="input-group">
            <div className="input-field">
              <input
                type={isPasswordVisible ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="password-input"
                placeholder=" "
                required
                disabled={isLoading}
              />
              <label className="floating-label">Confirm Password</label>
            </div>
          </div>

          <button
            type="submit"
            className={`reset-button ${isLoading ? "loading" : ""}`}
            disabled={isLoading}
          >
            {isLoading ? <ClipLoader color="#ffffff" size={20} /> : "Reset Password"}
          </button>
        </form>

        {message && (
          <div className={`message-container ${messageType}`}>
            {messageType === "success" ? (
              <div className="success-animation">
                <div className="checkmark-circle">
                  <div className="checkmark"></div>
                </div>
                <p>{message}</p>
                <div className="redirect-loader">
                  <BeatLoader color="#4CAF50" size={8} />
                  <span>Redirecting to login page...</span>
                </div>
              </div>
            ) : (
              <p>{message}</p>
            )}
          </div>
        )}

        <div className="back-to-login">
          <Link to="/">Back to login</Link>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;