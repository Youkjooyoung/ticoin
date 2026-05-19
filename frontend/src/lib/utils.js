import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...args) {
  return twMerge(clsx(...args));
}

export function fmtPrice(n, digits = 2) {
  if (n == null || isNaN(n)) return '-';
  return Number(n).toLocaleString('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function fmtMoney(value, type = 'CRYPTO') {
  if (value == null || isNaN(value)) return '-';
  if (type === 'STOCK') return `$${fmtPrice(value, Number(value) < 10 ? 4 : 2)}`;
  return `$${fmtPrice(value, Number(value) < 10 ? 4 : 2)}`;
}

export function fmtVolume(value, type = 'CRYPTO') {
  if (value == null || isNaN(value)) return '-';
  const prefix = type === 'STOCK' || type === 'CRYPTO' ? '$' : '';
  return `${prefix}${fmtCompact(value)}`;
}

export function displaySymbol(symbol) {
  if (!symbol) return '';
  let value = String(symbol).toUpperCase();
  if (value.includes('-')) value = value.split('-').at(-1);
  if (value.includes('/')) value = value.split('/')[0];
  return value;
}

export function pairSymbol(symbol, type = 'CRYPTO') {
  const base = displaySymbol(symbol);
  return type === 'CRYPTO' ? `${base}/USDT` : base;
}

export function fmtCompact(n) {
  if (n == null || isNaN(n)) return '-';
  const abs = Math.abs(n);
  if (abs >= 1e12) return `${(n / 1e12).toFixed(2)}T`;
  if (abs >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `${(n / 1e3).toFixed(2)}K`;
  return n.toFixed(2);
}

export function fmtPct(n) {
  if (n == null || isNaN(n)) return '-';
  const sign = n > 0 ? '+' : '';
  return `${sign}${Number(n).toFixed(2)}%`;
}

export function changeClass(n) {
  if (n > 0) return 'text-up';
  if (n < 0) return 'text-down';
  return 'text-text-3';
}
