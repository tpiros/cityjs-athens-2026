export type Item = {
  name: string;
  /** Price of one unit, in pence. */
  price: number;
  quantity: number;
};

/** Total in pence, after a percentage discount (10 means 10%). */
export function total(items: Item[], discountPercent = 0): number {
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  return subtotal - subtotal * discountPercent;
}
