import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaLock, FaEdit, FaSave, FaTimes, FaShoppingCart } from "react-icons/fa";
import axiosInstance from "../axiosInstance";
import { getAuthToken } from "../utils/auth";
import Footer from "../components/Footer/Footer";
import AddressForm from "../components/AddressForm/AddressForm";

const Account = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
    addresses: [],
    profileImage: ""
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedUser, setEditedUser] = useState({});
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  
  // Fetch user profile
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      navigate("/login?redirect=account");
      return;
    }
    
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/api/auth/profile");
        
        console.log("Profile response:", response.data); // Debug log
        
        if (response.data.success) {
          const userData = response.data.user;
          console.log("User data received:", userData); // Debug log
          console.log("Addresses received:", userData.addresses); // Debug log
          
          setUser(userData);
          setEditedUser(userData);
          setError(null);
        } else {
          setError("Failed to load profile data: " + (response.data.message || "Unknown error"));
          console.log("API returned error:", response.data);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        
        // Check for specific error types
        if (err.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.log("Error response data:", err.response.data);
          console.log("Error response status:", err.response.status);
          
          if (err.response.status === 401) {
            setError("Your session has expired. Please log in again.");
            // Redirect to login after a short delay
            setTimeout(() => {
              navigate("/login?redirect=account");
            }, 2000);
            return;
          } else {
            setError(`Error ${err.response.status}: ${err.response.data.message || "Unable to load your profile"}`);
          }
        } else if (err.request) {
          // The request was made but no response was received
          setError("Network error. Please check your connection and try again.");
        } else {
          // Something happened in setting up the request that triggered an Error
          setError("Unable to load your profile. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProfile();

    // Add session expired event listener
    const handleSessionExpired = () => {
      showNotification("Your session has expired. Please log in again.", "error");
      // Redirect will be handled by axios interceptor
    };

    window.addEventListener('session-expired', handleSessionExpired);
    
    return () => {
      window.removeEventListener('session-expired', handleSessionExpired);
    };
  }, [navigate]);
  
  // Handle edit mode toggle
  const toggleEditMode = () => {
    if (editMode) {
      // Cancel edit - revert changes
      setEditedUser(user);
    }
    setEditMode(!editMode);
  };
  
  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes(".")) {
      // Handle nested object (address)
      const [parent, child] = name.split(".");
      setEditedUser(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setEditedUser(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const response = await axiosInstance.put("/api/auth/profile", editedUser);
      
      if (response.data.success) {
        setUser(editedUser);
        setEditMode(false);
        showNotification("Profile updated successfully", "success");
      } else {
        showNotification(response.data.message || "Failed to update profile", "error");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      showNotification("An error occurred while updating your profile", "error");
    } finally {
      setLoading(false);
    }
  };
  
  // Handle address update
  const handleAddressUpdate = (newAddresses) => {
    setUser(prev => ({
      ...prev,
      addresses: newAddresses
    }));
    showNotification("Addresses updated successfully", "success");
  };
  
  // Show notification
  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    
    // Auto hide after 3 seconds
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" });
    }, 3000);
  };

  if (loading && !user.name) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Your Account</h1>
            <p className="text-gray-600 mt-2">Manage your profile and account settings</p>
          </div>
          
          {/* Notification */}
          {notification.show && (
            <div className={`mb-6 p-4 rounded-lg ${
              notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {notification.message}
            </div>
          )}
          
          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-lg">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="md:col-span-2">
              {/* Profile Information */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-800">Profile Information</h2>
                  <button 
                    onClick={toggleEditMode}
                    className="flex items-center text-sm font-medium text-primary hover:text-primary-dark"
                  >
                    {editMode ? (
                      <>
                        <FaTimes className="mr-1" /> Cancel
                      </>
                    ) : (
                      <>
                        <FaEdit className="mr-1" /> Edit Profile
                      </>
                    )}
                  </button>
                </div>
                
                {editMode ? (
                  <form onSubmit={handleProfileUpdate}>
                    <div className="grid grid-cols-1 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaUser className="text-gray-400" />
                          </div>
                          <input 
                            type="text" 
                            name="name" 
                            value={editedUser.name || ''} 
                            onChange={handleInputChange}
                            className="pl-10 w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaEnvelope className="text-gray-400" />
                          </div>
                          <input 
                            type="email" 
                            name="email" 
                            value={editedUser.email || ''} 
                            onChange={handleInputChange}
                            className="pl-10 w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex justify-end">
                      <button 
                        type="submit" 
                        className="flex items-center bg-primary hover:bg-primary-dark text-white py-2 px-6 rounded-lg transition-colors"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div> Saving...
                          </>
                        ) : (
                          <>
                            <FaSave className="mr-2" /> Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                        <p className="mt-1 flex items-center">
                          <FaUser className="text-gray-400 mr-2" />
                          {user.name || "Not provided"}
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Email Address</h3>
                        <p className="mt-1 flex items-center">
                          <FaEnvelope className="text-gray-400 mr-2" />
                          {user.email || "Not provided"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Addresses Section */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Your Addresses</h2>
                <AddressForm 
                  addresses={user.addresses} 
                  onAddressUpdate={handleAddressUpdate}
                />
              </div>
              
              {/* Security Settings */}
              <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-800">Security Settings</h2>
                  <Link 
                    to="/forgot?from=profile" 
                    className="flex items-center text-sm font-medium text-primary hover:text-primary-dark"
                  >
                    <FaLock className="mr-1" /> Change Password
                  </Link>
                </div>
                
                <p className="text-gray-600">
                  Manage your account security settings and password here.
                </p>
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex flex-col items-center">
                  <div className="h-24 w-24 bg-gray-200 rounded-full overflow-hidden mb-4">
                    {user.profileImage ? (
                      <img 
                        src={user.profileImage} 
                        alt={user.name} 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex justify-center items-center">
                        <FaUser className="text-gray-400 text-4xl" />
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-medium">{user.name}</h3>
                  <p className="text-gray-500 text-sm">{user.email}</p>
                </div>
                
                <div className="mt-6 border-t pt-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-4">Account Links</h3>
                  <ul className="space-y-3">
                    <li>
                      <a 
                        href="/orders" 
                        className="flex items-center text-gray-600 hover:text-primary transition-colors"
                      >
                        <FaShoppingCart className="mr-2" />
                        Your Orders
                      </a>
                    </li>
                    <li>
                      <a 
                        href="/messages" 
                        className="flex items-center text-gray-600 hover:text-primary transition-colors"
                      >
                        <FaEnvelope className="mr-2" />
                        Messages
                      </a>
                    </li>
                    <li>
                      <Link 
                        to="/forgot?from=profile" 
                        className="flex items-center text-gray-600 hover:text-primary transition-colors"
                      >
                        <FaLock className="mr-2" />
                        Change Password
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Account; 