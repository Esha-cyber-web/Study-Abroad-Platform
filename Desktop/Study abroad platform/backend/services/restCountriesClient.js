const axios = require('axios');

const BASE = 'https://restcountries.com/v3.1';

/**
 * @param {string} name Country name (partial ok)
 * @returns {Promise<object|null>}
 */
async function getCountryByName(name) {
  if (!name || String(name).trim().length < 2) return null;

  const q = encodeURIComponent(String(name).trim());
  const { data } = await axios.get(`${BASE}/name/${q}`, {
    params: {
      fields: 'name,cca2,cca3,capital,population,currencies,region,subregion,flags,languages',
    },
    timeout: 15000,
  });

  if (!Array.isArray(data) || data.length === 0) return null;

  const c = data[0];
  const currencyEntry = c.currencies ? Object.values(c.currencies)[0] : null;

  return {
    name: c.name?.common,
    officialName: c.name?.official,
    code: c.cca2,
    code3: c.cca3,
    capital: Array.isArray(c.capital) ? c.capital[0] : c.capital,
    population: c.population,
    region: c.region,
    subregion: c.subregion,
    currency: currencyEntry
      ? { code: Object.keys(c.currencies)[0], name: currencyEntry.name, symbol: currencyEntry.symbol }
      : null,
    languages: c.languages ? Object.values(c.languages) : [],
    flagPng: c.flags?.png,
    flagSvg: c.flags?.svg,
  };
}

module.exports = { getCountryByName };
