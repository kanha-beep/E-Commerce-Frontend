import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../api.js";
import {
  AccentButton,
  EmptyState,
  LoadingState,
  PageHero,
  Panel,
  PrimaryButton,
  SecondaryButton,
  TextInput,
} from "../components/ui.jsx";
import { formatCurrency } from "../utils/formatters.js";
import { SECTION_BLURBS, SECTION_OPTIONS } from "./listingConfig.js";

export default function AllProducts({ isLoggedIn, user }) {
  const navigate = useNavigate();
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [activeSection, setActiveSection] = useState("all");

  useEffect(() => {
    const getAllProducts = async () => {
      try {
        const res = await api.get("/api/products");
        setAllProducts(Array.isArray(res.data) ? res.data : []);
      } catch {
        setAllProducts([]);
      } finally {
        setLoading(false);
      }
    };

    getAllProducts();
  }, []);

  const products = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return allProducts.filter((product) => {
      const matchesSection =
        activeSection === "all" || product.section === activeSection;

      if (!matchesSection) return false;
      if (!normalizedQuery) return true;

      return [
        product.name,
        product.brand,
        product.category,
        product.description,
        product.shortDescription,
        product.owner?.username,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedQuery));
    });
  }, [activeSection, allProducts, query]);

  const sections = useMemo(
    () =>
      SECTION_OPTIONS.filter((section) => section.value !== "all").map((section) => ({
        ...section,
        products: allProducts.filter((product) => product.section === section.value),
      })),
    [allProducts]
  );

  const spotlight = products.slice(0, 4);

  if (loading) {
    return <LoadingState label="Loading products" />;
  }

  return (
    <div className="space-y-8">
      <PageHero
        badge="Marketplace home"
        title="Browse by section, shop like a marketplace, sell like a vendor"
        description="The home page now works more like Amazon: buyers land in the storefront, filter by sections like clothing or grocery, open detailed product pages, and jump into cart or seller actions from the same flow."
        actions={
          <>
            <AccentButton onClick={() => navigate("/products/new")}>List a product</AccentButton>
            <SecondaryButton onClick={() => navigate("/seller/dashboard")}>
              Seller dashboard
            </SecondaryButton>
            <SecondaryButton onClick={() => navigate("/products/carts-show/user")}>
              Open cart
            </SecondaryButton>
          </>
        }
      />

      <section className="grid gap-4 xl:grid-cols-[1.25fr_340px]">
        <Panel className="space-y-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.25em] text-slate-400">
                Sections
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-950">
                Filter by shopping section
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                {SECTION_BLURBS[activeSection]}
              </p>
            </div>
            <div className="w-full max-w-md">
              <TextInput
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products, brands, or categories"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {SECTION_OPTIONS.map((section) => (
              <button
                key={section.value}
                type="button"
                onClick={() => setActiveSection(section.value)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  activeSection === section.value
                    ? "bg-slate-950 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {section.label}
              </button>
            ))}
          </div>

          {products.length === 0 ? (
            <EmptyState
              title="No matching products"
              description="Try a different search term or switch sections. Sellers can also create the first listing for this section."
              action={
                <AccentButton onClick={() => navigate("/products/new")}>
                  Add a product
                </AccentButton>
              }
            />
          ) : (
            <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
              {products.map((product) => (
                <article
                  key={product._id}
                  className="group overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_16px_50px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(15,23,42,0.12)]"
                >
                  <div className="relative h-64 overflow-hidden bg-slate-100">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="grid h-full place-items-center bg-[linear-gradient(135deg,_#e2e8f0,_#f8fafc)] text-slate-400">
                        <BoxIcon />
                      </div>
                    )}
                    <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur">
                      {product.section || "general"}
                    </div>
                    <div className="absolute bottom-4 left-4 rounded-full bg-slate-950/85 px-3 py-1 text-xs font-semibold text-white">
                      {product.quantity > 0 ? `${product.quantity} in stock` : "Out of stock"}
                    </div>
                  </div>

                  <div className="space-y-5 p-5">
                    <div className="space-y-2">
                      <h3 className="line-clamp-2 text-lg font-bold text-slate-950">
                        {product.name}
                      </h3>
                      <p className="text-sm text-slate-500">
                        {product.brand || product.category || "Marketplace choice"}
                      </p>
                      <p className="text-sm text-slate-500">
                        Seller: {product.owner?.username || "Marketplace partner"}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                          Price
                        </p>
                        <p className="text-2xl font-black text-slate-950">
                          {formatCurrency(product.price)}
                        </p>
                      </div>
                      <PrimaryButton
                        type="button"
                        onClick={() => navigate(`/products/${product._id}`)}
                      >
                        View details
                      </PrimaryButton>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </Panel>

        <div className="space-y-4">
          <Panel className="space-y-4 bg-slate-950 text-white">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-300">
              Account
            </p>
            <h3 className="text-2xl font-black">
              {isLoggedIn ? `Welcome back, ${user?.username}` : "Sign in to shop and sell"}
            </h3>
            <p className="text-sm leading-6 text-slate-300">
              Buyers can review, comment, and manage cart quantities. Sellers can list products with multiple images or videos and track orders from one dashboard.
            </p>
            <Link
              to={isLoggedIn ? "/seller/dashboard" : "/auth"}
              className="inline-flex items-center justify-center rounded-full bg-amber-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-300"
            >
              {isLoggedIn ? "Open seller dashboard" : "Login now"}
            </Link>
          </Panel>

          <Panel className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
              Section highlights
            </p>
            <div className="space-y-3">
              {sections.slice(0, 4).map((section) => (
                <FeatureCard
                  key={section.value}
                  title={section.label}
                  body={`${section.products.length} product${section.products.length === 1 ? "" : "s"} available`}
                />
              ))}
            </div>
          </Panel>
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
              Curated rows
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-950">
              Shopping sections laid out like a marketplace
            </h2>
          </div>
        </div>

        <div className="space-y-4">
          {(activeSection === "all" ? sections : sections.filter((item) => item.value === activeSection))
            .filter((section) => section.products.length > 0)
            .map((section) => (
              <Panel key={section.value} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-slate-950">{section.label}</h3>
                    <p className="mt-1 text-sm text-slate-500">{SECTION_BLURBS[section.value]}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveSection(section.value)}
                    className="text-sm font-semibold text-slate-700"
                  >
                    View all
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {section.products.slice(0, 4).map((product) => (
                    <button
                      key={product._id}
                      type="button"
                      onClick={() => navigate(`/products/${product._id}`)}
                      className="overflow-hidden rounded-[1.5rem] border border-slate-200 text-left transition hover:border-slate-300 hover:shadow-[0_15px_45px_rgba(15,23,42,0.08)]"
                    >
                      <div className="h-44 bg-slate-100">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="grid h-full place-items-center text-sm text-slate-400">
                            No image
                          </div>
                        )}
                      </div>
                      <div className="space-y-2 p-4">
                        <p className="line-clamp-2 text-sm font-semibold text-slate-900">
                          {product.name}
                        </p>
                        <p className="text-lg font-black text-slate-950">
                          {formatCurrency(product.price)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </Panel>
            ))}
        </div>
      </section>

      {spotlight.length ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {spotlight.map((product) => (
            <Panel key={product._id} className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                Featured
              </p>
              <h3 className="text-lg font-bold text-slate-950">{product.name}</h3>
              <p className="text-sm text-slate-500">
                {product.shortDescription || "Detailed product page with gallery, reviews, and cart actions."}
              </p>
              <PrimaryButton onClick={() => navigate(`/products/${product._id}`)}>
                Shop now
              </PrimaryButton>
            </Panel>
          ))}
        </section>
      ) : null}
    </div>
  );
}

function FeatureCard({ title, body }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-500">{body}</p>
    </div>
  );
}

function BoxIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-12 w-12 fill-none stroke-current stroke-1.5">
      <path d="m3 7 9-4 9 4-9 4z" />
      <path d="M3 7v10l9 4 9-4V7" />
      <path d="M12 11v10" />
    </svg>
  );
}
