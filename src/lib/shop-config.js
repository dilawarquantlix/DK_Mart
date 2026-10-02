export const SHOP_NAME = "DK Mart";

export const SHOP_TAGLINE = "Shop & Billing";

// Optional fixed public base URL for receipt QR codes (for example your
// deployed domain). Leave it unset and a reachable URL is detected
// automatically from the request, so scanning works on your local network.
export const RECEIPT_BASE_URL = (
  process.env.RECEIPT_BASE_URL ||
  process.env.NEXT_PUBLIC_RECEIPT_BASE_URL ||
  ""
).replace(/\/+$/, "");

export const CURRENCY = "PKR";

export const UNITS = [
  "kg",
  "gram",
  "litre",
  "ml",
  "piece",
  "pack",
  "dozen",
  "bottle",
  "bag",
];

export const DEFAULT_ITEMS = [
  { name: "Wheat", unit: "kg", price: 100 },
  { name: "Rice", unit: "kg", price: 400 },
  { name: "Oil", unit: "litre", price: 600 },
  { name: "Sugar", unit: "kg", price: 200 },
  { name: "Tea", unit: "kg", price: 2000 },
];

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function formatMoney(amount) {
  const value = Math.round((Number(amount) || 0) * 100) / 100;
  const negative = value < 0;
  const fixed = Math.abs(value).toFixed(Number.isInteger(value) ? 0 : 2);
  const [whole, decimals] = fixed.split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const sign = negative ? "-" : "";
  return `${CURRENCY} ${sign}${grouped}${decimals ? `.${decimals}` : ""}`;
}

export function formatQuantity(quantity) {
  const value = Number(quantity) || 0;
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(2).replace(/\.?0+$/, "");
}

export function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const hours24 = date.getHours();
  const hours = hours24 % 12 || 12;
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const meridiem = hours24 >= 12 ? "PM" : "AM";

  return `${String(date.getDate()).padStart(2, "0")} ${
    MONTHS[date.getMonth()]
  } ${date.getFullYear()}, ${hours}:${minutes} ${meridiem}`;
}
