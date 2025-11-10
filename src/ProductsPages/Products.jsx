import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

export default function Products() {
  const { productsId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [message, setMessage] = useState("");

  const getProduct = async () => {
    try {
      const res = await axios.get(`http://localhost:3000/api/products/${productsId}`);
      setProduct(res.data);
    } catch (e) {
      console.log("Error fetching product:", e);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async () => {
    setAddingToCart(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(`http://localhost:3000/api/products/${productsId}/add-cart`, {}, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      setMessage("Product added to cart successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (e) {
      setMessage(e.response?.data?.message || "Error adding to cart");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setAddingToCart(false);
    }
  };

  useEffect(() => {
    getProduct();
  }, [productsId]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{height: "50vh"}}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container text-center py-5">
        <i className="bi bi-exclamation-triangle display-1 text-warning"></i>
        <h3 className="mt-3">Product not found</h3>
        <button className="btn btn-primary mt-3" onClick={() => navigate("/")}>
          <i className="bi bi-arrow-left me-2"></i>
          Back to Products
        </button>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="row">
        <div className="col-12 mb-3">
          <button className="btn btn-outline-secondary" onClick={() => navigate("/")}>
            <i className="bi bi-arrow-left me-2"></i>
            Back to Products
          </button>
        </div>
      </div>

      {message && (
        <div className={`alert ${message.includes('Error') ? 'alert-danger' : 'alert-success'} alert-dismissible fade show`}>
          {message}
        </div>
      )}

      <div className="row">
        <div className="col-lg-6 mb-4">
          <div className="card border-0 shadow-sm">
            {product.image ? (
              <img
                src={`http://localhost:3000/ProductsUploads/${product.image}`}
                className="card-img-top"
                alt={product.name}
                style={{ height: "400px", objectFit: "cover" }}
              />
            ) : (
              <div
                className="card-img-top d-flex align-items-center justify-content-center bg-light"
                style={{ height: "400px" }}
              >
                <i className="bi bi-image display-1 text-muted"></i>
              </div>
            )}
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <h1 className="card-title display-5 mb-3">{product.name}</h1>
              
              <div className="mb-4">
                <span className="text-success display-4 fw-bold">${product.price}</span>
              </div>

              <div className="mb-4">
                <h5 className="text-muted">Product Details</h5>
                <hr />
                <div className="row">
                  <div className="col-sm-4">
                    <strong>Product ID:</strong>
                  </div>
                  <div className="col-sm-8">
                    {product._id}
                  </div>
                </div>
                {product.owner && (
                  <div className="row mt-2">
                    <div className="col-sm-4">
                      <strong>Seller:</strong>
                    </div>
                    <div className="col-sm-8">
                      {product.owner}
                    </div>
                  </div>
                )}
              </div>

              <div className="d-grid gap-2">
                <button
                  className="btn btn-primary btn-lg"
                  onClick={addToCart}
                  disabled={addingToCart}
                >
                  {addingToCart ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Adding to Cart...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-cart-plus me-2"></i>
                      Add to Cart
                    </>
                  )}
                </button>
                
                <button
                  className="btn btn-outline-primary btn-lg"
                  onClick={() => navigate("/api/products/carts-show/user")}
                >
                  <i className="bi bi-cart me-2"></i>
                  View Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}