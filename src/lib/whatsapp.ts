/** Strip formatting; keep digits only for wa.me (country code included). */
export function sanitizeWhatsAppDigits(raw: string): string {
  return (raw || '').replace(/[+\s-]/g, '').replace(/[^\d]/g, '');
}

export function getPublicAppOrigin(): string {
  const fromEnv = typeof import.meta.env.VITE_APP_URL === 'string' ? import.meta.env.VITE_APP_URL.trim() : '';
  if (fromEnv) return fromEnv.replace(/\/$/, '');
  if (typeof window !== 'undefined') return window.location.origin;
  return '';
}

export function buildProductPageUrl(productId: string): string {
  return `${getPublicAppOrigin()}/products/${productId}`;
}

/** Returns null if phone digits are missing (caller shows fallback UI). */
export function buildWaMeUrl(sanitizedPhoneDigits: string, message: string): string | null {
  if (!sanitizedPhoneDigits || !message.trim()) return null;
  return `https://wa.me/${sanitizedPhoneDigits}?text=${encodeURIComponent(message)}`;
}

export function buildCartBuyNowWhatsAppMessage(params: {
  title: string;
  quantity: number;
  unitPrice: number;
  productPageUrl: string;
}): string {
  const qty = params.quantity || 1;
  const lineTotal = params.unitPrice * qty;
  return [
    'Hello!',
    `Product: ${params.title}`,
    `Quantity: ${qty}`,
    `Product price: Rs ${params.unitPrice.toLocaleString()}`,
    `Total price: Rs ${lineTotal.toLocaleString()}`,
    "I'm interested in buying this item from your listing.",
    `Product link: ${params.productPageUrl}`,
    'Is this available?',
  ].join('\n');
}
