export function generateSKU(productName) {
  const prefix = productName
    .trim()
    .slice(0, 3)
    .toUpperCase();

  const uniqueCode = crypto.randomUUID()
    .slice(0, 8)
    .toUpperCase();

  return `${prefix}-${uniqueCode}`;
}