import { Route, Routes } from "react-router-dom";
import Auth from "./ProductsAuth/Auth.jsx";
import AllProducts from "./ProductsPages/AllProducts.jsx";
import NewProducts from "./ProductsPages/NewProducts.jsx";
import Products from "./ProductsPages/Products.jsx";
import EditProducts from "./ProductsPages/EditProducts.jsx";
import Navbar from "./ProductsPages/Navbar.jsx";
import CartProducts from "./ProductsCarts/CartProducts.jsx";
import { useState, useEffect } from "react";
import { api } from "./api.js";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState({});
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      const checkAuth = async () => {
        try {
          const res = await api.get("/api/auth/me");
          setUser(res.data.user);
          setIsLoggedIn(true);
        } catch (e) {
          console.log("Error checking auth: ", e?.response?.data);
          setIsLoggedIn(false);
          setUser({});
        } finally {
          setAuthChecked(true);
        }
      };
      checkAuth();
    }
  }, [isLoggedIn]);

  if (!authChecked) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      <Navbar
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
        user={user}
      />
      <div className="container-fluid py-4">
        <Routes>
          <Route
            path="/auth"
            element={
              <Auth
                isLoggedIn={isLoggedIn}
                setIsLoggedIn={setIsLoggedIn}
                setUser={setUser}
              />
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
