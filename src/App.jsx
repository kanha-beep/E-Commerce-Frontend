import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { api } from "../api.js";
import Auth from "./ProductsAuth/Auth.jsx";
import CartProducts from "./ProductsCarts/CartProducts.jsx";
import TopNav from "./components/TopNav.jsx";
import AllProducts from "./ProductsPages/AllProducts.jsx";
import CommunityDemand from "./ProductsPages/CommunityDemand.jsx";
import EditProducts from "./ProductsPages/EditProducts.jsx";
import NewProducts from "./ProductsPages/NewProducts.jsx";
import Products from "./ProductsPages/Products.jsx";
import SellerDashboard from "./ProductsPages/SellerDashboard.jsx";

function App() {
  const [authLoading, setAuthLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.get("/api/auth/me");
        setUser(res.data.user);
        setIsLoggedIn(true);
      } catch {
        setUser(null);
        setIsLoggedIn(false);
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuth();
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <TopNav
        authLoading={authLoading}
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
        setUser={setUser}
        user={user}
      />
      <main className="mx-auto w-full max-w-[1600px] px-4 pb-10 pt-6 sm:px-6 lg:px-8">
        <Routes>
          <Route
            path="/auth"
            element={
              authLoading ? null : isLoggedIn ? (
                <Navigate to="/" replace />
              ) : (
                <Auth setIsLoggedIn={setIsLoggedIn} setUser={setUser} />
              )
            }
          />
          <Route path="/" element={<AllProducts isLoggedIn={isLoggedIn} user={user} />} />
          <Route path="/products" element={<AllProducts isLoggedIn={isLoggedIn} user={user} />} />
          <Route
            path="/products/new"
            element={<NewProducts isLoggedIn={isLoggedIn} />}
          />
          <Route
            path="/products/:productsId"
            element={<Products isLoggedIn={isLoggedIn} user={user} />}
          />
          <Route
            path="/products/:productsId/edit"
            element={<EditProducts isLoggedIn={isLoggedIn} user={user} />}
          />
          <Route
            path="/products/carts-show/:usersId"
            element={<CartProducts isLoggedIn={isLoggedIn} />}
          />
          <Route
            path="/seller/dashboard"
            element={<SellerDashboard isLoggedIn={isLoggedIn} user={user} />}
          />
          <Route
            path="/community-demand"
            element={<CommunityDemand isLoggedIn={isLoggedIn} user={user} />}
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
