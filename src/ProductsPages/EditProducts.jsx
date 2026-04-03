import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { api } from "../../api.js";
import { InlineAlert, LoadingState, PageHero, Panel } from "../components/ui.jsx";
import ProductListingForm, { buildListingFormData } from "./ProductListingForm.jsx";

function getSpecificationText(specifications = []) {
  return JSON.stringify(
    specifications.map((item) => ({ label: item.label, value: item.value })),
    null,
    2
  );
}

export default function EditProducts({ isLoggedIn, user }) {
  const navigate = useNavigate();
  const { productsId } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(null);
  const [ownerId, setOwnerId] = useState("");
  const [mediaFiles, setMediaFiles] = useState([]);
  const [existingMedia, setExistingMedia] = useState([]);
  const [mediaPreview, setMediaPreview] = useState([]);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const res = await api.get(`/api/products/${productsId}`);
        setForm({
          name: res.data.name || "",
          price: String(res.data.price || ""),
          quantity: String(res.data.quantity || 1),
          section: res.data.section || "other",
          category: res.data.category || "",
          brand: res.data.brand || "",
          shortDescription: res.data.shortDescription || "",
          description: res.data.description || "",
          bulletPoints: Array.isArray(res.data.bulletPoints)
            ? res.data.bulletPoints.join("\n")
            : "",
          sellerNote: res.data.sellerNote || "",
          deliveryInfo: res.data.deliveryInfo || "",
          returnPolicy: res.data.returnPolicy || "",
          specificationsText: getSpecificationText(res.data.specifications || []),
        });
        setExistingMedia(Array.isArray(res.data.media) ? res.data.media : []);
        setMediaPreview(Array.isArray(res.data.media) ? res.data.media : []);
        setOwnerId(res.data.owner?._id || res.data.owner || "");
      } catch (err) {
        setError(err.response?.data?.error || "Unable to load product.");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [productsId]);

  if (!isLoggedIn) {
    return <Navigate to="/auth" replace state={{ url: `/products/${productsId}/edit` }} />;
  }

  if (!loading && ownerId && ownerId.toString() !== user?.id?.toString()) {
    return <Navigate to={`/products/${productsId}`} replace />;
  }

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "mediaFiles") {
      const nextFiles = Array.from(files || []);
      setMediaFiles(nextFiles);
      setMediaPreview([
        ...existingMedia,
        ...nextFiles.map((file) => ({
          url: URL.createObjectURL(file),
          kind: file.type.startsWith("video/") ? "video" : "image",
        })),
      ]);
      return;
    }

    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = buildListingFormData(form, mediaFiles, existingMedia);
      await api.patch(`/api/products/${productsId}`, payload);
      navigate(`/products/${productsId}`);
    } catch (err) {
      setError(err.response?.data?.error || "Unable to update product.");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveMedia = (index) => {
    if (index < existingMedia.length) {
      const nextExisting = existingMedia.filter((_, itemIndex) => itemIndex !== index);
      setExistingMedia(nextExisting);
      setMediaPreview([
        ...nextExisting,
        ...mediaFiles.map((file) => ({
          url: URL.createObjectURL(file),
          kind: file.type.startsWith("video/") ? "video" : "image",
        })),
      ]);
      return;
    }

    const fileIndex = index - existingMedia.length;
    const nextFiles = mediaFiles.filter((_, itemIndex) => itemIndex !== fileIndex);
    setMediaFiles(nextFiles);
    setMediaPreview([
      ...existingMedia,
      ...nextFiles.map((file) => ({
        url: URL.createObjectURL(file),
        kind: file.type.startsWith("video/") ? "video" : "image",
      })),
    ]);
  };

  if (loading || !form) {
    return <LoadingState label="Loading editor" />;
  }

  return (
    <div className="space-y-8">
      <PageHero
        badge="Seller editor"
        title="Update your listing"
        description="Refine the same rich product data buyers see on the detail page, including section, stock, product copy, specs, and gallery media."
      />

      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <Panel className="space-y-4 bg-slate-950 text-white">
          <h2 className="text-2xl font-black">Seller notes</h2>
          <p className="text-sm leading-7 text-slate-300">
            Editing keeps your existing gallery media unless you remove it. New uploads get appended, and the first available image remains the main product image for cards and cart previews.
          </p>
          {error ? <InlineAlert>{error}</InlineAlert> : null}
        </Panel>

        <Panel>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
              Edit form
            </p>
            <h2 className="mt-2 text-3xl font-black text-slate-950">Refine listing</h2>
          </div>

          <ProductListingForm
            form={form}
            onChange={handleChange}
            onSubmit={handleSubmit}
            onCancel={() => navigate(`/products/${productsId}`)}
            submitLabel="Save changes"
            saving={saving}
            error={error}
            mediaPreview={mediaPreview}
            allowMediaRemoval
            onRemoveMedia={handleRemoveMedia}
          />
        </Panel>
      </div>
    </div>
  );
}
