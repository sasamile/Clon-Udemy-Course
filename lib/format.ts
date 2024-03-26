export const formatPrice = (price: number) => {
  return new Intl.NumberFormat("USD", {
    style: "currency",
    currency: "USD",
  }).format(price);
};
