import React, { useState } from "react";
import { FaLock } from "react-icons/fa";
import styles from "./Checkout.module.css";

const Checkout = () => {
  const [shippingDifferent, setShippingDifferent] = useState(false);

  const handleProceedToPayment = () => {
    const options = {
      key: "rzp_test_YourTestKeyHere", // 🔴 Replace with your Razorpay Test Key
      amount: 9000, // Amount in paise (9000 paise = ₹90)
      currency: "INR",
      name: "Handmade E-Commerce",
      description: "Purchase of Handmade Products",
      image: "https://yourlogo.com/logo.png", // Optional: Your brand logo
      handler: function (response) {
        alert("Payment Successful! Payment ID: " + response.razorpay_payment_id);
      },
      prefill: {
        name: "Avantika Nandakumar",
        email: "avantikanandkumar@gmail.com",
        contact: "9999999999",
      },
      theme: {
        color: "#3399cc",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <div className={styles.container}>
      <div className={styles.checkoutBox}>
        <h2 className={styles.title}>Secure Checkout</h2>

        {/* Billing Details */}
        <div className={styles.section}>
          <h3>Billing Address</h3>
          <div className={styles.inputGroup}>
            <input type="text" placeholder="First Name" required />
            <input type="text" placeholder="Last Name" required />
            <input type="email" placeholder="Email Address" required />
            <input type="text" placeholder="Address Line 1" required />
            <input type="text" placeholder="Address Line 2 (Optional)" />
            <input type="text" placeholder="City" required />
            <input type="text" placeholder="State" required />
            <input type="text" placeholder="Zip Code" required />
            <input type="text" placeholder="Mobile Phone" required />
          </div>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              onChange={() => setShippingDifferent(!shippingDifferent)}
            />
            Use a different shipping address
          </label>
        </div>

        {/* Shipping Details */}
        {shippingDifferent && (
          <div className={styles.section}>
            <h3>Shipping Address</h3>
            <div className={styles.inputGroup}>
              <input type="text" placeholder="First Name" required />
              <input type="text" placeholder="Last Name" required />
              <input type="text" placeholder="Address Line 1" required />
              <input type="text" placeholder="Address Line 2 (Optional)" />
              <input type="text" placeholder="City" required />
              <input type="text" placeholder="State" required />
              <input type="text" placeholder="Zip Code" required />
              <input type="text" placeholder="Mobile Phone" required />
            </div>
          </div>
        )}

        {/* Order Summary */}
        <div className={styles.summarySection}>
          <h3>Order Summary</h3>
          <div className={styles.orderSummary}>
            <p>Subtotal: <span>$85.00</span></p>
            <p>Shipping Fee: <span>FREE</span></p>
            <p>Tax: <span>$5.00</span></p>
            <p className={styles.total}>Total: <span>$90.00</span></p>
          </div>
          <button className={styles.proceedBtn} onClick={handleProceedToPayment}>
            <FaLock className={styles.lockIcon} /> Proceed to Pay
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
