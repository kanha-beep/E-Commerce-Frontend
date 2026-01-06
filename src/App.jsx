import { Route, Routes } from "react-router-dom";
import Auth from "./ProductsAuth/Auth.jsx";
import AllProducts from "./ProductsPages/AllProducts.jsx";
import NewProducts from "./ProductsPages/NewProducts.jsx";
import Products from "./ProductsPages/Products.jsx";
import EditProducts from "./ProductsPages/EditProducts.jsx";
import Navbar from "./ProductsPages/Navbar.jsx";
import CartProducts from "./ProductsCarts/CartProducts.jsx";
import { useState, useEffect } from "react";
import { api } from "../api.js";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState({});
  const [userRoles, setUserRoles] = useState("");
  // const [authChecked, setAuthChecked] = useState(false);
  const checkAuth = async () => {
    try {
      const res = await api.get("/api/auth/me");
      console.log("got current user: ", res?.data);
      setUser(res.data.user);
      setIsLoggedIn(true);
    } catch (e) {
      console.log("Error checking auth: ", e?.response?.data);
      setIsLoggedIn(false);
      setUser({});
    }
  };
  useEffect(() => {
    checkAuth();
  }, []);

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
                userRoles={userRoles}
                setUserRoles={setUserRoles}
              />
            }
          />
          <Route path="/" element={<AllProducts />} />
          <Route path="/products" element={<AllProducts />} />
          <Route path="/products/new" element={<NewProducts />} />
          <Route
            path="/products/:productsId"
            element={<Products userRoles={userRoles} user={user} />}
          />
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
