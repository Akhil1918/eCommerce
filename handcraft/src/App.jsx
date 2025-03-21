import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Hero from "./components/Hero/Hero";
import Products from "./components/Products/Products";
import AOS from "aos";
import "aos/dist/aos.css";
import TopProducts from "./components/TopProducts/TopProducts";
import Banner from "./components/Banner/Banner";
import Subscribe from "./components/Subscribe/Subscribe";
import Testimonials from "./components/Testimonials/Testimonials";
import Footer from "./components/Footer/Footer";
import Popup from "./components/Popup/Popup";
import Login from "./components/Login/Login";
import Cart from "./components/Cart/Cart";
import Adminpanel from "./components/Adminpanel/Adminpanel"
import User from "./components/Adminpanel/User";
import PlatformAnalytics from "./components/Adminpanel/Platform";
import Disputes from "./components/Adminpanel/Disputes";
import SellerDashboard from "./components/Selller/Seller";
import AddProduct from "./components/Selller/AddProduct";
import ChatPage from "./components/Navbar/Chatbox";
import ForgetPassword from "./components/Login/Forget";
import Checkout from "./components/Checkout/Checkout";
import ProductPage from "./components/Pro/ProductPage";
import ProductDetails from "./components/Pro/ProductDetails";

const App = () => {
  const [orderPopup, setOrderPopup] = React.useState(false);

  const handleOrderPopup = () => {
    setOrderPopup(!orderPopup);
  };

  React.useEffect(() => {
    AOS.init({
      offset: 100,
      duration: 800,
      easing: "ease-in-sine",
      delay: 100,
    });
    AOS.refresh();
  }, []);

  return (
    <div className="bg-white dark:bg-gray-900 dark:text-white duration-200">
      <Navbar handleOrderPopup={handleOrderPopup} />
      <Routes>
        <Route path="/" element={
          <>
            <Hero handleOrderPopup={handleOrderPopup} />
            <Products />
            <TopProducts handleOrderPopup={handleOrderPopup} />
            <Banner />
            <Subscribe />
            <Testimonials />
            <Footer />
            <Popup orderPopup={orderPopup} setOrderPopup={setOrderPopup} />
          </>
        } />
        <Route path="/login" element={<Login />} />
        <Route path="/cart" element={<Cart/>} />
        <Route path="/checkout" element={<Checkout/>} />
        <Route path="/Adminpanel" element={<Adminpanel />} /> 
        <Route path="/User" element={<User />} />
        <Route path="/analytics" element={<PlatformAnalytics />} />
        <Route path="/disputes" element={<Disputes />} />
        <Route path="/Seller" element={<SellerDashboard />} /> 
        <Route path="/seller/add-product" element={<AddProduct />} />
        <Route path="/Chatbox" element={<ChatPage />} />
        <Route path="/forgot" element={<ForgetPassword />} />
        
        {/* New unified product routes */}
        <Route path="/products/:category" element={<ProductPage />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        {/* Legacy routes for backward compatibility */}
        <Route path="/art" element={<ProductPage />} />
        <Route path="/clothing" element={<ProductPage />} />
        {/* Direct category routes */}
        <Route path="/ceramics" element={<ProductPage />} />
        <Route path="/jewellery" element={<ProductPage />} />
        <Route path="/jewelry" element={<ProductPage />} />
        <Route path="/wooden-crafts" element={<ProductPage />} />
        <Route path="/clay-items" element={<ProductPage />} />
        <Route path="/handmade-decor" element={<ProductPage />} />
      </Routes>
    </div>
  );
};

export default App;
