const axios = require('axios');

/** Free USD-based rates (PKR, INR, EUR, …) — CDN mirror of currency-api, no API key. */
const RATES_URL =
  'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json';

const CACHE_MS = 30 * 60 * 1000;
let cache = { rates: null, fetchedAt: 0 };

/**
 * @returns {Promise<Record<string, number>>} Uppercase currency code → units per 1 USD
 */
async function getUsdRates() {
  if (cache.rates && Date.now() - cache.fetchedAt < CACHE_MS) {
    return cache.rates;
  }

  const { data } = await axios.get(RATES_URL, { timeout: 15000 });
  const bucket = data.usd || data.USD;
  if (!bucket || typeof bucket !== 'object') {
    throw new Error('Unexpected response from currency API');
  }

  const rates = { USD: 1 };
  for (const [code, value] of Object.entries(bucket)) {
    if (typeof value === 'number' && Number.isFinite(value)) {
      rates[String(code).toUpperCase()] = value;
    }
  }

  cache = { rates, fetchedAt: Date.now() };
  return rates;
}

/**
 * @param {number} amountUsd
 * @param {string} toCurrency
 */
async function convertFromUsd(amountUsd, toCurrency) {
  const rates = await getUsdRates();
  const code = String(toCurrency).toUpperCase();
  const rate = rates[code];
  if (rate == null) throw new Error(`Unknown or unsupported currency: ${code}`);
  return {
    amount: Number(amountUsd) * rate,
    rate,
    from: 'USD',
    to: code,
  };
}

module.exports = { getUsdRates, convertFromUsd, RATES_URL };
