/**
 * Binance 거래소 심볼 매핑 (ticoin symbol -> Binance USDT pair)
 */
const STATIC_MAP = {
  BTC: 'BTCUSDT',
  ETH: 'ETHUSDT',
  SOL: 'SOLUSDT',
  XRP: 'XRPUSDT',
  DOGE: 'DOGEUSDT',
  ADA: 'ADAUSDT',
  BNB: 'BNBUSDT',
  AVAX: 'AVAXUSDT',
  MATIC: 'MATICUSDT',
  LINK: 'LINKUSDT',
  DOT: 'DOTUSDT',
  LTC: 'LTCUSDT',
  TRX: 'TRXUSDT',
  SHIB: 'SHIBUSDT',
  BCH: 'BCHUSDT',
  ATOM: 'ATOMUSDT',
  NEAR: 'NEARUSDT',
  UNI: 'UNIUSDT',
  APT: 'APTUSDT',
  ARB: 'ARBUSDT',
  OP: 'OPUSDT',
  INJ: 'INJUSDT',
  SUI: 'SUIUSDT',
  SEI: 'SEIUSDT',
  PEPE: 'PEPEUSDT',
};

export function toBinanceSymbol(symbol) {
  if (!symbol) return null;
  const s = symbol.toUpperCase();
  return STATIC_MAP[s] || `${s}USDT`;
}

export function fromBinanceSymbol(bSymbol) {
  return bSymbol?.replace(/USDT$/i, '').toUpperCase();
}

export const BINANCE_INTERVAL = {
  '15M': '15m',
  '1H': '1h',
  '4H': '4h',
  '1D': '1d',
  '1W': '1w',
};
