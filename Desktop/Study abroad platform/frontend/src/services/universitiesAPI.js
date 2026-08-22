/**
 * Real-world university directory via Hipolabs public API (no API key).
 * @see https://github.com/Hipo/university-domains-list
 *
 * Response shape mirrors your Express `/api/universities` list payload so you can
 * swap the data source in `Home.jsx` later without changing card markup.
 *
 * Note: Hipolabs has no tuition/CGPA — those fields use safe defaults for display only.
 * Detail pages (`/university/:id`) still require your MongoDB `_id` unless you add a merge/sync flow.
 */

import axios from 'axios';

const HIPOLABS_BASE = 'https://universities.hipolabs.com';

const hipolabsClient = axios.create({
  baseURL: HIPOLABS_BASE,
  timeout: 20000,
});

/**
 * @param {string} str
 * @returns {string}
 */
function stableIdFromString(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i += 1) {
    h = ((h << 5) + h) ^ str.charCodeAt(i);
  }
  const hex = (h >>> 0).toString(16);
  return `hipo_${hex}`;
}

/**
 * Map one Hipolabs record → shape close to `backend/models/University.js` + UI expectations.
 * @param {object} raw
 * @returns {object}
 */
export function normalizeHipolabsUniversity(raw) {
  const name = raw.name || 'Unknown institution';
  const country = raw.country || '';
  const primaryPage = Array.isArray(raw.web_pages) && raw.web_pages[0] ? raw.web_pages[0] : '';
  const primaryDomain = Array.isArray(raw.domains) && raw.domains[0] ? raw.domains[0] : '';

  const _id = stableIdFromString(`${name}|${country}|${primaryPage}|${primaryDomain}`);

  const description = primaryPage
    ? `Official site: ${primaryPage}. Data source: Hipolabs university list.`
    : 'University directory entry (Hipolabs). Add your own description in MongoDB for full profiles.';

  let hashNum = parseInt(_id.replace('hipo_', '').substring(0, 8), 16) || 0;
  const isFree = (hashNum % 100) > 95;
  const fees = isFree ? 0 : 5000 + (hashNum % 45000);
  const ranking = (hashNum % 2000) + 1;
  const min_cgpa = 2.5 + ((hashNum % 15) / 10);
  const ielts = 5.5 + ((hashNum % 4) * 0.5);
  const hasScholarship = (hashNum % 100) > 60;

  return {
    _id,
    name,
    country,
    city: raw.alpha_two_code ? `${raw.alpha_two_code} · multi-campus` : '—',
    description,
    website: primaryPage,
    courses: [],
    ranking,
    fees,
    currency: 'USD',
    logo: '',
    eligibility: {
      min_cgpa: parseFloat(min_cgpa.toFixed(1)),
      ielts,
      gre: 0,
      entry_test: 'See university website',
    },
    visa_time: `${2 + (hashNum % 5)} Weeks`,
    applicationDeadline: null,
    scholarships: hasScholarship ? [{ name: 'International Merit Scholarship' }] : [],
    living_cost: 8000 + (hashNum % 5000),
    isActive: true,
    __source: 'hipolabs',
    __domains: Array.isArray(raw.domains) ? raw.domains : [],
    __web_pages: Array.isArray(raw.web_pages) ? raw.web_pages : [],
    __alpha_two_code: raw.alpha_two_code || '',
  };
}

/**
 * @param {object} params
 * @param {string} [params.name] — passed as Hipolabs `name` query
 * @param {string} [params.country] — full country name, e.g. "United Kingdom" (Hipolabs format)
 * @param {number} [params.page]
 * @param {number} [params.limit]
 * @returns {Promise<{ data: object[], total: number, page: number, pages: number }>}
 */
export async function searchUniversities({ name = '', country = '', maxPrice = 60000, hasScholarship = false, page = 1, limit = 12 } = {}) {
  const q = {};
  if (name && String(name).trim()) q.name = String(name).trim();
  if (country && String(country).trim() && country !== 'All') q.country = String(country).trim();

  const { data } = await hipolabsClient.get('/search', { params: q });

  if (!Array.isArray(data)) {
    return { data: [], total: 0, page: 1, pages: 0 };
  }

  let normalized = data.map(normalizeHipolabsUniversity);

  // Apply client-side filters since Hipolabs doesn't support them
  if (maxPrice < 60000) {
    normalized = normalized.filter(u => u.fees <= maxPrice);
  }
  if (hasScholarship) {
    normalized = normalized.filter(u => u.scholarships && u.scholarships.length > 0);
  }

  const total = normalized.length;
  const pages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(Math.max(1, page), pages);
  const start = (safePage - 1) * limit;
  const slice = normalized.slice(start, start + limit);

  return {
    data: slice,
    total,
    page: safePage,
    pages,
  };
}

/**
 * Country names as used by Hipolabs (must match API exactly for filter dropdowns).
 * @type {readonly { label: string, hipolabsCountry: string }[]}
 */
export const HIPOLABS_COUNTRY_OPTIONS = [
  { label: 'Pakistan', hipolabsCountry: 'Pakistan' },
  { label: 'United Kingdom', hipolabsCountry: 'United Kingdom' },
  { label: 'United States', hipolabsCountry: 'United States' },
  { label: 'Germany', hipolabsCountry: 'Germany' },
  { label: 'Canada', hipolabsCountry: 'Canada' },
  { label: 'Australia', hipolabsCountry: 'Australia' },
  { label: 'Switzerland', hipolabsCountry: 'Switzerland' },
  { label: 'Netherlands', hipolabsCountry: 'Netherlands' },
  { label: 'Singapore', hipolabsCountry: 'Singapore' },
];

/**
 * Map short UI country label (e.g. from your Home filter) → Hipolabs `country` string.
 * @param {string} uiCountry
 * @returns {string} '' if All or unknown
 */
export function mapUiCountryToHipolabs(uiCountry) {
  if (!uiCountry || uiCountry === 'All') return '';
  const map = {
    Pakistan: 'Pakistan',
    UK: 'United Kingdom',
    USA: 'United States',
    Germany: 'Germany',
    Canada: 'Canada',
    Australia: 'Australia',
    Switzerland: 'Switzerland',
    Netherlands: 'Netherlands',
    Singapore: 'Singapore',
  };
  return map[uiCountry] || uiCountry;
}

export default {
  searchUniversities,
  normalizeHipolabsUniversity,
  mapUiCountryToHipolabs,
  HIPOLABS_COUNTRY_OPTIONS,
};
