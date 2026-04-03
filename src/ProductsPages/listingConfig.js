export const SECTION_OPTIONS = [
  { value: "all", label: "All" },
  { value: "clothing", label: "Clothing" },
  { value: "grocery", label: "Grocery" },
  { value: "electronics", label: "Electronics" },
  { value: "home", label: "Home" },
  { value: "beauty", label: "Beauty" },
  { value: "books", label: "Books" },
  { value: "sports", label: "Sports" },
  { value: "other", label: "Other" },
];

export const SECTION_BLURBS = {
  all: "Shop the whole marketplace",
  clothing: "Fashion, footwear, and accessories",
  grocery: "Daily essentials and pantry picks",
  electronics: "Devices, accessories, and gadgets",
  home: "Furniture, decor, and home utility",
  beauty: "Skin care, wellness, and grooming",
  books: "Books, stationery, and learning",
  sports: "Fitness, outdoor, and game gear",
  other: "Everything else in the catalog",
};

export const DEFAULT_LISTING_FORM = {
  name: "",
  price: "",
  quantity: "1",
  section: "electronics",
  category: "",
  brand: "",
  shortDescription: "",
  description: "",
  bulletPoints: "",
  sellerNote: "",
  deliveryInfo: "Free delivery across India",
  returnPolicy: "7-day replacement",
  specificationsText: '[{"label":"Material","value":"Premium build"},{"label":"Warranty","value":"1 year"}]',
};
