export function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

export function averageRating(reviews) {
  if (!reviews?.length) return 0;
  const total = reviews.reduce(
    (sum, review) => sum + Number(review.rating ?? review.ratings ?? 0),
    0
  );
  return total / reviews.length;
}
