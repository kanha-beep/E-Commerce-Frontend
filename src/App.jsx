import { Route, Routes } from "react-router-dom";
import Auth from "./ProductsAuth/Auth.jsx";
import AllProducts from "./ProductsPages/AllProducts.jsx";
import NewProducts from "./ProductsPages/NewProducts.jsx";
import Products from "./ProductsPages/Products.jsx";
import EditProducts from "./ProductsPages/EditProducts.jsx";
import Navbar from "./ProductsPages/Navbar.jsx";
import CartProducts from "./ProductsCarts/CartProducts.jsx";
import { useState } from "react";
import { useEffect } from "react";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    if (localStorage.getItem("token")) {
      setIsLoggedIn(true);
    }
  }, []);
  return (
    <div className="min-vh-100 bg-light">
      <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      <div className="container-fluid py-4">
        <Routes>
          <Route
            path="/auth"
            element={
              <Auth isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
            }
          />
          <Route path="/" element={<AllProducts />} />
          <Route path="/products" element={<AllProducts />} />
          <Route path="/products/new" element={<NewProducts />} />
          <Route path="/products/:productsId" element={<Products />} />
          <Route path="/products/:productsId/edit" element={<EditProducts />} />
          <Route
            path="/products/carts-show/:usersId"
            element={<CartProducts />}
          />
        </Routes>
      </div>
    </div>
  );
}

export default App;
