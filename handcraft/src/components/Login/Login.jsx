import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Image1 from "../../assets/front/login.png"; 
import Image2 from "../../assets/front/signup.png";
import styles from "./Login.module.css"; 
import "@fortawesome/fontawesome-free/css/all.min.css";
import axiosInstance from "../../axiosInstance";
import Snackbar from "../Snackbar/Snackbar";
import { setAuthToken } from "../../utils/auth";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../firebase";

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const [snackbar, setSnackbar] = useState({ show: false, message: "", type: "" });

  // Check for pre-filled email from registration
  useEffect(() => {
    const state = location.state;
    if (state?.registeredEmail) {
      setEmail(state.registeredEmail);
      setIsSignUp(false);
    }
  }, [location]);

  const showSnackbar = (message, type) => {
    setSnackbar({ show: true, message, type });
  };

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Extract relevant user info
      const userData = {
        username: user.displayName,
        email: user.email,
        profilePicture: user.photoURL,
        googleId: user.uid,
        isGoogleUser: true
      };
      
      try {
        // Send user data to backend to save in DB
        const response = await axiosInstance.post("/api/auth/google-login", userData);
        
        // Get the token from the response
        const token = response.data.token;
        
        // Store the token
        setAuthToken(token, false);
        
        // Dispatch login state change event
        window.dispatchEvent(new Event('loginStateChanged'));
        showSnackbar("Google login successful!", "success");
        navigate('/');
      } catch (dbError) {
        console.error("Error saving Google user to database:", dbError);
        showSnackbar("Error saving user data", "error");
      }
    } catch (error) {
      console.error("Google sign in error:", error);
      showSnackbar("Google login failed. Please try again.", "error");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post("/api/auth/login", { email, password });
      if (response.data.token) {
        setAuthToken(response.data.token, false);
        window.dispatchEvent(new Event('loginStateChanged'));
        showSnackbar("Login successful!", "success");
        navigate('/');
      }
    } catch (err) {
      console.error("Login error:", err);
      let errorMessage = "Invalid login credentials";
      
      if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message;
      }
      
      showSnackbar(errorMessage, "error");
    }
  };
  
  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      // Validate password length before sending to server
      if (password.length < 6) {
        showSnackbar("Password must be at least 6 characters", "error");
        return;
      }
      
      const response = await axiosInstance.post("/api/auth/register", { name: username, email, password });
      if (response.data.token) {
        setAuthToken(response.data.token, false);
        window.dispatchEvent(new Event('loginStateChanged'));
        showSnackbar("Registration successful! Please login.", "success");
        setUsername("");
        setPassword("");
        navigate("/login", { state: { registeredEmail: email } });
      }
    } catch (error) {
      console.error("Registration error:", error);
      // Extract and display specific error message from the server response
      let errorMessage = "Registration failed. Please try again.";
      
      if (error.response && error.response.data) {
        // Check for the new error format
        if (error.response.data.errors && Object.keys(error.response.data.errors).length > 0) {
          // Get the first validation error
          const firstErrorKey = Object.keys(error.response.data.errors)[0];
          errorMessage = error.response.data.errors[firstErrorKey];
        }
        // Check for message field
        else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
        // Fall back to the error field
        else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        }
      }
      
      showSnackbar(errorMessage, "error");
    }
  };

  return (
    <div className={`${styles.container} ${isSignUp ? styles["sign-up-mode"] : ""}`}>
      {snackbar.show && (
        <Snackbar
          message={snackbar.message}
          type={snackbar.type}
          onClose={() => setSnackbar({ ...snackbar, show: false })}
        />
      )}
      <div className={styles["forms-container"]}>
        <div className={styles["signin-signup"]}>
          {/* Sign In Form */}
          <form onSubmit={handleLogin} className={styles["sign-in-form"]}>
            <h2 className={styles.title}>Sign in</h2>
            <div className={styles["input-field"]}>
              <i className="fas fa-user"></i>
              <input type="email" placeholder="Email ID" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className={styles["input-field"]}>
              <i className="fas fa-lock"></i>
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <input type="submit" value="Login" className={`${styles.btn} ${styles.solid}`} />
            
            <p className={styles["social-text"]}>Or Sign in with social platforms</p>
            <div className={styles["social-media"]}>
              <button type="button" onClick={handleGoogleSignIn} className={styles["social-icon"]}>
                <i className="fab fa-google"></i>
              </button>
            </div>

            <p className={styles["forgot-password"]}>
              <Link to="/Forgot">Forgot Password?</Link>
            </p>
          </form>

          {/* Sign Up Form */}
          <form onSubmit={handleSignUp} className={styles["sign-up-form"]}>
            <h2 className={styles.title}>Sign up</h2>
            <div className={styles["input-field"]}>
              <i className="fas fa-user"></i>
              <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
            <div className={styles["input-field"]}>
              <i className="fas fa-envelope"></i>
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className={styles["input-field"]}>
              <i className="fas fa-lock"></i>
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <input type="submit" className={styles.btn} value="Sign up" />
            
            <p className={styles["social-text"]}>Or Sign up with social platforms</p>
            <div className={styles["social-media"]}>
              <button type="button" onClick={handleGoogleSignIn} className={styles["social-icon"]}>
                <i className="fab fa-google"></i>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Panels Section */}
      <div className={styles["panels-container"]}>
        <div className={`${styles.panel} ${styles["left-panel"]}`}>
          <div className={styles.content}>
            <h3>New here?</h3>
            <p>Join us today and explore great opportunities!</p>
            <button className={`${styles.btn} ${styles.transparent}`} onClick={() => setIsSignUp(true)}>
              Sign up
            </button>
          </div>
          <img src={Image1} className={styles.image} alt="Sign Up Illustration" />
        </div>
        <div className={`${styles.panel} ${styles["right-panel"]}`}>
          <div className={styles.content}>
            <h3>One of us?</h3>
            <p>Welcome back! Sign in to continue.</p>
            <button className={`${styles.btn} ${styles.transparent}`} onClick={() => setIsSignUp(false)}>
              Sign in
            </button>
          </div>
          <img src={Image2} className={styles.image} alt="Sign In Illustration" />
        </div>
      </div>
    </div>
  );
};

export default Login;
