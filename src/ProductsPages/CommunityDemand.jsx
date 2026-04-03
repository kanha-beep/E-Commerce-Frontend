import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { api } from "../../api.js";
import {
  AccentButton,
  InlineAlert,
  LoadingState,
  PageHero,
  Panel,
  TextArea,
  TextInput,
} from "../components/ui.jsx";
import { formatCurrency } from "../utils/formatters.js";

const initialForm = {
  title: "",
  category: "",
  description: "",
  desiredPrice: "",
  image: "",
};

export default function CommunityDemand({ isLoggedIn, user }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishingId, setPublishingId] = useState("");
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    const loadRequests = async () => {
      try {
        const res = await api.get("/api/demand");
        setRequests(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        setMessage(error.response?.data?.error || "Unable to load community demand.");
      } finally {
        setLoading(false);
      }
    };

    loadRequests();
  }, []);

  const listedCount = useMemo(
    () => requests.filter((request) => request.status === "listed").length,
    [requests]
  );
  const assignedCount = useMemo(
    () => requests.filter((request) => request.status === "assigned").length,
    [requests]
  );

  if (!isLoggedIn) {
    return <Navigate to="/auth" replace state={{ url: "/community-demand" }} />;
  }

  const handleChange = (e) => {
    setFormData((current) => ({ ...current, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const res = await api.post("/api/demand", formData);
      setRequests((current) => [res.data, ...current]);
      setFormData(initialForm);
      setMessage("Product request posted to the community.");
    } catch (error) {
      setMessage(error.response?.data?.error || "Unable to create request.");
    } finally {
      setSaving(false);
    }
  };

  const handleVote = async (requestId, value) => {
    try {
      const res = await api.post(`/api/demand/${requestId}/vote`, { value });
      setRequests((current) =>
        current.map((request) => (request._id === requestId ? res.data : request))
      );
    } catch (error) {
      setMessage(error.response?.data?.error || "Unable to register vote.");
    }
  };

  const handlePublish = async (requestId) => {
    try {
      setPublishingId(requestId);
      const res = await api.post(`/api/demand/${requestId}/publish`, {
        producerMessage: `${user?.username} made the product and posted it to the community.`,
      });
      setRequests((current) =>
        current.map((request) => (request._id === requestId ? res.data : request))
      );
      setMessage("Producer published the finished product to the community.");
    } catch (error) {
      setMessage(error.response?.data?.error || "Unable to publish this request.");
    } finally {
      setPublishingId("");
    }
  };

  if (loading) {
    return <LoadingState label="Loading community demand" />;
  }

  return (
    <div className="space-y-8">
      <PageHero
        badge="Demand-side production"
        title="Let buyers decide what should exist next"
        description="If a product is missing, post it here. Once the request reaches its support threshold, we route it to a relevant producer. After the producer actually makes it, they publish the finished product back to the community."
        actions={
          <>
            <div className="rounded-full border border-white/15 bg-white/10 px-4 py-3 text-sm text-white">
              Logged in as {user?.username}
            </div>
            <Link
              to="/products"
              className="inline-flex items-center justify-center rounded-full bg-amber-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-300"
            >
              Browse products
            </Link>
          </>
        }
      />

      {message ? (
        <InlineAlert tone={message.includes("posted") ? "success" : "error"}>
          {message}
        </InlineAlert>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Panel className="space-y-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
              New request
            </p>
            <h2 className="mt-2 text-3xl font-black text-slate-950">
              Ask for a missing product
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Example: a specific shoe model, colorway, or design that is not currently available in the catalog.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Product title</label>
              <TextInput
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Nike Air Max community edition"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Category</label>
              <TextInput
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="Shoes"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Target price</label>
              <TextInput
                type="number"
                min="1"
                name="desiredPrice"
                value={formData.desiredPrice}
                onChange={handleChange}
                placeholder="4999"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Reference image URL</label>
              <TextInput
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Instructions</label>
              <TextArea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the design, material, comfort, size profile, colorway, and why the community would want it."
                required
              />
            </div>
            <AccentButton type="submit" disabled={saving}>
              {saving ? "Posting..." : "Post to community"}
            </AccentButton>
          </form>
        </Panel>

        <div className="space-y-6">
          <Panel className="grid gap-4 sm:grid-cols-3">
            <Metric title="Open requests" value={String(requests.length)} />
            <Metric title="Assigned" value={String(assignedCount)} />
            <Metric title="Made live" value={String(listedCount)} />
            <Metric title="Threshold" value="1 likes" />
          </Panel>

          <div className="space-y-4">
            {requests.map((request) => (
              <Panel key={request._id} className="space-y-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                        {request.category}
                      </span>
                      <RequestStatus status={request.status} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-950">{request.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {request.description}
                      </p>
                    </div>
                  </div>
                  {request.image ? (
                    <img
                      src={request.image}
                      alt={request.title}
                      className="h-28 w-28 rounded-2xl object-cover"
                    />
                  ) : null}
                </div>

                <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                      <span>Requested by {request.createdBy?.username || "community member"}</span>
                      <span>Target price {formatCurrency(request.desiredPrice)}</span>
                      {request.assignedProducer ? (
                        <span>
                          Assigned producer {request.assignedProducer.username}
                        </span>
                      ) : null}
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all"
                        style={{
                          width: `${Math.min((request.likes / request.threshold) * 100, 100)}%`,
                        }}
                      />
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm font-medium">
                      <span className="text-emerald-600">{request.likes} likes</span>
                      <span className="text-rose-600">{request.dislikes} dislikes</span>
                      <span className="text-slate-500">
                        {Math.max(request.threshold - request.likes, 0)} likes to go
                      </span>
                    </div>
                    {request.linkedProduct ? (
                      <Link
                        to={`/products/${request.linkedProduct._id || request.linkedProduct}`}
                        className="inline-flex items-center text-sm font-semibold text-slate-950 underline decoration-amber-300 decoration-2 underline-offset-4"
                      >
                        View made product
                      </Link>
                    ) : null}
                    {request.producerMessage ? (
                      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                        {request.producerMessage}
                      </div>
                    ) : null}
                  </div>

                  <div className="flex gap-3">
                    <VoteButton
                      active={request.currentUserVote === 1}
                      tone="like"
                      onClick={() => handleVote(request._id, 1)}
                    >
                      Like
                    </VoteButton>
                    <VoteButton
                      active={request.currentUserVote === -1}
                      tone="dislike"
                      onClick={() => handleVote(request._id, -1)}
                    >
                      Dislike
                    </VoteButton>
                    {request.status === "assigned" &&
                    request.assignedProducer?._id === user?.id ? (
                      <button
                        type="button"
                        onClick={() => handlePublish(request._id)}
                        disabled={publishingId === request._id}
                        className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
                      >
                        {publishingId === request._id ? "Publishing..." : "Product made"}
                      </button>
                    ) : null}
                  </div>
                </div>
              </Panel>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function Metric({ title, value }) {
  return (
    <div className="rounded-[1.5rem] bg-slate-50 p-5">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">{title}</p>
      <p className="mt-3 text-3xl font-black text-slate-950">{value}</p>
    </div>
  );
}

function RequestStatus({ status }) {
  const tone =
    status === "listed"
      ? "bg-emerald-50 text-emerald-700"
      : status === "assigned"
        ? "bg-amber-50 text-amber-700"
        : "bg-sky-50 text-sky-700";

  const label =
    status === "listed"
      ? "Made live"
      : status === "assigned"
        ? "Assigned to producer"
        : "Open";

  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone}`}>{label}</span>;
}

function VoteButton({ active, tone, onClick, children }) {
  const classes =
    tone === "like"
      ? active
        ? "bg-emerald-600 text-white"
        : "border border-emerald-200 bg-emerald-50 text-emerald-700"
      : active
        ? "bg-rose-600 text-white"
        : "border border-rose-200 bg-rose-50 text-rose-700";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${classes}`}
    >
      {children}
    </button>
  );
}
