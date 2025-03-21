/**
 * Authentication utility functions
 */

/**
 * Get the authentication token from storage
 * Checks sessionStorage first, then localStorage as fallback
 * @returns {string|null} The authentication token or null if not found
 */
export const getAuthToken = () => {
  return sessionStorage.getItem('token') || localStorage.getItem('token') || null;
};

/**
 * Set the authentication token in storage
 * @param {string} token - The token to store
 * @param {boolean} rememberMe - Whether to store in localStorage (true) or sessionStorage (false)
 */
export const setAuthToken = (token, rememberMe = false) => {
  // First, clear all existing tokens
  removeAuthToken();
  
  // Then set the new token in the appropriate storage
  if (rememberMe) {
    localStorage.setItem('token', token);
  } else {
    sessionStorage.setItem('token', token);
  }
};

/**
 * Remove the authentication token from storage
 * Removes all tokens from both sessionStorage and localStorage
 */
export const removeAuthToken = () => {
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
  
  console.log('All tokens removed from storage');
};

/**
 * Check if the user is authenticated
 * @returns {boolean} Whether the user is authenticated
 */
export const isAuthenticated = () => {
  const token = getAuthToken();
  return !!token;
}; 