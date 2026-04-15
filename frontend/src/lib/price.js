export function getPriceStep(price) {
  const p = Math.abs(Number(price) || 0);
  if (p >= 10_000_000) return 10_000;
  if (p >= 1_000_000) return 1_000;
  if (p >= 100_000) return 100;
  if (p >= 10_000) return 10;
  if (p >= 1_000) return 10;
  if (p >= 100) return 1;
  if (p >= 10) return 0.1;
  if (p >= 1) return 0.01;
  if (p >= 0.1) return 0.001;
  if (p >= 0.01) return 0.0001;
  if (p >= 0.001) return 0.00001;
  return 0.0000001;
}

export function getPricePrecision(price) {
  const p = Math.abs(Number(price) || 0);
  if (p >= 100) return 2;
  if (p >= 10) return 3;
  if (p >= 1) return 4;
  if (p >= 0.01) return 5;
  return 8;
}
