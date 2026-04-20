import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { api } from "../../api.js";
import {
  AccentButton,
  EmptyState,
  InlineAlert,
  LoadingState,
  PageHero,
  Panel,
  SecondaryButton,
} from "../components/ui.jsx";
import { formatCurrency } from "../utils/formatters.js";
import { launchRazorpayCheckout } from "../utils/payments.js";

export default function CartProducts({ isLoggedIn }) {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState("");
  const [checkingOut, setCheckingOut] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const getCartProducts = async () => {
      try {
        setLoading(true);
        const res = await api.get("/api/products/cart-details");
        setProducts(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        setMessage(error.response?.data?.error || "Unable to load cart.");
      } finally {
        setLoading(false);
      }
    };

    getCartProducts();
  }, []);

  const total = useMemo(
    () =>
      products.reduce(
        (sum, product) => sum + Number(product.price || 0) * Number(product.quantity || 0),
        0
      ),
    [products]
  );

  if (!isLoggedIn) {
    return <Navigate to="/auth" replace state={{ url: "/cart" }} />;
  }

  const handleCartDelete = async (id) => {
    try {
      setDeletingId(id);
      await api.delete(`/api/products/cart/${id}`);
      setProducts((current) => current.filter((product) => product.id !== id));
    } catch (error) {
      setMessage(error.response?.data?.error || "Unable to remove item.");
    } finally {
      setDeletingId("");
    }
  };

  const handleQuantityChange = async (id, quantity) => {
    try {
      await api.patch(`/api/products/cart/${id}`, { quantity });
      setProducts((current) =>
        current.map((product) =>
          product.id === id ? { ...product, quantity } : product
        )
      );
    } catch (error) {
      setMessage(error.response?.data?.error || "Unable to update quantity.");
    }
  };

  const handleCheckout = async () => {
    try {
      setCheckingOut(true);
      setMessage("");
      const orderRes = await api.post("/api/products/checkout/cart-order");
      const paymentResult = await launchRazorpayCheckout(orderRes.data);

      await api.post("/api/products/checkout/cart-verify", {
        orderId: orderRes.data.orderId,
        razorpay_order_id: paymentResult.razorpay_order_id,
        razorpay_payment_id: paymentResult.razorpay_payment_id,
        razorpay_signature: paymentResult.razorpay_signature,
      });

      setProducts([]);
      setMessage("Payment successful. Your cart order has been placed.");
    } catch (error) {
      setMessage(error.response?.data?.error || error.message || "Checkout failed.");
    } finally {
      setCheckingOut(false);
    }
  };

  if (loading) {
    return <LoadingState label="Loading your cart" />;
  }

  return (
    <div className="space-y-8">
      <PageHero
        badge="Cart"
        title="Review your order"
        description="The cart now has clearer totals, cleaner item controls, and a checkout summary that feels more intentional."
        actions={
          <SecondaryButton onClick={() => navigate("/products")}>
            Continue shopping
          </SecondaryButton>
        }
      />

      {message ? <InlineAlert>{message}</InlineAlert> : null}

      {products.length === 0 ? (
        <EmptyState
          title="Your cart is empty"
          description="Browse the catalog, add products you like, and come back here to review the order."
          action={
            <AccentButton onClick={() => navigate("/products")}>
              Start shopping
            </AccentButton>
          }
        />
      ) : (
        <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <Panel className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
                  Items
                </p>
                <h2 className="mt-2 text-2xl font-bold text-slate-950">
                  Cart items ({products.length})
                </h2>
              </div>
            </div>

            <div className="space-y-4">
              {products.map((product) => (
                <article
                  key={product.id}
                  className="grid gap-4 rounded-[1.5rem] border border-slate-200 p-4 md:grid-cols-[120px_1fr_auto]"
                >
                  <div className="overflow-hidden rounded-2xl bg-slate-100">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-28 w-full object-cover"
                      />
                    ) : (
                      <div className="grid h-28 place-items-center text-sm text-slate-400">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h3 className="text-lg font-bold text-slate-950">{product.name}</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Unit price: {formatCurrency(product.price)}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Section: {product.section || "general"} | Stock left: {product.availableQuantity}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <label className="text-sm font-semibold text-slate-700">
                        Qty
                      </label>
                      <select
                        value={product.quantity}
                        onChange={(e) =>
                          handleQuantityChange(product.id, Number(e.target.value))
                        }
                        className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none focus:border-amber-400"
                      >
                        {Array.from(
                          { length: Math.max(1, Math.min(Number(product.availableQuantity || 1), 10)) },
                          (_, index) => index + 1
                        ).map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col items-start justify-between gap-4 md:items-end">
                    <p className="text-xl font-black text-slate-950">
                      {formatCurrency(product.price * product.quantity)}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleCartDelete(product.id)}
                      disabled={deletingId === product.id}
                      className="rounded-full border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {deletingId === product.id ? "Removing..." : "Remove"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </Panel>

          <Panel className="space-y-5 bg-slate-950 text-white">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-300">
                Summary
              </p>
              <h2 className="mt-2 text-2xl font-black">Order overview</h2>
            </div>

            <div className="space-y-3 rounded-[1.5rem] bg-white/5 p-5">
              <div className="flex items-center justify-between text-sm text-slate-200">
                <span>Items subtotal</span>
                <span>{formatCurrency(total)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-200">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="border-t border-white/10 pt-3">
                <div className="flex items-center justify-between text-lg font-bold text-white">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            </div>

            <AccentButton onClick={handleCheckout} disabled={checkingOut}>
              {checkingOut ? "Processing payment..." : "Proceed to checkout"}
            </AccentButton>
          </Panel>
        </section>
      )}
    </div>
  );
}
