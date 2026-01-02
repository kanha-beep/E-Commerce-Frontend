import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api";

export default function NewProducts() {
  const [image, setImage] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const navigate = useNavigate();
  const [data, setData] = useState({ name: "", price: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNewProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!data.name || !data.price) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("price", data.price);
      if (image) {
        formData.append("image", image);
      }

      console.log("Sending data:", {
        name: data.name,
        price: data.price,
        hasImage: !!image,
        image: image,
      });

      const res = await api.post("/api/products/new", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Product added successfully:", res.data);
      navigate("/");
    } catch (e) {
      console.error("Error adding product:", e?.response?.data?.error);
      setError(e.response?.data?.message || "Error adding product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-lg-8 col-md-10">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">
                <i className="bi bi-plus-circle me-2"></i>
                Add New Product
              </h4>
            </div>
            <div className="card-body p-4">
              {error && (
                <div className="alert alert-danger" role="alert">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                </div>
              )}

              <form onSubmit={handleNewProduct}>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label fw-bold">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    id="name"
                    name="name"
                    placeholder="Enter product name"
                    value={data.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="price" className="form-label fw-bold">
                    Price (Rs) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control form-control-lg"
                    id="price"
                    name="price"
                    placeholder="Enter price"
                    value={data.price}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="image" className="form-label fw-bold">
                    Product Image
                  </label>
                  <input
                    type="file"
                    className="form-control form-control-lg"
                    id="image"
                    name="image"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  {imagePreview && (
                    <div className="mt-3 text-center">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="img-thumbnail"
                        style={{ maxHeight: "200px", maxWidth: "100%" }}
                      />
                    </div>
                  )}
                </div>

                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-lg me-md-2"
                    onClick={() => navigate("/")}
                    disabled={loading}
                  >
                    <i className="bi bi-arrow-left me-2"></i>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        ></span>
                        Adding...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-plus-circle me-2"></i>
                        Add Product
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
