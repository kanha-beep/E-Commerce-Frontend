import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../api";

export default function Products({ userRoles, user }) {
  const [rating, setRating] = useState(0);
  console.log("userRoles: ", userRoles);
  console.log("id from user: ", user.id);
  const { productsId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [productLoader, setProductLoader] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [imageData, setImageData] = useState("");
  const [comment, setComment] = useState("");
  const [reviewsList, setReviewsList] = useState([]);
  const getProduct = async () => {
    setProductLoader(true);
    try {
      const res = await api.get(`/api/products/${productsId}`);
      setProduct(res.data);
    } catch (e) {
      console.log("Error fetching product:", e?.response?.data?.message);
      console.log("error: ", e);
    } finally {
      setProductLoader(false);
    }
  };
  const getReviews = async () => {
    try {
      const res = await api.get(`/api/products/${productsId}/review`);
      setReviewsList(res?.data);
      console.log("got reviews: ", res?.data);
    } catch (e) {
      console.log("Error fetching reviews:", e?.response?.data?.message);
      console.log("error: ", e);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async () => {
    setAddingToCart(true);
    try {
      const res = await api.post(`/api/products/${productsId}/add-cart`, {});
      console.log("added to cart: ", res?.data);
      setMessage("Product added to cart successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (e) {
      console.log("error: ", e?.response?.data?.error);
      setMessage(e.response?.data?.error || "Error adding to cart");
      setTimeout(
        () =>
          navigate("/auth", {
            state: { url: `/products/${productsId}` },
          }),
        2000
      );
    } finally {
      setAddingToCart(false);
    }
  };

  useEffect(() => {
    getProduct();
    getReviews();
  }, [productsId]);

  if (productLoader) {
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

  const handleUpdateImage = async (e, id) => {
    const formData = new FormData();
    formData.append("image", imageData);
    e.preventDefault();
    setLoading(true);
    try {
      console.log("update starts");
      const res = await api.patch(`/api/products/${id}`, formData);
      console.log("image updated: ", res?.data);
      setShowModal(false);
    } catch (e) {
      console.log("Error updating image: ", e?.response?.data?.error);
    } finally {
      setImageData("");
      getProduct();
      setLoading(false);
    }
  };
  const handleDelete = async () => {
    try {
      const res = await api.delete(`/api/products/${productsId}`);
      console.log("deleted: ", res?.data);

      navigate("/products");
    } catch (e) {
      alert(e?.response?.data?.error);
      console.log("error: ", e?.response?.data?.error);
    }
  };
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = {
      comment,
      rating,
    };
    try {
      const res = await api.post(`/api/products/${productsId}/review`, data);
      console.log("review posted: ", res?.data);
    } catch (e) {
      console.log("GO: ", e?.response?.data?.error);
      if (e?.status === 401) {
        setMessage(e?.response?.data?.error);
        setTimeout(
          () =>
            navigate("/auth", {
              state: { reviewUrl: `/products/${productsId}` },
            }),
          2000
        );
      }
    } finally {
      getProduct();
      setComment("");
      setRating("");
      getReviews();
      setLoading(false);
    }
  };
  console.log("ratings: ", rating, "comments: ", comment);
  console.log("reviews: ", reviewsList);
  const handleReviewDelete = async (id) => {
    setLoading(true);
    try {
      await api.delete(`/api/products/${productsId}/review/${id}`);
    } catch (e) {
      console.log("error: ", e?.response?.data?.error);
    } finally {
      getReviews();
      setLoading(false);
    }
  };
  return (
    <div className="container">
      <div className="row">
        <div className="col-12 mb-3">
          <button
            className="btn btn-outline-secondary"
            onClick={() => navigate("/")}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Back to Products
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`alert ${
            message.includes("Error") ? "alert-danger" : "alert-success"
          } alert-dismissible fade show`}
        >
          {message}
        </div>
      )}

      <div className="row">
        {/* left side div for image */}
        <div className="col-lg-6 mb-4">
          <div className="card border-0 shadow-sm">
            {product.image ? (
              <img
                src={product.image}
                className="card-img-top"
                alt={product.name}
                style={{ height: "34rem", objectFit: "cover" }}
              />
            ) : (
              <div
                className="card-img-top d-flex align-items-center justify-content-center bg-light"
                style={{ height: "30rem" }}
              >
                <i className="bi bi-image display-1 text-muted"></i>
              </div>
            )}
          </div>
        </div>
        {/* right div */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <h1 className="card-title display-5 mb-3">{product.name}</h1>

              <div className="mb-4">
                <span className="text-success display-4 fw-bold">
                  Rs {product.price}
                </span>
              </div>

              <div className="mb-4">
                <h5 className="text-muted">Product Details</h5>
                <hr />
                {/* id */}
                <div className="row">
                  <div className="col-sm-4">
                    <strong>Product ID:</strong>
                  </div>
                  <div className="col-sm-8">{product._id}</div>
                </div>
                {/* seller */}
                {product.owner && (
                  <div className="row mt-2">
                    <div className="col-sm-4">
                      <strong>Seller:</strong>
                    </div>
                    <div className="col-sm-8">{product.owner}</div>
                  </div>
                )}
              </div>
              {/* buttons */}
              <div className="d-grid gap-2">
                <button
                  className="btn btn-primary btn-lg"
                  onClick={addToCart}
                  disabled={addingToCart}
                >
                  {addingToCart ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                      ></span>
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
                  onClick={() => navigate("/products/carts-show/user")}
                >
                  <i className="bi bi-cart me-2"></i>
                  View Cart
                </button>
                {product?.owner?.toString() === user?.id?.toString() && (
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => setShowModal(true)}
                  >
                    Update Image
                  </button>
                )}
                {product?.owner?.toString() === user?.id?.toString() && (
                  <button
                    className="btn btn-outline-danger"
                    onClick={handleDelete}
                  >
                    Delete Product
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        {/* <div className="col-12 mt-4">
          <h3 className="mb-3">Reviews</h3>
          <p>{product.description}</p>
        </div> */}
        <div className="col-12 col-lg-5 mt-4 mx-auto">
          <form className="card p-3" onSubmit={handleReviewSubmit}>
            <div className="card-head">
              <h3 className="mb-3">Review</h3>
            </div>
            <div className="mb-3 d-flex">
              <label htmlFor="name" className="form-label mt-2">
                Enter
              </label>
              <input
                placeholder="Enter Review"
                name="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="ms-4 form-control"
              />
            </div>
            <div className="mb-3 d-flex">
              <label htmlFor="name" className="form-label mt-2">
                Rating
              </label>
              {[1, 2, 3, 4, 5].map((i) => (
                <i
                  key={i}
                  className={`bi ${
                    i <= rating ? "bi-star-fill" : "bi-star"
                  } text-warning fs-4 me-1 ms-3`}
                  style={{ cursor: "pointer" }}
                  onClick={() => setRating(i)}
                />
              ))}
            </div>
            <button type="submit" className="btn btn-outline-success">
              {loading ? (
                <>
                  <span
                    role="status"
                    className="spinner-border spinner-border-sm me-2"
                  ></span>{" "}
                  Submitting...
                </>
              ) : (
                "Submit"
              )}
            </button>
          </form>
        </div>
      </div>
      <div className="col-12 col-lg-3 mt-4">
        {reviewsList?.length > 0 &&
          reviewsList?.map((review) => (
            <>
              <h3 className="mb-3">Customer Reviews</h3>
              <div className="card p-3 mb-3" key={review?._id}>
                <div className="card-header h4">
                  By : {review?.owner?.username}
                </div>
                <div className="card-body">
                  <h5 className="card-title">Comment: {review?.comment}</h5>
                  <p className="card-text">
                    {review?.rating}{" "}
                    <i className="bi bi-star-fill text-warning"></i>
                  </p>
                </div>
                <div className="d-flex justify-content-evenly">
                  {review?.owner?._id?.toString() === user?.id?.toString() && (
                    <button
                      className="btn btn-outline-danger"
                      onClick={() => handleReviewDelete(review?._id)}
                    >
                      {loading ? (
                        <>
                          <span
                            role="status"
                            className="spinner-border spinner-border-sm me-2"
                          ></span>{" "}
                          Deleting
                        </>
                      ) : (
                        <i className="bi bi-trash"></i>
                      )}
                    </button>
                  )}
                  {review?.owner?._id?.toString() === user?.id?.toString() && (
                    <button className="btn btn-outline-secondary">Edit</button>
                  )}
                </div>
              </div>
            </>
          ))}
      </div>

      {showModal && (
        <div
          className="modal fade show"
          style={{ display: "block" }}
          tabIndex="-1"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title">Update Image</h4>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={(e) => handleUpdateImage(e, product._id)}>
                  <div className="mb-3">
                    <label htmlFor="image" className="form-label">
                      Choose Image
                    </label>
                    <input
                      type="file"
                      className="form-control"
                      id="image"
                      onChange={(e) => setImageData(e.target.files[0])}
                    />
                  </div>

                  <button className="btn btn-primary">
                    {loading ? "Updating..." : "Update"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
      {showModal && (
        <div
          className="modal-backdrop fade show"
          onClick={() => setShowModal(false)}
        ></div>
      )}
    </div>
  );
}
