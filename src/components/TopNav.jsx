import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { api } from "../../api.js";

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `rounded-full px-4 py-2 text-sm font-medium transition ${
          isActive
            ? "bg-white text-slate-950"
            : "text-slate-200 hover:bg-white/10 hover:text-white"
        }`
      }
    >
      {children}
    </NavLink>
  );
}

export default function TopNav({
  authLoading,
  isLoggedIn,
  setIsLoggedIn,
  setUser,
  user,
}) {
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await api.post("/api/auth/logout");
    } finally {
      setUser(null);
      setIsLoggedIn(false);
      setLoggingOut(false);
      navigate("/auth");
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/60 bg-slate-950 text-white shadow-[0_18px_60px_rgba(15,23,42,0.35)]">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="rounded-2xl bg-amber-400 px-3 py-2 text-sm font-black uppercase tracking-[0.35em] text-slate-950">
                Amazon
              </div>
              {/* <div>
                <p className="text-sm font-semibold text-white">Modern Storefront</p>
                <p className="text-xs text-slate-400">
                  Tailwind-first marketplace experience
                </p>
              </div> */}
            </Link>
          </div>

          <div className="flex flex-1 flex-col gap-3 lg:max-w-3xl lg:flex-row lg:items-center">
            <div className="flex h-12 flex-1 items-center overflow-hidden rounded-2xl border border-slate-700 bg-white">
              <div className="border-r border-slate-200 bg-amber-300 px-4 py-3 text-sm font-semibold text-slate-950">
                All
              </div>
              <input
                type="text"
                placeholder="Search products, brands, categories"
                className="h-full flex-1 border-0 px-4 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                onFocus={() => navigate("/products")}
              />
              <div className="grid h-full w-14 place-items-center bg-amber-400 text-slate-950">
                <SearchIcon />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 lg:justify-end">
              <div className="hidden rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-xs text-slate-300 sm:block">
                Delivery available across India
              </div>
              <Link
                to="/products/carts-show/user"
                className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:border-amber-300 hover:text-amber-200"
              >
                <CartIcon />
                Cart
              </Link>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-800/80 pt-4 md:flex-row md:items-center md:justify-between">
          <nav className="flex flex-wrap items-center gap-2">
            <NavItem to="/">Home</NavItem>
            <NavItem to="/products">Products</NavItem>
            <NavItem to="/community-demand">Community Demand</NavItem>
            <NavItem to="/products/new">Sell</NavItem>
            <NavItem to="/seller/dashboard">Dashboard</NavItem>
          </nav>

          <div className="flex flex-wrap items-center gap-3">
            {authLoading ? (
              <div className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-300">
                Checking session...
              </div>
            ) : isLoggedIn ? (
              <>
                <div className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-200">
                  Signed in as <span className="font-semibold text-white">{user?.username}</span>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loggingOut ? "Signing out..." : "Logout"}
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                className="rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-300"
              >
                Login / Sign up
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
      <circle cx="11" cy="11" r="6" />
      <path d="m20 20-4.35-4.35" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
      <circle cx="9" cy="20" r="1" />
      <circle cx="18" cy="20" r="1" />
      <path d="M3 4h2l2.4 10.2a1 1 0 0 0 1 .8h9.7a1 1 0 0 0 1-.8L21 7H7" />
    </svg>
  );
}
