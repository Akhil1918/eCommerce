import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaUserCircle, FaPaperPlane, FaSpinner, FaCheck, FaCheckDouble } from "react-icons/fa";
import { io } from "socket.io-client";
import axiosInstance from "../../axiosInstance";
import { getAuthToken } from "../../utils/auth";
import styles from "./Chatbox.module.css";

const Chatbox = () => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connected, setConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socketConnected, setSocketConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [typingUsers, setTypingUsers] = useState({});
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [userRole, setUserRole] = useState('');
  const typingTimeoutRef = useRef(null);

  const socket = useRef(null);
  const messageEndRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const token = getAuthToken();

  // Check user role on component mount
  useEffect(() => {
    const role = localStorage.getItem('userRole');
    setUserRole(role || '');
    
    // Redirect admin users away from messages
    if (role === 'admin') {
      navigate('/dashboard');
    }
  }, [navigate]);

  // If user is admin, show access denied
  if (userRole === 'admin') {
    return (
      <div className="container mx-auto my-8 px-4">
        <div className="bg-red-100 border border-red-400 rounded text-red-700 px-4 py-3 mb-4">
          <p className="font-bold">Access Denied</p>
          <p>Admin accounts cannot access the messaging system.</p>
        </div>
        <button 
          onClick={() => navigate('/dashboard')}
          className="bg-indigo-600 rounded-md text-white hover:bg-indigo-700 px-6 py-2 transition-colors"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  // Initialize socket connection
  useEffect(() => {
    // Only connect if user is logged in
    if (!token) return;

    const initializeSocket = () => {
      try {
        // Connect to socket server
        socket.current = io("http://localhost:7777", {
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          timeout: 20000,
          auth: { token },
          withCredentials: true,
          transports: ['websocket', 'polling'] // Try WebSocket first, fallback to polling
        });
        
        // Setup socket event listeners
        socket.current.on("connect", () => {
          console.log("Socket connected");
          setSocketConnected(true);
          setReconnectAttempts(0);
          
          // Authenticate with token
          socket.current.emit("authenticate", token);
        });
        
        socket.current.on("authenticated", (response) => {
          if (response.success) {
            setConnected(true);
            console.log("Socket authenticated");
            
            // Store user ID in socket for reference
            socket.current.userId = response.userId;
          } else {
            console.error("Socket authentication failed", response.error);
            setError("Authentication failed. Please refresh the page.");
          }
        });
        
        socket.current.on("onlineUsers", (users) => {
          setOnlineUsers(new Set(users));
        });
        
        socket.current.on("userStatus", (data) => {
          setOnlineUsers(prev => {
            const newSet = new Set(prev);
            if (data.isOnline) {
              newSet.add(data.userId);
            } else {
              newSet.delete(data.userId);
            }
            return newSet;
          });
        });
        
        socket.current.on("userTyping", (data) => {
          setTypingUsers(prev => ({
            ...prev,
            [data.chatId]: data.userId
          }));
        });
        
        socket.current.on("userStoppedTyping", (data) => {
          setTypingUsers(prev => {
            const newTyping = { ...prev };
            if (newTyping[data.chatId] === data.userId) {
              delete newTyping[data.chatId];
            }
            return newTyping;
          });
        });
        
        socket.current.on("newMessage", (data) => {
          // Update chat with new message
          setChats(prevChats => {
            return prevChats.map(chat => {
              if (chat._id === data.chat._id) {
                return data.chat;
              }
              return chat;
            });
          });
          
          // If this chat is currently selected, update it and scroll to bottom
          if (selectedChat && selectedChat._id === data.chat._id) {
            setSelectedChat(data.chat);
            scrollToBottom();
            
            // Mark as read if we're looking at this chat
            socket.current.emit("markAsRead", data.chat._id);
            markChatAsRead(data.chat._id);
          } else {
            // Otherwise, increment unread count
            setUnreadCount(prev => prev + 1);
          }
          
          // Clear typing indicator since a message was received
          setTypingUsers(prev => {
            const newTyping = { ...prev };
            delete newTyping[data.chat._id];
            return newTyping;
          });
        });
        
        socket.current.on("messageNotification", (data) => {
          // Show browser notification for new message if window is not focused
          if (!document.hasFocus() && Notification.permission === "granted") {
            const notification = new Notification("New Message", {
              body: `${data.sender.name}: ${data.message.content.slice(0, 50)}${data.message.content.length > 50 ? '...' : ''}`,
              icon: data.product.image
            });
            
            notification.onclick = () => {
              navigate(`/messages?chatId=${data.chatId}`);
              window.focus();
            };
          }
          
          // Play notification sound
          playNotificationSound();
          
          // Update unread count
          setUnreadCount(prev => prev + 1);
        });
        
        socket.current.on("messagesRead", (data) => {
          // Update chat with read status
          if (selectedChat && selectedChat._id === data.chatId) {
            setSelectedChat(prev => {
              const messages = prev.messages.map(msg => {
                if (!msg.readBy.includes(data.userId)) {
                  return {
                    ...msg,
                    readBy: [...msg.readBy, data.userId]
                  };
                }
                return msg;
              });
              
              return {
                ...prev,
                messages,
                unreadCount: {
                  ...prev.unreadCount,
                  [data.userId === prev.buyer._id ? 'buyer' : 'seller']: 0
                }
              };
            });
          }
        });
        
        socket.current.on("connect_error", (error) => {
          console.error("Socket connection error:", error);
          setSocketConnected(false);
          setConnected(false);
          setError("Connection error. Attempting to reconnect...");
          setReconnectAttempts(prev => prev + 1);
        });
        
        socket.current.on("disconnect", () => {
          console.log("Socket disconnected");
          setSocketConnected(false);
          setConnected(false);
        });
        
        socket.current.on("error", (error) => {
          console.error("Socket error:", error);
          setError("Communication error. Please try again.");
        });
      } catch (error) {
        console.error("Error initializing socket:", error);
        setSocketConnected(false);
        setConnected(false);
        setError("Failed to connect to chat service. Using fallback polling method.");
        
        // Setup polling as fallback
        setupPollingFallback();
      }
    };
    
    // Fallback to regular polling if WebSockets fail
    const setupPollingFallback = () => {
      console.log("Setting up polling fallback for chat");
      
      // Set up polling interval for messages
      const pollInterval = setInterval(async () => {
        try {
          if (!selectedChat) return;
          
          const response = await axiosInstance.get(`/api/chat/${selectedChat._id}`);
          if (response.data.success) {
            setSelectedChat(response.data.chat);
          }
        } catch (err) {
          console.error("Error polling chat:", err);
        }
      }, 3000);
      
      // Clean up interval on component unmount
      return () => clearInterval(pollInterval);
    };
    
    initializeSocket();
    
    // Request notification permission
    requestNotificationPermission();
    
    // Cleanup socket connection on unmount
    return () => {
      try {
        if (socket.current && typeof socket.current.disconnect === 'function') {
          socket.current.disconnect();
        }
      } catch (err) {
        console.error("Error disconnecting socket:", err);
      }
      
      // Clear any active timeouts
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [token, reconnectAttempts, navigate, selectedChat]);

  // Fetch chats from API
  useEffect(() => {
    if (!token) return;
    
    const fetchChats = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/api/chat");
        
        if (response.data.success) {
          setChats(response.data.chats);
          setUnreadCount(response.data.totalUnread);
        } else {
          setError("Failed to fetch chats");
        }
      } catch (err) {
        console.error("Error fetching chats:", err);
        setError("Error loading chats. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchChats();
    
    // Set up periodic refresh (every 60 seconds)
    const refreshInterval = setInterval(fetchChats, 60000);
    
    return () => clearInterval(refreshInterval);
  }, [token]);

  // Join chat room when a chat is selected
  useEffect(() => {
    if (socket.current && connected && selectedChat) {
      socket.current.emit("joinChat", selectedChat._id);
      
      // Mark as read
      if (selectedChat.messages.length > 0) {
        socket.current.emit("markAsRead", selectedChat._id);
        
        // Also call API to ensure it's marked as read
        markChatAsRead(selectedChat._id);
      }
    }
  }, [selectedChat, connected]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [selectedChat?.messages]);

  // Check for URL parameters to open chat with specific ID
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const chatId = searchParams.get('chatId');
    
    if (chatId && chats.length > 0) {
      const chat = chats.find(c => c._id === chatId);
      if (chat) {
        setSelectedChat(chat);
      }
    }
  }, [location.search, chats]);

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const markChatAsRead = async (chatId) => {
    try {
      await axiosInstance.put(`/api/chat/${chatId}/read`);
      
      // Update the unread count
      const newChats = chats.map(chat => {
        if (chat._id === chatId) {
          // Determine if current user is buyer or seller
          const isBuyer = chat.buyer._id === (socket.current?.userId);
          
          return {
            ...chat,
            unreadCount: {
              ...chat.unreadCount,
              [isBuyer ? 'buyer' : 'seller']: 0
            }
          };
        }
        return chat;
      });
      
      setChats(newChats);
      
      // Recalculate total unread count
      const totalUnread = newChats.reduce((total, chat) => {
        const isBuyer = chat.buyer._id === (socket.current?.userId);
        return total + (isBuyer ? chat.unreadCount.buyer : chat.unreadCount.seller);
      }, 0);
      
      setUnreadCount(totalUnread);
    } catch (err) {
      console.error("Error marking chat as read:", err);
    }
  };

  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
    
    // Mark as read when selected
    if (chat.messages.length > 0) {
      markChatAsRead(chat._id);
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    
    // Send typing indicator
    if (selectedChat && connected && !isTyping) {
      setIsTyping(true);
      socket.current.emit("typing", selectedChat._id);
    }
    
    // Reset typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set timeout to clear typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 2000);
  };

  const sendMessage = () => {
    if (!input.trim() || !selectedChat || !connected) return;
    
    // Send message via socket
    socket.current.emit("sendMessage", {
      chatId: selectedChat._id,
      content: input.trim()
    });
    
    // Clear input and typing indicator
    setInput("");
    setIsTyping(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const playNotificationSound = () => {
    try {
      const audio = new Audio('/notification.mp3');
      audio.play();
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getRelativeTime = (timestamp) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString(undefined, { weekday: 'long' });
    } else {
      return date.toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(price);
  };

  const isBuyer = (chat) => {
    if (!chat || !socket.current) return false;
    return chat.buyer._id === socket.current.userId;
  };

  const getOtherParticipant = (chat) => {
    if (!chat || !socket.current) return { name: 'Unknown' };
    return isBuyer(chat) ? chat.seller : chat.buyer;
  };

  const isUserOnline = (userId) => {
    return onlineUsers.has(userId);
  };

  const isUserTyping = (chatId) => {
    return typingUsers[chatId] !== undefined;
  };

  const requestNotificationPermission = async () => {
    try {
      if (Notification && Notification.permission !== "granted" && Notification.permission !== "denied") {
        const permission = await Notification.requestPermission();
        console.log("Notification permission:", permission);
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
    }
  };

  if (!token) {
    return (
      <div className="flex flex-col h-screen justify-center items-center">
        <h2 className="text-2xl font-bold mb-4">Login Required</h2>
        <p className="mb-4">Please login to access your messages</p>
        <button 
          onClick={() => navigate('/login')}
          className="bg-gradient-to-r rounded-md text-white from-primary px-6 py-2 to-secondary"
        >
          Login
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto my-8 px-4">
      <h1 className="text-3xl font-bold mb-6">
        Messages
        {unreadCount > 0 && (
          <span className="bg-blue-600 rounded-full text-sm text-white ml-2 px-2 py-1">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </h1>
      
      {/* Connection status */}
      {!socketConnected && (
        <div className={styles.connectionStatus + " w-full mb-4"}>
          <FaSpinner className={styles.spinnerIcon} />
          {error ? error : "Connecting to messaging service..."}
          {reconnectAttempts > 0 && (
            <div className={styles.reconnectInfo}>
              Attempt {reconnectAttempts}/5
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col bg-white rounded-lg shadow-lg lg:flex-row overflow-hidden" style={{height: 'calc(100vh - 200px)'}}>
        {/* Chat list */}
        <div className="border-gray-200 border-r lg:w-1/3 overflow-y-auto" style={{maxHeight: 'calc(100vh - 200px)'}}>
          {loading ? (
            <div className="flex h-full justify-center items-center">
              <FaSpinner className={`${styles.spinnerIcon} text-indigo-600 text-2xl`} />
            </div>
          ) : error ? (
            <div className="p-4 text-center text-red-500">
              {error}
            </div>
          ) : chats.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No conversations yet
            </div>
          ) : (
            <ul>
              {chats.map((chat) => {
                const otherUser = getOtherParticipant(chat);
                const userUnreadCount = isBuyer(chat) ? chat.unreadCount.buyer : chat.unreadCount.seller;
                const lastMessage = chat.messages.length > 0 ? chat.messages[chat.messages.length - 1] : null;
                
                return (
                  <li 
                    key={chat._id}
                    className={`p-4 border-b border-gray-200 cursor-pointer ${selectedChat && selectedChat._id === chat._id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''} ${userUnreadCount > 0 ? 'bg-blue-50 font-medium' : ''}`}
                    onClick={() => handleChatSelect(chat)}
                  >
                    <div className="flex gap-3 items-start">
                      <div className="flex-shrink-0 relative">
                        {otherUser.profileImage ? (
                          <img 
                            src={otherUser.profileImage} 
                            alt={otherUser.name} 
                            className="h-12 rounded-full w-12 object-cover"
                          />
                        ) : (
                          <FaUserCircle className="h-12 text-gray-400 w-12" />
                        )}
                        
                        {/* Online indicator */}
                        {isUserOnline(otherUser._id) && (
                          <span className="bg-green-500 border-2 border-white h-3 rounded-full w-3 absolute bottom-0 right-0"></span>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                          <span className="text-gray-900 font-medium truncate">{otherUser.name}</span>
                          {lastMessage && (
                            <span className="text-gray-500 text-xs">
                              {formatTimestamp(lastMessage.createdAt)}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex justify-between items-center mt-1">
                          {isUserTyping(chat._id) ? (
                            <span className="text-blue-600 text-xs animate-pulse italic">
                              typing...
                            </span>
                          ) : lastMessage ? (
                            <>
                              <span className="text-gray-600 text-sm max-w-[80%] truncate">
                                {lastMessage.content.length > 30 ? 
                                  `${lastMessage.content.substring(0, 30)}...` : 
                                  lastMessage.content}
                              </span>
                              
                              {userUnreadCount > 0 && (
                                <span className="bg-blue-600 rounded-full text-center text-white text-xs min-w-[20px] px-2 py-1">
                                  {userUnreadCount}
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-gray-400 text-xs italic">
                              No messages yet
                            </span>
                          )}
                        </div>
                        
                        <div className="text-gray-500 text-xs mt-1">
                          {chat.product.name} - {formatPrice(chat.product.price)}
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Chat content */}
        <div className="flex flex-col lg:w-2/3" style={{maxHeight: 'calc(100vh - 200px)'}}>
          {selectedChat ? (
            <>
              {/* Chat header with product info */}
              <div className="bg-gray-50 border-b border-gray-200 p-4">
                <div className="flex justify-between items-center">
                  <div className="flex gap-3 items-center">
                    <div className="bg-gray-100 h-12 rounded w-12 overflow-hidden">
                      <img
                        src={selectedChat.product.image}
                        alt={selectedChat.product.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="text-gray-900 font-medium">
                        {selectedChat.product.name}
                      </h3>
                      <p className="text-blue-600 text-sm font-medium">
                        {formatPrice(selectedChat.product.price)}
                      </p>
                    </div>
                  </div>
                  <div className="text-gray-600 text-sm">
                    <span className="font-medium">
                      {isBuyer(selectedChat) ? 'Seller' : 'Buyer'}:
                    </span>{' '}
                    {getOtherParticipant(selectedChat).name}
                    {isUserOnline(getOtherParticipant(selectedChat)._id) && (
                      <span className="text-green-600 font-medium ml-2">
                        (online)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto">
                {selectedChat.messages.length === 0 ? (
                  <div className="flex flex-col h-full justify-center text-gray-500 items-center">
                    <p className="text-lg">No messages yet</p>
                    <p className="text-sm mt-1">Start the conversation by sending a message</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedChat.messages.map((msg, index) => {
                      const isCurrentUser = msg.sender === (socket.current?.userId);
                      const showTimestamp = index === 0 || 
                        new Date(msg.createdAt).getDate() !== 
                        new Date(selectedChat.messages[index - 1].createdAt).getDate();
                        
                      return (
                        <React.Fragment key={index}>
                          {showTimestamp && (
                            <div className="flex justify-center my-4">
                              <span className="bg-gray-200 rounded-full text-gray-600 text-xs px-3 py-1">
                                {getRelativeTime(msg.createdAt)}
                              </span>
                            </div>
                          )}
                          <div
                            className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[80%] px-4 py-2 rounded-lg ${
                                isCurrentUser ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              <p className="break-words">{msg.content}</p>
                              <div className={`flex items-center text-xs mt-1 ${
                                isCurrentUser ? 'text-blue-200 justify-end' : 'text-gray-500'
                              }`}>
                                {formatTimestamp(msg.createdAt)}
                                {isCurrentUser && (
                                  <span className="ml-1">
                                    {msg.readBy.includes(getOtherParticipant(selectedChat)._id) ? 
                                      <FaCheckDouble size={12} className="text-blue-300" /> : 
                                      <FaCheck size={12} className="text-blue-200" />}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </React.Fragment>
                      );
                    })}
                    
                    {/* Typing indicator */}
                    {isUserTyping(selectedChat._id) && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 rounded-lg px-4 py-2">
                          <div className="flex space-x-1">
                            <div className="bg-gray-500 h-2 rounded-full w-2 animate-bounce"></div>
                            <div className="bg-gray-500 h-2 rounded-full w-2 animate-bounce" style={{animationDelay: '0.2s'}}></div>
                            <div className="bg-gray-500 h-2 rounded-full w-2 animate-bounce" style={{animationDelay: '0.4s'}}></div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={messageEndRef} />
                  </div>
                )}
              </div>

              {/* Input box */}
              <div className="bg-white border-gray-200 border-t p-4">
                <div className="flex items-center">
                  <input
                    type="text"
                    value={input}
                    onChange={handleInputChange}
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 border border-gray-300 rounded-l-lg focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 px-4 py-2"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!connected || !input.trim()}
                    className={`px-4 py-2 rounded-r-lg flex items-center justify-center ${
                      !connected || !input.trim() ? 'bg-gray-300 text-gray-500' : 'bg-blue-600 text-white'
                    }`}
                  >
                    {connected ? <FaPaperPlane /> : <FaSpinner className="animate-spin" />}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col h-full justify-center text-gray-500 items-center">
              <FaUserCircle className="text-5xl text-gray-300 mb-3" />
              <p className="text-lg">Select a conversation</p>
              <p className="text-sm">Or start a new one from a product page</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chatbox;
