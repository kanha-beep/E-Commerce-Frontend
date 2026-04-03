import {
  AccentButton,
  InlineAlert,
  SecondaryButton,
  TextArea,
  TextInput,
} from "../components/ui.jsx";
import { DEFAULT_LISTING_FORM, SECTION_OPTIONS } from "./listingConfig.js";

export function buildListingFormData(form, files, existingMedia = []) {
  const payload = new FormData();
  Object.entries(form).forEach(([key, value]) => {
    if (key === "specificationsText") return;
    payload.append(key, value);
  });

  payload.append(
    "specifications",
    form.specificationsText || DEFAULT_LISTING_FORM.specificationsText
  );
  payload.append("existingMedia", JSON.stringify(existingMedia));

  Array.from(files || []).forEach((file) => {
    payload.append("media", file);
  });

  return payload;
}

export default function ProductListingForm({
  form,
  onChange,
  onSubmit,
  onCancel,
  submitLabel,
  cancelLabel = "Cancel",
  saving,
  error,
  mediaPreview = [],
  allowMediaRemoval = false,
  onRemoveMedia,
}) {
  return (
    <form className="mt-6 space-y-5" onSubmit={onSubmit}>
      {error ? <InlineAlert>{error}</InlineAlert> : null}

      <div className="grid gap-5 lg:grid-cols-2">
        <Field label="Product name">
          <TextInput
            name="name"
            value={form.name}
            onChange={onChange}
            placeholder="Apple AirPods Pro (2nd Gen)"
            required
          />
        </Field>

        <Field label="Brand">
          <TextInput
            name="brand"
            value={form.brand}
            onChange={onChange}
            placeholder="Apple"
          />
        </Field>

        <Field label="Price">
          <TextInput
            type="number"
            step="0.01"
            min="1"
            name="price"
            value={form.price}
            onChange={onChange}
            placeholder="24999"
            required
          />
        </Field>

        <Field label="Quantity">
          <TextInput
            type="number"
            min="1"
            name="quantity"
            value={form.quantity}
            onChange={onChange}
            placeholder="20"
            required
          />
        </Field>

        <Field label="Section">
          <select
            name="section"
            value={form.section}
            onChange={onChange}
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
          >
            {SECTION_OPTIONS.filter((option) => option.value !== "all").map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Category">
          <TextInput
            name="category"
            value={form.category}
            onChange={onChange}
            placeholder="Wireless earbuds"
          />
        </Field>
      </div>

      <Field label="Short description">
        <TextInput
          name="shortDescription"
          value={form.shortDescription}
          onChange={onChange}
          placeholder="Active noise cancellation with MagSafe charging case"
        />
      </Field>

      <Field label="About this item">
        <TextArea
          name="description"
          value={form.description}
          onChange={onChange}
          placeholder="Write a fuller Amazon-style product description."
        />
      </Field>

      <Field label="Bullet points (one per line)">
        <TextArea
          name="bulletPoints"
          value={form.bulletPoints}
          onChange={onChange}
          placeholder={"Spatial audio\nSweat and water resistant\nUSB-C charging"}
        />
      </Field>

      <Field label='Specifications (JSON like [{"label":"Material","value":"Cotton"}])'>
        <TextArea
          name="specificationsText"
          value={form.specificationsText}
          onChange={onChange}
        />
      </Field>

      <div className="grid gap-5 lg:grid-cols-2">
        <Field label="Delivery info">
          <TextInput
            name="deliveryInfo"
            value={form.deliveryInfo}
            onChange={onChange}
          />
        </Field>

        <Field label="Return policy">
          <TextInput
            name="returnPolicy"
            value={form.returnPolicy}
            onChange={onChange}
          />
        </Field>
      </div>

      <Field label="Seller note">
        <TextArea
          name="sellerNote"
          value={form.sellerNote}
          onChange={onChange}
          placeholder="Mention packaging, warranty support, or store promise."
        />
      </Field>

      <Field label="Images and videos">
        <input
          type="file"
          name="mediaFiles"
          accept="image/*,video/*"
          multiple
          onChange={onChange}
          className="block w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-slate-950 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
        />
      </Field>

      {mediaPreview.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {mediaPreview.map((item, index) => (
            <div
              key={`${item.url}-${index}`}
              className="overflow-hidden rounded-[1.5rem] border border-slate-200"
            >
              <div className="h-48 bg-slate-100">
                {item.kind === "video" ? (
                  <video src={item.url} controls className="h-full w-full object-cover" />
                ) : (
                  <img src={item.url} alt={`Preview ${index + 1}`} className="h-full w-full object-cover" />
                )}
              </div>
              {allowMediaRemoval ? (
                <button
                  type="button"
                  onClick={() => onRemoveMedia?.(index)}
                  className="w-full border-t border-slate-200 px-4 py-3 text-sm font-semibold text-rose-700"
                >
                  Remove
                </button>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 pt-2 sm:flex-row">
        <AccentButton type="submit" disabled={saving} className="flex-1">
          {saving ? "Saving..." : submitLabel}
        </AccentButton>
        <SecondaryButton type="button" onClick={onCancel} className="flex-1">
          {cancelLabel}
        </SecondaryButton>
      </div>
    </form>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-slate-700">{label}</label>
      {children}
    </div>
  );
}
