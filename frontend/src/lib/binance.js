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
  SUI: 'SUIUSDT',
  SEI: 'SEIUSDT',
  PEPE: 'PEPEUSDT',
};

export function toBinanceSymbol(symbol) {
  if (!symbol) return null;
  let value = symbol.toUpperCase();
  if (value.includes('-')) value = value.split('-').at(-1);
  if (value.includes('/')) value = value.split('/')[0];
  return STATIC_MAP[value] || `${value}USDT`;
}

export function fromBinanceSymbol(binanceSymbol) {
  return binanceSymbol?.replace(/USDT$/i, '').toUpperCase();
}

export const BINANCE_INTERVAL = {
  '15M': '15m',
  '1H': '1h',
  '4H': '4h',
  '1D': '1d',
  '1W': '1w',
};
