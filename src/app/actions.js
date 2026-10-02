"use server";

import { headers } from "next/headers";
import QRCode from "qrcode";
import { createOrder } from "@/lib/orders";
import { RECEIPT_BASE_URL } from "@/lib/shop-config";
import { buildReceiptBaseUrl } from "@/lib/receipt-url";

export async function createOrderAction(lineItems) {
  try {
    const order = await createOrder(lineItems);

    const headerList = await headers();
    const baseUrl = buildReceiptBaseUrl({
      configured: RECEIPT_BASE_URL,
      host: headerList.get("host"),
      protocol: headerList.get("x-forwarded-proto"),
    });
    const receiptUrl = `${baseUrl}/receipt/${order.id}`;

    const qrDataUrl = await QRCode.toDataURL(receiptUrl, {
      margin: 1,
      width: 360,
      errorCorrectionLevel: "M",
      color: { dark: "#0b1020", light: "#ffffff" },
    });

    return {
      ok: true,
      orderId: order.id,
      receiptUrl,
      qrDataUrl,
      total: order.total,
      itemCount: order.items.length,
    };
  } catch (error) {
    return { ok: false, error: error.message || "Could not create the order." };
  }
}
