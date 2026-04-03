export async function launchRazorpayCheckout(config) {
  if (typeof window === "undefined" || !window.Razorpay) {
    throw new Error("Razorpay checkout is not available.");
  }

  return new Promise((resolve, reject) => {
    const razorpay = new window.Razorpay({
      key: config.key,
      amount: config.amount,
      currency: config.currency,
      name: config.name,
      description: config.description,
      order_id: config.gatewayOrderId,
      handler: resolve,
      prefill: config.prefill,
      theme: {
        color: "#0f172a",
      },
      modal: {
        ondismiss: () => reject(new Error("Payment cancelled.")),
      },
    });

    razorpay.open();
  });
}
