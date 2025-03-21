import React, { useState } from "react";
import { Link } from "react-router-dom";
import Image1 from "../../assets/front/login.png"; // Import the image
import styles from "./Login.module.css"; 
import "@fortawesome/fontawesome-free/css/all.min.css";

const ForgetPassword = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Reset link sent to:", email);
    alert("A password reset link has been sent to your email.");
  };

  return (
    <div className={styles.container}>
      <div className={styles["forms-container"]}>
        <div className={styles["signin-signup"]}>
          <form className={styles["sign-in-form"]} onSubmit={handleSubmit}>
            <h2 className={styles.title}>Forgot Password?</h2>
            <p className={styles.description}>
              Enter your registered email address and we'll send you a link to reset your password.
            </p>
            <div className={styles["input-field"]}>
              <i className="fas fa-envelope"></i>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className={styles.btn}>Send Reset Link</button>
            <p className={styles["back-to-login"]}>
              <Link to="/login">Back to Login</Link>
            </p>
          </form>
        </div>
      </div>

      {/* ✅ Image Section (Like Login Page) */}
      <div className={styles["panels-container"]}>
        <div className={`${styles.panel} ${styles["left-panel"]}`}>
          <img src={Image1} className={styles.image} alt="Forgot Password Illustration" />
        </div>
      </div>
    </div>
  );
};

export default ForgetPassword;
