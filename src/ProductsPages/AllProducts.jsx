import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function AllProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const getAllProducts = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/products");
      setProducts(res.data);
    } catch (e) {
      console.log("Error fetching products:", e?.response?.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllProducts();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{height: "50vh"}}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="text-primary mb-0">
              <i className="bi bi-shop me-2"></i>
              All Products
            </h2>
            <button
              onClick={() => navigate("/api/products/carts-show/user")}
              className="btn btn-outline-primary"
            >
              <i className="bi bi-cart me-2"></i>
              View Cart
            </button>
          </div>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-box-seam display-1 text-muted"></i>
          <h4 className="text-muted mt-3">No products available</h4>
          <button
            onClick={() => navigate("/api/products/new")}
            className="btn btn-primary mt-3"
          >
            <i className="bi bi-plus-circle me-2"></i>
            Add First Product
          </button>
        </div>
      ) : (
        <div className="row g-4">
          {products.map((product) => (
            <div key={product._id} className="col-lg-4 col-md-6 col-sm-12">
              <div className="card h-100 shadow-sm border-0">
                <div className="position-relative">
                  {product.image ? (
                    <img
                      src={`http://localhost:3000/ProductsUploads/${product.image}`}
                      className="card-img-top"
                      alt={product.name}
                      style={{ height: "250px", objectFit: "cover" }}
                    />
                  ) : (
                    <div
                      className="card-img-top d-flex align-items-center justify-content-center bg-light"
                      style={{ height: "250px" }}
                    >
                      <i className="bi bi-image display-4 text-muted"></i>
                    </div>
                  )}
                </div>
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title text-truncate">{product.name}</h5>
                  <p className="card-text text-success fw-bold fs-4">
                    Rs {product.price}
                  </p>
                  <div className="mt-auto">
                    <button
                      className="btn btn-primary w-100"
                      onClick={() => navigate(`/api/products/${product._id}`)}
                    >
                      <i className="bi bi-eye me-2"></i>
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
