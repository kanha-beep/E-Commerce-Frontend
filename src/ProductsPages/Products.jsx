import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../../api.js";
import CustomizationStudio from "./CustomizationStudio.jsx";
import {
  AccentButton,
  InlineAlert,
  LoadingState,
  PageHero,
  Panel,
  PrimaryButton,
  SecondaryButton,
  TextArea,
} from "../components/ui.jsx";
import { averageRating, formatCurrency } from "../utils/formatters.js";

export default function Products({ user }) {
  const navigate = useNavigate();
  const { productsId } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [customOrders, setCustomOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingReview, setSavingReview] = useState(false);
  const [message, setMessage] = useState(null);
  const [reviewForm, setReviewForm] = useState({ comment: "", rating: 5 });
  const [replyDrafts, setReplyDrafts] = useState({});
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const [productRes, reviewRes] = await Promise.all([
          api.get(`/api/products/${productsId}`),
          api.get(`/api/products/${productsId}/review`),
        ]);

        setProduct(productRes.data);
        setReviews(Array.isArray(reviewRes.data) ? reviewRes.data : []);
      } catch {
        setProduct(null);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [productsId]);

  useEffect(() => {
    if (!user?.id || !product?._id) return;

    const loadCustomOrders = async () => {
      try {
        const res = await api.get(`/api/products/${productsId}/custom-orders`);
        setCustomOrders(Array.isArray(res.data) ? res.data : []);
      } catch {
        setCustomOrders([]);
      }
    };

    loadCustomOrders();
  }, [productsId, product?._id, user?.id]);

  const isOwner =
    product?.owner?._id?.toString?.() === user?.id?.toString?.() ||
    product?.owner?.toString?.() === user?.id?.toString?.();
  const reviewAverage = useMemo(() => averageRating(reviews), [reviews]);
  const media = useMemo(() => {
    if (!product) return [];
    if (Array.isArray(product.media) && product.media.length) return product.media;
    if (product.image) return [{ url: product.image, kind: "image" }];
    return [];
  }, [product]);
  const selectedMedia = media[selectedMediaIndex] || media[0];

  const refreshReviews = async () => {
    const reviewRes = await api.get(`/api/products/${productsId}/review`);
    setReviews(Array.isArray(reviewRes.data) ? reviewRes.data : []);
  };

  const refreshCustomOrders = async () => {
    if (!user?.id) return;
    const res = await api.get(`/api/products/${productsId}/custom-orders`);
    setCustomOrders(Array.isArray(res.data) ? res.data : []);
  };

  const addToCart = async () => {
    try {
      await api.post(`/api/products/${productsId}/add-cart`, {});
      setMessage({ tone: "success", text: "Product added to cart." });
    } catch (error) {
      setMessage({
        tone: "error",
        text: error.response?.data?.error || "Please login to add items to cart.",
      });

      if (error.response?.status === 401) {
        setTimeout(() => {
          navigate("/auth", { state: { url: `/products/${productsId}` } });
        }, 1200);
      }
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/api/products/${productsId}`);
      navigate("/products");
    } catch (error) {
      setMessage({
        tone: "error",
        text: error.response?.data?.error || "Unable to delete product.",
      });
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      setSavingReview(true);
      await api.post(`/api/products/${productsId}/review`, reviewForm);
      setReviewForm({ comment: "", rating: 5 });
      await refreshReviews();
      setMessage({ tone: "success", text: "Review posted successfully." });
    } catch (error) {
      setMessage({
        tone: "error",
        text: error.response?.data?.error || "Please login to submit a review.",
      });

      if (error.response?.status === 401) {
        setTimeout(() => {
          navigate("/auth", { state: { reviewUrl: `/products/${productsId}` } });
        }, 1200);
      }
    } finally {
      setSavingReview(false);
    }
  };

  const handleReplySubmit = async (reviewId) => {
    const comment = replyDrafts[reviewId]?.trim();
    if (!comment) return;

    try {
      await api.post(`/api/products/${productsId}/review/${reviewId}/replies`, { comment });
      setReplyDrafts((current) => ({ ...current, [reviewId]: "" }));
      await refreshReviews();
      setMessage({ tone: "success", text: "Reply posted." });
    } catch (error) {
      setMessage({
        tone: "error",
        text: error.response?.data?.error || "Unable to post reply.",
      });
    }
  };

  const handleCustomizationSubmit = async (form) => {
    try {
      await api.post(`/api/products/${productsId}/custom-orders`, {
        improvementNote: form.improvementNote,
        extraCharge: Number(form.extraCharge),
        preview: {
          tagText: form.tagText,
          printText: form.printText,
          baseColor: form.baseColor,
          accentColor: form.accentColor,
          rotation: Number(form.rotation),
          printSize: Number(form.printSize),
        },
      });
      await refreshCustomOrders();
      setMessage({ tone: "success", text: "Customization request sent to the producer." });
    } catch (error) {
      setMessage({
        tone: "error",
        text: error.response?.data?.error || "Unable to send customization request.",
      });
      throw error;
    }
  };

  const handleCustomOrderStatus = async (customOrderId, status) => {
    try {
      await api.patch(`/api/products/custom-orders/${customOrderId}/status`, { status });
      await refreshCustomOrders();
      setMessage({ tone: "success", text: `Custom order marked as ${status}.` });
    } catch (error) {
      setMessage({
        tone: "error",
        text: error.response?.data?.error || "Unable to update custom order status.",
      });
    }
  };

  if (loading) {
    return <LoadingState label="Loading product details" />;
  }

  if (!product) {
    return (
      <Panel className="text-center">
        <h1 className="text-3xl font-black text-slate-950">Product not found</h1>
        <p className="mt-3 text-sm text-slate-500">
          The item you requested may have been removed or the link is incorrect.
        </p>
        <div className="mt-6">
          <Link
            to="/products"
            className="inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
          >
            Back to products
          </Link>
        </div>
      </Panel>
    );
  }

  return (
    <div className="space-y-8">
      <PageHero
        badge={product.section || "Product detail"}
        title={product.name}
        description={product.shortDescription || product.description || "Detailed marketplace listing"}
        actions={
          <>
            <SecondaryButton onClick={() => navigate("/products")}>
              Back to catalog
            </SecondaryButton>
            {isOwner ? (
              <PrimaryButton onClick={() => navigate(`/products/${productsId}/edit`)}>
                Edit listing
              </PrimaryButton>
            ) : (
              <AccentButton onClick={addToCart}>Add to cart</AccentButton>
            )}
          </>
        }
      />

      {message ? <InlineAlert tone={message.tone}>{message.text}</InlineAlert> : null}

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Panel className="overflow-hidden">
          <div className="grid gap-6 lg:grid-cols-[120px_1fr]">
            <div className="grid gap-3 lg:grid-rows-[repeat(5,84px)]">
              {media.map((item, index) => (
                <button
                  key={`${item.url}-${index}`}
                  type="button"
                  onClick={() => setSelectedMediaIndex(index)}
                  className={`overflow-hidden rounded-2xl border ${
                    index === selectedMediaIndex ? "border-amber-400" : "border-slate-200"
                  }`}
                >
                  {item.kind === "video" ? (
                    <div className="grid h-20 place-items-center bg-slate-100 text-xs font-semibold text-slate-600">
                      Video
                    </div>
                  ) : (
                    <img src={item.url} alt={`${product.name} ${index + 1}`} className="h-20 w-full object-cover" />
                  )}
                </button>
              ))}
            </div>

            <div className="space-y-6">
              <div className="overflow-hidden rounded-[2rem] bg-slate-100">
                {selectedMedia?.kind === "video" ? (
                  <video src={selectedMedia.url} controls className="h-[460px] w-full object-cover" />
                ) : selectedMedia?.url ? (
                  <img src={selectedMedia.url} alt={product.name} className="h-[460px] w-full object-cover" />
                ) : (
                  <div className="grid h-[460px] place-items-center bg-[linear-gradient(135deg,_#dbeafe,_#f8fafc)] text-slate-400">
                    <PackageIllustration />
                  </div>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Panel className="bg-slate-50">
                  <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
                    About this item
                  </p>
                  <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-600">
                    {(product.bulletPoints?.length ? product.bulletPoints : [product.description]).map(
                      (point, index) => (
                        <li key={`${point}-${index}`}>{point}</li>
                      )
                    )}
                  </ul>
                </Panel>

                <Panel className="bg-slate-50">
                  <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
                    Product details
                  </p>
                  <dl className="mt-4 space-y-3 text-sm text-slate-600">
                    {(product.specifications || []).length ? (
                      product.specifications.map((item, index) => (
                        <div key={`${item.label}-${index}`} className="flex justify-between gap-4">
                          <dt className="font-semibold text-slate-900">{item.label}</dt>
                          <dd className="text-right">{item.value}</dd>
                        </div>
                      ))
                    ) : (
                      <div className="flex justify-between gap-4">
                        <dt className="font-semibold text-slate-900">Category</dt>
                        <dd>{product.category || "General"}</dd>
                      </div>
                    )}
                  </dl>
                </Panel>
              </div>
            </div>
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel className="space-y-5">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
                Featured listing
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
                {product.name}
              </h2>
              <div className="mt-3 flex items-center gap-3">
                <RatingStars rating={reviewAverage} />
                <span className="text-sm text-slate-500">
                  {reviews.length} review{reviews.length === 1 ? "" : "s"}
                </span>
              </div>
            </div>

            <div className="rounded-[1.5rem] bg-slate-50 p-5">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Price</p>
              <p className="mt-2 text-4xl font-black text-slate-950">
                {formatCurrency(product.price)}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {product.deliveryInfo || "Standard delivery available"}
              </p>
            </div>

            <dl className="grid gap-3 text-sm text-slate-600">
              <InfoCard label="Seller" value={product.owner?.username || "Marketplace partner"} />
              <InfoCard label="Brand" value={product.brand || "Generic"} />
              <InfoCard label="Category" value={product.category || "General"} />
              <InfoCard
                label="Availability"
                value={product.quantity > 0 ? `${product.quantity} in stock` : "Out of stock"}
              />
              <InfoCard label="Returns" value={product.returnPolicy || "7-day replacement"} />
            </dl>

            {!isOwner ? (
              <div className="grid gap-3">
                <AccentButton onClick={addToCart} disabled={product.quantity < 1}>
                  {product.quantity < 1 ? "Out of stock" : "Add to cart"}
                </AccentButton>
                <SecondaryButton onClick={() => navigate("/products/carts-show/user")}>
                  Go to cart
                </SecondaryButton>
                <PrimaryButton
                  type="button"
                  onClick={() =>
                    document.getElementById("customization-studio")?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    })
                  }
                >
                  Customize with producer
                </PrimaryButton>
              </div>
            ) : (
              <div className="grid gap-3">
                <PrimaryButton onClick={() => navigate(`/products/${productsId}/edit`)}>
                  Edit product
                </PrimaryButton>
                <SecondaryButton onClick={() => navigate("/seller/dashboard")}>
                  Open seller dashboard
                </SecondaryButton>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="inline-flex items-center justify-center rounded-full border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                >
                  Delete product
                </button>
              </div>
            )}
          </Panel>

          <CustomizationStudio
            product={product}
            isOwner={isOwner}
            customOrders={customOrders}
            onSubmit={handleCustomizationSubmit}
            onStatusChange={handleCustomOrderStatus}
            buyerName={user?.username}
            onPaymentSuccess={async () => {
              await refreshCustomOrders();
              setMessage({ tone: "success", text: "Custom order payment completed." });
            }}
            onPaymentError={(error) =>
              setMessage({
                tone: "error",
                text: error.response?.data?.error || error.message || "Custom payment failed.",
              })
            }
          />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Panel>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
                Write a review
              </p>
              <h3 className="mt-2 text-2xl font-bold text-slate-950">Share your experience</h3>
            </div>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleReviewSubmit}>
            <TextArea
              value={reviewForm.comment}
              onChange={(e) =>
                setReviewForm((current) => ({ ...current, comment: e.target.value }))
              }
              placeholder="What stood out about this product?"
            />
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setReviewForm((current) => ({ ...current, rating: value }))}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      value <= reviewForm.rating
                        ? "bg-amber-400 text-slate-950"
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    }`}
                  >
                    {value} star{value === 1 ? "" : "s"}
                  </button>
                ))}
              </div>
            </div>
            <AccentButton type="submit" disabled={savingReview}>
              {savingReview ? "Submitting..." : "Submit review"}
            </AccentButton>
          </form>
        </Panel>

        <Panel>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
                Reviews
              </p>
              <h3 className="mt-2 text-2xl font-bold text-slate-950">Customer feedback</h3>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black text-slate-950">{reviewAverage.toFixed(1)}</p>
              <p className="text-sm text-slate-500">Average rating</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {reviews.length === 0 ? (
              <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                No reviews yet. Be the first to leave one.
              </p>
            ) : (
              reviews.map((review) => (
                <article key={review._id} className="rounded-[1.5rem] border border-slate-200 p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-semibold text-slate-950">
                        {review.owner?.username || "Anonymous buyer"}
                      </p>
                      <div className="mt-2">
                        <RatingStars rating={review.rating ?? review.ratings ?? 0} />
                      </div>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-600">{review.comment}</p>

                  <div className="mt-4 space-y-3 rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                      Replies
                    </p>
                    {(review.replies || []).length ? (
                      review.replies.map((reply) => (
                        <div key={reply._id} className="rounded-2xl border border-slate-200 bg-white p-3">
                          <p className="text-sm font-semibold text-slate-900">
                            {reply.owner?.username || "Marketplace user"}
                          </p>
                          <p className="mt-1 text-sm text-slate-600">{reply.comment}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">No replies yet.</p>
                    )}

                    <div className="space-y-3">
                      <TextArea
                        value={replyDrafts[review._id] || ""}
                        onChange={(e) =>
                          setReplyDrafts((current) => ({
                            ...current,
                            [review._id]: e.target.value,
                          }))
                        }
                        placeholder="Reply to this review"
                        className="min-h-24"
                      />
                      <SecondaryButton type="button" onClick={() => handleReplySubmit(review._id)}>
                        Add reply
                      </SecondaryButton>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </Panel>
      </section>
    </div>
  );
}

function RatingStars({ rating }) {
  return (
    <div className="flex items-center gap-1 text-amber-500">
      {[1, 2, 3, 4, 5].map((value) => (
        <svg
          key={value}
          viewBox="0 0 24 24"
          className={`h-5 w-5 ${
            value <= Math.round(rating) ? "fill-current" : "fill-slate-200"
          }`}
        >
          <path d="m12 2.5 2.92 5.92 6.53.95-4.72 4.6 1.12 6.5L12 17.4l-5.85 3.07 1.12-6.5-4.72-4.6 6.53-.95z" />
        </svg>
      ))}
    </div>
  );
}

function PackageIllustration() {
  return (
    <svg viewBox="0 0 24 24" className="h-20 w-20 fill-none stroke-current stroke-1.5">
      <path d="m3 7 9-4 9 4-9 4z" />
      <path d="M3 7v10l9 4 9-4V7" />
      <path d="M12 11v10" />
    </svg>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <dt className="font-semibold text-slate-900">{label}</dt>
      <dd className="mt-1">{value}</dd>
    </div>
  );
}
