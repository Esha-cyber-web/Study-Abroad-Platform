import axios from 'axios';

const REST_COUNTRIES_URL = 'https://restcountries.com/v3.1';

// We map common short names to official names for better API matching if needed
const countryNameMap = {
  'UK': 'United Kingdom',
  'USA': 'United States',
};

export const fetchCountriesData = async (countryNames) => {
  try {
    const promises = countryNames.map(async (name) => {
      const searchName = countryNameMap[name] || name;
      try {
        const res = await axios.get(`${REST_COUNTRIES_URL}/name/${searchName}`);
        // Return the best match
        const countryData = res.data[0];
        return {
          name,
          flag: countryData.flag || '🌍',
          region: countryData.region,
          population: countryData.population,
          currencies: countryData.currencies,
          capital: countryData.capital ? countryData.capital[0] : 'N/A'
        };
      } catch (err) {
        console.warn(`Could not fetch data for ${name}`);
        return { name, flag: '🌍' };
      }
    });

    const results = await Promise.all(promises);
    return results.reduce((acc, curr) => {
      acc[curr.name] = curr;
      return acc;
    }, {});
  } catch (error) {
    console.error('Error fetching countries:', error);
    return {};
  }
};

export const fetchAllCountries = async () => {
  try {
    const res = await axios.get(`${REST_COUNTRIES_URL}/all?fields=name,flag,cca2`);
    return res.data.map(c => ({
      name: c.name.common,
      flag: c.flag,
      code: c.cca2
    })).sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Error fetching all countries:', error);
    return [];
  }
};
