import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api";

export default function Auth({ setIsLoggedIn }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const data = isLogin
        ? { email: formData.email, password: formData.password }
        : formData;
      console.log("login starts");
      await api.post(endpoint, data);
      console.log("Login successful, cookie set by server");
      setIsLoggedIn(true);
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          `${isLogin ? "Login" : "Registration"} failed`
      );
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setError("");
    setFormData({ username: "", email: "", password: "" });
  };

  return (
    <div className="container-fluid vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="row w-100 justify-content-center">
        <div className="col-md-6 col-lg-4">
          <div className="card shadow border-0">
            <div
              className={`card-header text-white text-center ${
                isLogin ? "bg-primary" : "bg-success"
              }`}
            >
              <h4 className="mb-0">{isLogin ? "Login" : "Sign Up"}</h4>
            </div>
            <div className="card-body p-4">
              {/* Switch Buttons */}
              <div className="btn-group w-100 mb-4" role="group">
                <button
                  type="button"
                  className={`btn ${
                    isLogin ? "btn-primary" : "btn-outline-primary"
                  }`}
                  onClick={() => setIsLogin(true)}
                >
                  Login
                </button>
                <button
                  type="button"
                  className={`btn ${
                    !isLogin ? "btn-success" : "btn-outline-success"
                  }`}
                  onClick={() => setIsLogin(false)}
                >
                  Sign Up
                </button>
              </div>

              {error && (
                <div className="alert alert-danger alert-dismissible fade show">
                  {error}
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setError("")}
                  ></button>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {!isLogin && (
                  <div className="mb-3">
                    <label className="form-label">
                      <i className="bi bi-person me-2"></i>Username
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Enter your username"
                      required={!isLogin}
                    />
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label">
                    <i className="bi bi-envelope me-2"></i>Email
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    <i className="bi bi-lock me-2"></i>Password
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    minLength="6"
                    required
                  />
                </div>

                <div className="d-grid">
                  <button
                    type="submit"
                    className={`btn ${
                      isLogin ? "btn-primary" : "btn-success"
                    } btn-lg`}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        {isLogin ? "Logging in..." : "Creating Account..."}
                      </>
                    ) : (
                      <>
                        <i
                          className={`bi ${
                            isLogin ? "bi-box-arrow-in-right" : "bi-person-plus"
                          } me-2`}
                        ></i>
                        {isLogin ? "Login" : "Sign Up"}
                      </>
                    )}
                  </button>
                </div>
              </form>

              <div className="text-center mt-4">
                <small className="text-muted">
                  {isLogin
                    ? "Don't have an account?"
                    : "Already have an account?"}
                  <button
                    className="btn btn-link btn-sm p-0 ms-1"
                    onClick={switchMode}
                  >
                    {isLogin ? "Sign Up" : "Login"}
                  </button>
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
