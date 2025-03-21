import React, { useEffect } from 'react';
import styles from './Snackbar.module.css';

const Snackbar = ({ message, type, onClose, duration = 4000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  // Get the appropriate icon based on message type
  const getIcon = () => {
    if (type === 'success') {
      return <i className="fas fa-check-circle"></i>;
    } else if (type === 'error') {
      return <i className="fas fa-exclamation-circle"></i>;
    } else {
      return <i className="fas fa-info-circle"></i>;
    }
  };

  return (
    <div className={`${styles.snackbar} ${styles[type]}`}>
      <div className={styles.content}>
        <span className={styles.icon}>{getIcon()}</span>
        <span className={styles.message}>{message}</span>
      </div>
      <button className={styles.closeButton} onClick={onClose}>
        <i className="fas fa-times"></i>
      </button>
    </div>
  );
};

export default Snackbar; 