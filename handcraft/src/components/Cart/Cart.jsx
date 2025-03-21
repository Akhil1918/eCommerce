import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaTrash, FaPlus, FaMinus, FaArrowLeft, FaShieldAlt, FaEye, FaTags, FaShoppingBag } from "react-icons/fa";
import axiosInstance from "../../axiosInstance";

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionError, setConnectionError] = useState(false);
  
  // Helper function to format category and subcategory names
  const formatName = (name) => {
    if (!name) return '';
    return name
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  // Fetch cart items from backend
  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        setLoading(true);
        setConnectionError(false);
        
        // Try to get pending items from localStorage
        const pendingItems = JSON.parse(localStorage.getItem('pendingCartItems') || '[]');
        
        const response = await axiosInstance.get('/api/cart');
        if (response.data.success) {
          setCartItems(response.data.items);
          
          // If we have pending items and successful connection, add them to cart
          if (pendingItems.length > 0) {
            // For each pending item, add to cart
            for (const item of pendingItems) {
              try {
                await axiosInstance.post('/api/cart/add', {
                  productId: item.productId,
                  quantity: item.quantity
                });
              } catch (err) {
                console.error('Error adding pending item to cart:', err);
              }
            }
            
            // Clear pending items
            localStorage.removeItem('pendingCartItems');
            
            // Refresh cart
            const updatedResponse = await axiosInstance.get('/api/cart');
            if (updatedResponse.data.success) {
              setCartItems(updatedResponse.data.items);
            }
          }
        } else {
          setError('Failed to load cart items');
        }
      } catch (err) {
        console.error('Error fetching cart:', err);
        
        // Check if it's a connection error
        if (err.message && err.message.includes('Network Error')) {
          setConnectionError(true);
          
          // If offline, try to show pending items
          try {
            const pendingItems = JSON.parse(localStorage.getItem('pendingCartItems') || '[]');
            if (pendingItems.length > 0) {
              setCartItems(pendingItems);
            } else {
              setCartItems([]);
            }
          } catch (localStorageError) {
            console.error('Error reading from localStorage:', localStorageError);
            setCartItems([]);
          }
        } else if (err.response && err.response.status === 401) {
          // Handle unauthorized - redirect to login
          navigate('/login');
        } else {
          setError('Error loading cart. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchCartItems();
  }, [navigate]);
  
  // Calculate cart totals
  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const shipping = subtotal > 0 ? 40 : 0;
  const discount = subtotal > 5000 ? 5000 : 0;
  const totalAmount = subtotal + shipping - discount;
  const savedAmount = discount;
  
  // Handle quantity update
  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      // Optimistically update UI first
      setCartItems(
        cartItems.map(item => 
          item.productId === productId ? { ...item, quantity: newQuantity } : item
        )
      );
      
      // Then send request to server
      const response = await axiosInstance.put('/api/cart/update', {
        productId,
        quantity: newQuantity
      });
      
      if (!response.data.success) {
        // If server update fails, revert to original quantity
        setCartItems(
          cartItems.map(item => item)
        );
        setError('Failed to update quantity');
      }
    } catch (err) {
      console.error('Error updating cart:', err);
      
      // Revert changes on error
      setCartItems(
        cartItems.map(item => item)
      );
      
      if (connectionError || (err.message && err.message.includes('Network Error'))) {
        setConnectionError(true);
      } else {
        setError('Error updating cart. Please try again later.');
      }
    }
  };
  
  // Remove item from cart
  const removeItem = async (productId) => {
    try {
      // Optimistically update UI first
      const updatedItems = cartItems.filter(item => item.productId !== productId);
      setCartItems(updatedItems);
      
      // Then send request to server
      const response = await axiosInstance.delete(`/api/cart/${productId}`);
      
      if (!response.data.success) {
        // If server update fails, revert to original items
        setError('Failed to remove item');
      }
    } catch (err) {
      console.error('Error removing item:', err);
      
      if (connectionError || (err.message && err.message.includes('Network Error'))) {
        setConnectionError(true);
      } else {
        setError('Error removing item. Please try again later.');
      }
    }
  };
  
  // Handle place order
  const placeOrder = async () => {
    if (cartItems.length === 0) {
      setError('Your cart is empty');
      return;
    }
        
    try {
      navigate('/checkout');
    } catch (err) {
      console.error('Error navigating to checkout:', err);
      setError('Error processing checkout. Please try again later.');
    }
  };
  
  // Continue shopping
  const continueShopping = () => {
    navigate('/products/art');
  };

  // Navigate to product details
  const viewProductDetails = (productId) => {
    navigate(`/product/${productId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>
      
      {connectionError && (
        <div className="bg-yellow-100 border border-yellow-400 rounded text-yellow-700 mb-4 px-4 py-3">
          <p className="font-bold">Connection Issue</p>
          <p>We&apos;re having trouble connecting to the server. Your cart will be saved when the connection is restored.</p>
        </div>
      )}
      
      {loading ? (
        <div className="flex h-64 justify-center items-center">
          <div className="border-b-2 border-indigo-500 border-t-2 h-12 rounded-full w-12 animate-spin"></div>
        </div>
      ) : error && !connectionError ? (
        <div className="bg-red-100 border border-red-400 rounded text-red-700 mb-4 px-4 py-3">
          {error}
        </div>
      ) : cartItems.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm text-center py-12">
          <div className="bg-gray-100 h-24 justify-center rounded-full w-24 inline-flex items-center mb-6">
            <FaShoppingBag className="text-4xl text-gray-400" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Looks like you haven&apos;t added anything to your cart yet.</p>
          <button 
            onClick={continueShopping}
            className="bg-indigo-600 rounded-md text-white hover:bg-indigo-700 px-6 py-2 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Cart Items */}
          <div className="lg:w-2/3">
            <div className="bg-white p-6 rounded-lg shadow-sm mb-4">
              <div className="flex border-b justify-between items-center pb-4">
                <h2 className="text-xl font-semibold">Items ({cartItems.length})</h2>
                <button 
                  onClick={continueShopping}
                  className="flex text-indigo-600 gap-1 hover:text-indigo-800 items-center"
                >
                  <FaArrowLeft size={14} /> Continue Shopping
                </button>
              </div>
              
              {cartItems.map((item) => (
                <div key={item.productId} className="flex border-b rounded-md hover:bg-gray-50 px-3 py-6 transition-colors">
                  <div className="flex-shrink-0 border border-gray-200 h-24 rounded-md w-24 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-center object-contain"
                    />
                  </div>
                  
                  <div className="flex flex-1 flex-col ml-4">
                    <div className="flex justify-between text-base text-gray-900 font-medium">
                      <h3 className="hover:text-indigo-600 transition-colors">{item.name}</h3>
                      <p className="ml-4">₹{item.price.toFixed(2)}</p>
                    </div>
                    
                    <div className="flex text-gray-500 text-sm gap-1 items-center mt-1">
                      <FaTags size={12} className="text-indigo-500" />
                      <span className="text-indigo-600 font-medium">{formatName(item.category)}</span>
                      {item.subcategory && (
                        <>
                          <span className="mx-1">•</span>
                          <span>{formatName(item.subcategory)}</span>
                        </>
                      )}
                    </div>
                    
                    <div className="flex flex-1 justify-between text-sm items-end mt-4">
                      <div className="flex gap-3 items-center">
                        <div className="flex border rounded-md items-center">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="text-gray-600 hover:bg-gray-100 px-3 py-1"
                            disabled={item.quantity <= 1}
                          >
                            <FaMinus size={12} />
                          </button>
                          <span className="border-l border-r px-3 py-1">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="text-gray-600 hover:bg-gray-100 px-3 py-1"
                          >
                            <FaPlus size={12} />
                          </button>
                        </div>
                        
                        <button
                          onClick={() => viewProductDetails(item.productId)}
                          className="text-indigo-600 hover:text-indigo-800 transition-colors"
                          title="View product details"
                          aria-label={`View details of ${item.name}`}
                        >
                          <FaEye size={18} />
                        </button>
                      </div>
                      
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                        title="Remove from cart"
                      >
                        <FaTrash size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white p-6 rounded-lg shadow-sm sticky top-4">
              <h2 className="text-xl font-semibold mb-4">Price Details</h2>
              
              <div className="border-b pb-4 space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Price ({cartItems.length} items)</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Charges</span>
                  <span className={shipping === 0 ? "text-green-500" : ""}>
                    {shipping === 0 ? "FREE" : `₹${shipping.toFixed(2)}`}
                  </span>
                </div>
                
                {discount > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Discount</span>
                    <span className="text-green-500">- ₹{discount.toFixed(2)}</span>
                  </div>
                )}
              </div>
              
              <div className="flex border-b justify-between text-lg font-semibold py-4">
                <span>Total Amount</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>
              
              {savedAmount > 0 && (
                <div className="text-green-500 text-sm py-3">
                  You will save ₹{savedAmount.toFixed(2)} on this order
                </div>
              )}
              
              <div className="mt-4">
                <button
                  onClick={placeOrder}
                  className="bg-indigo-600 rounded-md text-white w-full hover:bg-indigo-700 py-3 transition-colors"
                >
                  PLACE ORDER
                </button>
              </div>
              
              <div className="flex text-gray-500 text-sm items-center mt-4">
                <FaShieldAlt className="text-gray-400 mr-2" />
                <span>Safe and Secure Payments. Easy returns. 100% Authentic products.</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
