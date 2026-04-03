import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { api } from "../../api.js";
import { PageHero, Panel } from "../components/ui.jsx";
import ProductListingForm, { buildListingFormData } from "./ProductListingForm.jsx";
import { DEFAULT_LISTING_FORM } from "./listingConfig.js";

export default function NewProducts({ isLoggedIn }) {
  const navigate = useNavigate();
  const [form, setForm] = useState(DEFAULT_LISTING_FORM);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaPreview, setMediaPreview] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isLoggedIn) {
    return <Navigate to="/auth" replace state={{ url: "/products/new" }} />;
  }

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "mediaFiles") {
      const nextFiles = Array.from(files || []);
      setMediaFiles(nextFiles);
      setMediaPreview(
        nextFiles.map((file) => ({
          url: URL.createObjectURL(file),
          kind: file.type.startsWith("video/") ? "video" : "image",
        }))
      );
      return;
    }

    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleNewProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = buildListingFormData(form, mediaFiles);
      await api.post("/api/products/new", payload);
      navigate("/seller/dashboard");
    } catch (e2) {
      setError(e2.response?.data?.error || "Unable to create product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHero
        badge="Seller studio"
        title="List a new product like a marketplace seller"
        description="Create a fuller listing with section, category, stock count, product highlights, specifications, and multiple images or videos so buyers get a proper storefront experience."
      />

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Panel className="space-y-4 bg-slate-950 text-white">
          <h2 className="text-2xl font-black">Listing checklist</h2>
          <p className="text-sm leading-7 text-slate-300">
            Think of this as an Amazon-style seller form: choose the right section, describe the product clearly, add stock quantity, and upload enough media for buyers to trust the listing.
          </p>
          <div className="grid gap-3">
            <ChecklistItem text="Section and category set correctly" />
            <ChecklistItem text="Stock quantity included for cart limits" />
            <ChecklistItem text="Multiple images or videos uploaded" />
            <ChecklistItem text="Bullet points and specifications filled" />
          </div>
        </Panel>

        <Panel>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
              Product form
            </p>
            <h2 className="mt-2 text-3xl font-black text-slate-950">Create listing</h2>
          </div>

          <ProductListingForm
            form={form}
            onChange={handleChange}
            onSubmit={handleNewProduct}
            onCancel={() => navigate("/products")}
            submitLabel="Publish product"
            saving={loading}
            error={error}
            mediaPreview={mediaPreview}
          />
        </Panel>
      </div>
    </div>
  );
}

function ChecklistItem({ text }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <div className="h-2.5 w-2.5 rounded-full bg-amber-300" />
      <p className="text-sm text-slate-200">{text}</p>
    </div>
  );
}
