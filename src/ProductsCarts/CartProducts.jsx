import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api";
import { API_URL } from "../../api";
export default function CartProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [deleteFromCart, setDeleteFromCart] = useState(false);
  // const getCartProducts = async () => {
  //   try {
  //     console.log("getting cart details");
  //     const res = await api.get("/api/products/cart-details");
  //     console.log("got products: ", res?.data);
  //     // console.log(
  //     //   "quantity: ",
  //     //   res?.data?.products?.quantity
  //     // );
  //     // console.log(
  //     //   "product price:",
  //     //   res?.data?.products?.price
  //     // );
  //     const cartProducts = res.data || [];
  //     setProducts(cartProducts);

  //     // Calculate total
  //     const totalPrice = cartProducts.reduce((sum, product) => {
  //       return sum + parseFloat(product.price || 0);
  //     }, 0);
  //     setTotal(totalPrice);
  //   } catch (e) {
  //     console.log("Error fetching cart:", e?.response?.data?.error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const getCartProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/products/cart-details");

      const cartProducts = res?.data || [];
      setProducts(cartProducts);

      const totalPrice = cartProducts.reduce(
        (sum, p) => sum + p.price * p.quantity,
        0
      );
      setTotal(totalPrice);
    } catch (e) {
      console.log("Error fetching cart:", e?.response?.data?.error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCartProducts();
  }, []);

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "50vh" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  const handleCartDelete = async (id) => {
    setDeleteFromCart(true);
    try {
      await api.delete(`/api/products/cart/${id}`);
    } catch (e) {
      console.log("Error deleting cart item: ", e?.response?.data);
    } finally {
      getCartProducts();
      setDeleteFromCart(false);
    }
  };
  const handlePayment = async () => {
    const res = await api.post("/api/products/create-order");

    const options = {
      key: "rzp_test_xxxxx",
      amount: res.data.amount,
      currency: "INR",
      order_id: res.data.id,
      name: "My Shop",
      description: "Test Payment",
      handler: function (response) {
        console.log("Payment success:", response);
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <div className="container">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="text-primary mb-0">
              <i className="bi bi-cart me-2"></i>
              Shopping Cart
            </h2>
            <button
              className="btn btn-outline-primary"
              onClick={() => navigate("/")}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Continue Shopping
            </button>
          </div>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-cart-x display-1 text-muted"></i>
          <h4 className="text-muted mt-3">Your cart is empty</h4>
          <p className="text-muted">Add some products to get started!</p>
          <button
            onClick={() => navigate("/")}
            className="btn btn-primary mt-3"
          >
            <i className="bi bi-shop me-2"></i>
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="row">
          <div className="col-lg-8">
            <div className="card shadow-sm border-0">
              <div className="card-header bg-light">
                <h5 className="mb-0">Cart Items ({products.length})</h5>
              </div>
              <div className="card-body p-0">
                {products.map((product, index) => (
                  <div
                    key={product._id}
                    className={`p-3 ${
                      index !== products.length - 1 ? "border-bottom" : ""
                    }`}
                  >
                    <div className="row align-items-center">
                      {/* IMAGE */}
                      <div className="col-md-2 text-center">
                        <img
                          src={product.image || "/placeholder.png"}
                          alt={product.name}
                          className="img-fluid rounded"
                          style={{ height: "90px", objectFit: "cover" }}
                        />
                      </div>

                      {/* NAME */}
                      <div className="col-md-4">
                        <h6 className="mb-1">{product.name}</h6>
                        <small className="text-muted">
                          Price: Rs {product.price}
                        </small>
                      </div>

                      {/* QUANTITY */}
                      <div className="col-md-2 text-center">
                        <span className="badge bg-secondary px-3 py-2">
                          Qty: {product.quantity}
                        </span>
                      </div>

                      {/* SUBTOTAL */}
                      <div className="col-md-2 text-center fw-bold text-success">
                        Rs {product.price * product.quantity}
                      </div>

                      {/* DELETE */}
                      <div className="col-md-2 text-end">
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleCartDelete(product.id)}
                          disabled={deleteFromCart}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card shadow-sm border-0 sticky-top">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">Order Summary</h5>
              </div>
              <div className="card-body">
                <div className="d-flex justify-content-between mb-3">
                  <span>Subtotal ({products.length} items):</span>
                  <span className="fw-bold">Rs {total.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between mb-3">
                  <span>Shipping:</span>
                  <span className="text-success">FREE</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between mb-4">
                  <span className="fw-bold fs-5">Total:</span>
                  <span className="fw-bold fs-5 text-success">
                    Rs {total.toFixed(2)}
                  </span>
                </div>
                <div className="d-grid">
                  <button
                    onClick={handlePayment}
                    className="btn btn-success btn-lg"
                  >
                    <i className="bi bi-credit-card me-2"></i>
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
