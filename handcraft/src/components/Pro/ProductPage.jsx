import { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import { ShoppingCart } from "lucide-react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Footer from "../Footer/Footer";
import { productService } from "../../services/api";
import axiosInstance from "../../axiosInstance";

// Category mapping for sidebar and display
const categoryMapping = {
  'home-living': {
    title: "Home & Living",
    sidebar: [
      "Home Decor",
      "Bedding and Pillows",
      "Kitchen & Dining",
      "Storage & Organization"
    ],
    description: "Explore our collection of home and living products that enhance your space."
  },
  clothing: {
    title: "Clothing",
    sidebar: [
      "Shirt",
      "Saree",
      "Kurthi sets",
      "Pants",
      "Dhoti",
      "Dupatta"
    ],
    description: "Discover our range of handcrafted clothing made with love."
  },
  'handmade-gifts': {
    title: "Handmade Gifts & Personalized Items",
    sidebar: [
      "Custom Nameplates & Signs",
      "Engraved Jewelry & Accessories",
      "Handmade Greeting Cards",
      "Photo Frames & Personalized Art"
    ],
    description: "Find the perfect personalized gift for your loved ones."
  },
  jewellery: {
    title: "Jewellery",
    sidebar: [
      "Necklaces",
      "Earrings",
      "Bracelets",
      "Rings"
    ],
    description: "Adorn yourself with our exquisite jewellery collection."
  },
  toys: {
    title: "Toys",
    sidebar: [
      "Action Figures",
      "Educational Toys",
      "Stuffed Animals",
      "Puzzles"
    ],
    description: "Explore our fun and educational toys for children."
  },
  'bath-beauty': {
    title: "Bath & Beauty",
    sidebar: [
      "Handmade Soaps",
      "Skincare Products",
      "Haircare Products",
      "Aromatherapy & Essential Oils"
    ],
    description: "Pamper yourself with our natural bath and beauty products."
  },
  art: {
    title: "Art",
    sidebar: [
      "Paintings & Drawings",
      "Sculptures",
      "Handmade Prints",
      "Handcrafted Cards & Stationery"
    ],
    description: "Discover unique art pieces created by talented artisans."
  },
  accessories: {
    title: "Accessories",
    sidebar: [
      "Bags & Purses",
      "Footwear",
      "Hats & Hair Accessories"
    ],
    description: "Complete your look with our stylish accessories."
  }
};

const Navbar = () => {
  const { category } = useParams();
  return (
    <nav className="bg-gray-100 p-4 shadow-md">
      <div className="container flex justify-between items-center mx-auto">
        <div className="flex justify-between w-full">
          {Object.keys(categoryMapping).map((key) => (
            <a
              key={key}
              href={`/products/${key}`}
              className={`text-gray-600 font-medium hover:text-gray-700 transition-all duration-300 ease-in-out transform hover:scale-105 ${
                category === key ? 'border-b-2 border-indigo-500' : ''
              }`}
            >
              {categoryMapping[key].title}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
};

const Sidebar = ({ category, onFilterChange }) => {
  const categoryInfo = categoryMapping[category] || categoryMapping.art;
  const [activeSubcategory, setActiveSubcategory] = useState(categoryInfo.sidebar[0]);
  const [filters, setFilters] = useState({ rating: null, tags: [], price: [0, 1000] });

  const handleSubcategoryClick = (subcategory) => {
    setActiveSubcategory(subcategory);
    onFilterChange({ subcategory });
  };

  const handleFilterChange = (type, value) => {
    const newFilters = { ...filters, [type]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="bg-gray-100 border-r p-6 w-1/4 duration-300 ease-in-out min-h-screen transition-all">
      <h2 className="text-2xl font-bold mb-4">Filters</h2>
      <div className="mb-4">
        <h3 className="font-semibold mb-2">Subcategories</h3>
        <ul className="text-gray-700 font-medium space-y-3">
          {categoryInfo.sidebar.map((item, index) => (
            <li 
              key={index} 
              className={`cursor-pointer hover:text-black transition-colors duration-200 py-2 px-3 rounded ${
                activeSubcategory === item 
                  ? "bg-indigo-500 text-white" 
                  : "hover:bg-gray-200"
              }`}
              onClick={() => handleSubcategoryClick(item)}
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div className="mb-4">
        <h3 className="font-semibold mb-2">Average Rating</h3>
        <select onChange={(e) => handleFilterChange('rating', e.target.value)} className="border p-2 rounded w-full">
          <option value="">All</option>
          <option value="4">4 Stars & Up</option>
          <option value="3">3 Stars & Up</option>
          <option value="2">2 Stars & Up</option>
          <option value="1">1 Star & Up</option>
        </select>
      </div>
      <div className="mb-4">
        <h3 className="font-semibold mb-2">Tags</h3>
        <div className="flex flex-wrap gap-2">
          {["New", "Trending"].map(tag => (
            <button 
              key={tag}
              onClick={() => handleFilterChange('tags', [...filters.tags, tag])}
              className={`px-3 py-1 rounded-full border ${filters.tags.includes(tag) ? 'bg-indigo-500 text-white' : 'bg-white text-black'} transition-transform transform hover:scale-105`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
      <div className="mb-4">
        <h3 className="font-semibold mb-2">Price</h3>
        <input 
          type="range" 
          min="0" 
          max="1000" 
          value={filters.price[1]} 
          onChange={(e) => handleFilterChange('price', [0, e.target.value])} 
          className="w-full"
        />
        <div className="flex justify-between text-sm">
          <span>$0</span>
          <span>${filters.price[1]}</span>
        </div>
      </div>
    </div>
  );
};

Sidebar.propTypes = {
  category: PropTypes.string.isRequired,
  onFilterChange: PropTypes.func.isRequired,
};

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [error, setError] = useState(null);

  const handleViewProduct = () => {
    // Navigate to product detail page
    navigate(`/product/${product._id || product.id}`);
  };

  const handleAddToCart = async () => {
    try {
      setIsAddingToCart(true);
      setError(null);
      
      const response = await axiosInstance.post('/api/cart/add', {
        productId: product._id || product.id,
        quantity: 1
      });
      
      if (response.data.success) {
        // Show success notification or toast here
        console.log("Product added to cart successfully");
        // You can add a toast notification here
      } else {
        setError('Failed to add product to cart');
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
      
      // Check if it's a connection error
      if (err.message && err.message.includes('Network Error')) {
        setError('Network error - product will be added when connection is restored');
        
        // Store in localStorage as a fallback
        try {
          const pendingCartItems = JSON.parse(localStorage.getItem('pendingCartItems') || '[]');
          pendingCartItems.push({
            productId: product._id || product.id,
            quantity: 1,
            name: product.name,
            price: product.price,
            image: product.image
          });
          localStorage.setItem('pendingCartItems', JSON.stringify(pendingCartItems));
        } catch (localStorageError) {
          console.error('Error saving to localStorage:', localStorageError);
        }
      } else if (err.response && err.response.status === 401) {
        setError('Please log in to add items to your cart');
        // Optionally redirect to login
        // navigate('/login');
      } else {
        setError('Error adding product to cart. Please try again.');
      }
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <div className="bg-white border p-5 rounded-xl shadow-sm duration-300 hover:shadow-md transition">
      <div className="relative">
        {product.tag && (
          <span className="bg-black rounded-full text-white text-xs absolute left-2 px-2 py-1 top-2 z-10">
            {product.tag}
          </span>
        )}
        <div className="flex bg-gray-50 h-48 justify-center rounded-md w-full items-center mb-3 overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="max-h-48 max-w-full object-contain"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Available';
            }}
          />
        </div>
      </div>
      <div className="flex flex-col h-28">
        <h3 className="text-lg font-semibold line-clamp-1">{product.name}</h3>
        <p className="text-gray-600 text-sm line-clamp-2 mb-auto mt-1">{product.description}</p>
        <p className="text-black text-xl font-bold mt-2">${parseFloat(product.price).toFixed(2)}</p>
      </div>
      <div className="flex gap-2 mt-3">
        <button 
          className={`flex flex-1 justify-center rounded-lg text-white items-center px-5 py-2 transition ${
            isAddingToCart ? 'bg-gray-500' : 'bg-black hover:bg-gray-800'
          }`}
          onClick={handleAddToCart}
          disabled={isAddingToCart}
          aria-label={`Add ${product.name} to cart`}
        >
          {isAddingToCart ? (
            <span className="animate-pulse">Adding...</span>
          ) : (
            <>
              <ShoppingCart className="h-5 w-5 mr-2" />
              Add to Cart
            </>
          )}
        </button>
        <button 
          onClick={handleViewProduct}
          className="border border-black rounded-lg text-black hover:bg-gray-100 px-3 py-2 transition"
          aria-label={`View ${product.name} details`}
        >
          View
        </button>
      </div>
      {error && (
        <div className="text-red-500 text-sm mt-2">{error}</div>
      )}
    </div>
  );
};

ProductCard.propTypes = {
  product: PropTypes.shape({
    _id: PropTypes.string,
    id: PropTypes.string,
    tag: PropTypes.string,
    image: PropTypes.string,
    name: PropTypes.string,
    description: PropTypes.string,
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
};

const ProductPage = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const subcategory = queryParams.get('subcategory');
  
  const [sortBy, setSortBy] = useState("bestsellers");
  const [itemsToShow, setItemsToShow] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  
  // Active filters state
  const [activeFilters, setActiveFilters] = useState([]);
  
  // Determine the current category from URL or props
  let currentCategory;
  
  // Check if we're using a direct route like /Art or /Clothing
  if (!category) {
    const path = window.location.pathname.toLowerCase();
    if (path.includes('art')) currentCategory = 'art';
    else if (path.includes('clothing')) currentCategory = 'clothing';
    else if (path.includes('ceramics')) currentCategory = 'ceramics';
    else if (path.includes('jewellery') || path.includes('jewelry')) currentCategory = 'jewellery';
    else if (path.includes('wooden')) currentCategory = 'wooden';
    else if (path.includes('clay')) currentCategory = 'clay';
    else if (path.includes('decor')) currentCategory = 'decor';
    else currentCategory = 'art'; // Default
  } else {
    currentCategory = category.toLowerCase();
  }
  
  const categoryTitle = categoryMapping[currentCategory]?.title || "Products";

  const handleFilterChange = (filters) => {
    // Update active filters and fetch products
    setActiveFilters(filters);
    fetchProducts(filters);
  };

  // Fetch products from API
  const fetchProducts = async (filters = {}) => {
    try {
      setLoading(true);
      
      // Prepare query parameters
      const params = {
        category: currentCategory,
        page: currentPage,
        limit: itemsToShow,
        sort: sortBy,
        ...filters
      };
      
      // Add subcategory filter if present
      if (subcategory) {
        params.subcategory = subcategory;
      }
      
      const response = await productService.getAllProducts(params);
      
      if (response.data.success) {
        setProducts(response.data.products);
        setTotalPages(response.data.totalPages || 1);
      } else {
        setError('Failed to fetch products');
        setProducts([]);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Error fetching products. Please try again later.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchProducts();
  }, [currentCategory, currentPage, itemsToShow, sortBy, subcategory]);

  // Handle category not found
  useEffect(() => {
    if (!categoryMapping[currentCategory]) {
      navigate("/products/art");
    }
  }, [currentCategory, navigate]);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  // Add or remove filter
  const toggleFilter = (filterType, value) => {
    // Check if filter already exists
    const existingFilter = activeFilters.find(
      filter => filter.type === filterType && filter.value === value
    );
    
    if (existingFilter) {
      // Remove filter
      setActiveFilters(activeFilters.filter(filter => 
        !(filter.type === filterType && filter.value === value)
      ));
    } else {
      // Add filter
      setActiveFilters([...activeFilters, { type: filterType, value }]);
    }
  };
  
  // Remove all filters
  const clearAllFilters = () => {
    setActiveFilters([]);
    navigate(`/products/${currentCategory}`);
  };

  return (
    <>
      <Navbar />
      <div className="flex bg-gray-50 min-h-screen">
        <Sidebar category={currentCategory} onFilterChange={handleFilterChange} />
        <div className="p-8 w-3/4">
          {/* Breadcrumb navigation */}
          <nav className="flex text-sm mb-4" aria-label="Breadcrumb">
            <ol className="inline-flex items-center md:space-x-3 space-x-1">
              <li className="inline-flex items-center">
                <span className="text-gray-600">Home</span>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="text-gray-400 mx-2">/</span>
                  <span className="text-gray-600">Products</span>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="text-gray-400 mx-2">/</span>
                  <span className="text-gray-800 font-medium">{categoryTitle}</span>
                </div>
              </li>
              {subcategory && (
                <li>
                  <div className="flex items-center">
                    <span className="text-gray-400 mx-2">/</span>
                    <span className="text-gray-800 font-medium">
                      {subcategory.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                </li>
              )}
            </ol>
          </nav>
          
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl text-gray-900 font-extrabold">{categoryTitle}</h1>
            </div>
            <div className="flex space-x-4">
              <select 
                className="border p-2 rounded"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="bestsellers">Sort by: Best Sellers</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest First</option>
              </select>
              <select 
                className="border p-2 rounded"
                value={itemsToShow}
                onChange={(e) => setItemsToShow(Number(e.target.value))}
              >
                <option value="12">Show: 12</option>
                <option value="24">24</option>
                <option value="36">36</option>
              </select>
            </div>
          </div>
          
          {/* Active filters display */}
          {(subcategory || activeFilters.length > 0) && (
            <div className="mb-6">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-gray-600 text-sm">Active filters:</span>
                
                {subcategory && (
                  <span className="bg-black rounded-full text-sm text-white inline-flex items-center px-3 py-1">
                    {subcategory.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    <button 
                      onClick={() => navigate(`/products/${currentCategory}`)}
                      className="focus:outline-none ml-2"
                      aria-label="Remove subcategory filter"
                    >
                      ×
                    </button>
                  </span>
                )}
                
                {activeFilters.map((filter, index) => (
                  <span 
                    key={index} 
                    className="bg-gray-200 rounded-full text-gray-800 text-sm inline-flex items-center px-3 py-1"
                  >
                    {filter.type}: {filter.value}
                    <button 
                      onClick={() => toggleFilter(filter.type, filter.value)} 
                      className="focus:outline-none ml-2"
                      aria-label={`Remove ${filter.type} filter`}
                    >
                      ×
                    </button>
                  </span>
                ))}
                
                {(subcategory || activeFilters.length > 0) && (
                  <button 
                    onClick={clearAllFilters}
                    className="text-indigo-600 text-sm hover:text-indigo-800 ml-2"
                  >
                    Clear all
                  </button>
                )}
              </div>
            </div>
          )}
          
          {/* Product description */}
          <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
            <p className="text-gray-600">
              {categoryMapping[currentCategory]?.description || 
                `Explore our collection of authentic ${categoryTitle.toLowerCase()} handcrafted by skilled artisans 
                using traditional techniques. Each piece is unique and tells a story of cultural heritage and craftsmanship.`}
            </p>
          </div>
          
          {/* Loading and error states */}
          {loading && (
            <div className="flex h-64 justify-center items-center">
              <div className="border-b-2 border-black border-t-2 h-12 rounded-full w-12 animate-spin"></div>
            </div>
          )}
          
          {error && !loading && (
            <div className="bg-red-100 border border-red-400 rounded text-red-700 mb-4 px-4 py-3">
              <p>{error}</p>
            </div>
          )}
          
          {/* Products grid */}
          {!loading && !error && (
            <>
              {products.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-500 text-lg">No products found in this category.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3 sm:grid-cols-2">
                  {products.map((product) => (
                    <ProductCard key={product._id || product.id} product={product} />
                  ))}
                </div>
              )}
            </>
          )}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-10">
              <div className="flex space-x-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-2 border rounded ${
                      currentPage === page
                        ? 'bg-black text-white'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                {currentPage < totalPages && (
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    className="border rounded hover:bg-gray-100 px-4 py-2"
                  >
                    Next
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ProductPage; 