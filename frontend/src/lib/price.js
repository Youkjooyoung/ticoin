/**
 * 가격 크기에 따라 호가(tick) 단위를 계산한다.
 * - 1,000만 이상: 1만 단위
 * - 100만 이상: 1천 단위
 * - 10만 이상: 100 단위
 * - 1만 이상: 10 단위
 * - 1천 이상: 10 단위
 * - 100 이상: 1 단위
 * - 10 이상: 0.1 단위
 * - 1 이상: 0.01 단위
 * - 소수점 가격: 한 자리씩 내려가며 세분화
 */
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

/**
 * 가격 자릿수에 맞는 소수점 자리수를 반환 (표시용)
 */
export function getPricePrecision(price) {
  const p = Math.abs(Number(price) || 0);
  if (p >= 100) return 2;
  if (p >= 10) return 3;
  if (p >= 1) return 4;
  if (p >= 0.01) return 5;
  return 8;
}
