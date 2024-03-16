export const formatPrice = (price: number) => {
  return new Intl.NumberFormat("en-CO", {
    style: "currency",
    currency: "COP",
  }).format(price);
};
