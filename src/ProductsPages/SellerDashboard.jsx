import { useEffect, useState } from "react";
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

export default function SellerDashboard({ isLoggedIn, user }) {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const res = await api.get("/api/products/seller/dashboard");
        setDashboard(res.data);
      } catch (err) {
        setError(err.response?.data?.error || "Unable to load seller dashboard.");
      } finally {
        setLoading(false);
      }
    };

    if (isLoggedIn) loadDashboard();
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return <Navigate to="/auth" replace state={{ url: "/seller/dashboard" }} />;
  }

  if (loading) {
    return <LoadingState label="Loading seller dashboard" />;
  }

  const summary = dashboard?.summary || {
    productsListed: 0,
    totalInventory: 0,
    pendingOrders: 0,
    customOrderRequests: 0,
  };
  const products = dashboard?.products || [];
  const orders = dashboard?.orders || [];
  const customOrders = dashboard?.customOrders || [];

  return (
    <div className="space-y-8">
      <PageHero
        badge="Seller dashboard"
        title={`Manage your store${user?.username ? `, ${user.username}` : ""}`}
        description="Track how many products you listed, total stock left, pending orders, and incoming custom requests from one seller-facing dashboard."
        actions={
          <>
            <AccentButton onClick={() => navigate("/products/new")}>Add new listing</AccentButton>
            <SecondaryButton onClick={() => navigate("/products")}>View storefront</SecondaryButton>
          </>
        }
      />

      {error ? <InlineAlert>{error}</InlineAlert> : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Products listed" value={summary.productsListed} />
        <MetricCard label="Inventory units" value={summary.totalInventory} />
        <MetricCard label="Pending orders" value={summary.pendingOrders} />
        <MetricCard label="Custom requests" value={summary.customOrderRequests} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Panel className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
                Listings
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-950">Your products</h2>
            </div>
          </div>

          {products.length === 0 ? (
            <EmptyState
              title="No products listed yet"
              description="Start by creating your first listing with pricing, stock, media, and detailed product information."
              action={<AccentButton onClick={() => navigate("/products/new")}>Create listing</AccentButton>}
            />
          ) : (
            <div className="space-y-3">
              {products.map((product) => (
                <button
                  key={product._id}
                  type="button"
                  onClick={() => navigate(`/products/${product._id}`)}
                  className="grid w-full gap-4 rounded-[1.5rem] border border-slate-200 p-4 text-left transition hover:border-slate-300 md:grid-cols-[90px_1fr_auto]"
                >
                  <div className="h-24 overflow-hidden rounded-2xl bg-slate-100">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="grid h-full place-items-center text-sm text-slate-400">No image</div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-950">{product.name}</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {product.section} / {product.category || "general"}
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                      Qty left: {product.quantity} | {product.productionStatus || "live"}
                    </p>
                  </div>
                  <div className="flex flex-col items-start justify-between md:items-end">
                    <p className="text-xl font-black text-slate-950">
                      {formatCurrency(product.price)}
                    </p>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      {Array.isArray(product.media) ? product.media.length : 0} media
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </Panel>

        <div className="space-y-6">
          <Panel className="space-y-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
                Orders
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-950">Pending and recent orders</h2>
            </div>

            {orders.length === 0 ? (
              <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                No orders yet for your listings.
              </p>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div key={order._id} className="rounded-[1.5rem] border border-slate-200 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-950">
                          Buyer: {order.buyer?.username || "Marketplace buyer"}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {order.itemCount} item{order.itemCount === 1 ? "" : "s"} | {order.status}
                        </p>
                      </div>
                      <p className="text-lg font-black text-slate-950">
                        {formatCurrency(order.amount)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          <Panel className="space-y-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
                Custom
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-950">Custom order requests</h2>
            </div>

            {customOrders.length === 0 ? (
              <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                No custom requests yet.
              </p>
            ) : (
              <div className="space-y-3">
                {customOrders.map((order) => (
                  <div key={order._id} className="rounded-[1.5rem] border border-slate-200 p-4">
                    <p className="font-semibold text-slate-950">
                      {order.product?.name || "Product"} for {order.buyer?.username || "buyer"}
                    </p>
                    <p className="mt-2 text-sm text-slate-500">{order.improvementNote}</p>
                    <p className="mt-2 text-sm font-semibold text-slate-700">
                      Status: {order.status}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>
      </section>
    </div>
  );
}

function MetricCard({ label, value }) {
  return (
    <Panel className="space-y-2">
      <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">{label}</p>
      <p className="text-4xl font-black text-slate-950">{value}</p>
    </Panel>
  );
}
