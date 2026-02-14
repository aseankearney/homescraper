export const SEARCH_CONFIG = {
  minPrice: 2000,
  maxPrice: 2700,
  minBedrooms: 1,
  locations: [
    "Woodland Hills",
    "West Hills",
    "Newbury Park",
    "Calabasas",
    "Sherman Oaks",
    "Thousand Oaks",
    "Oak Park",
    "Simi Valley",
  ],
  allowedPropertyTypes: ["house", "apartment", "condo", "townhouse", "adu"],
} as const;

export const CITY_ALIASES: Record<string, string> = {
  "canoga park": "West Hills",
  winnetka: "West Hills",
  reseda: "Woodland Hills",
  encino: "Woodland Hills",
  "northridge": "Woodland Hills",
  "tarzana": "Tarzana",
};

export const NO_PET_MARKERS = [
  "no pets",
  "no pet",
  "pets not allowed",
  "pet free",
  "no dogs",
  "no cats",
];

export function buildManualLinks() {
  const { minPrice, maxPrice, minBedrooms } = SEARCH_CONFIG;
  
  return [
    {
      source: "Zillow",
      label: "Search Zillow",
      url: `https://www.zillow.com/homes/for_rent/?searchQueryState=%7B%22pagination%22%3A%7B%7D%2C%22mapBounds%22%3A%7B%22west%22%3A-119.0%2C%22east%22%3A-118.4%2C%22south%22%3A34.0%2C%22north%22%3A34.3%7D%2C%22isMapVisible%22%3Atrue%2C%22filterState%22%3A%7B%22price%22%3A%7B%22min%22%3A${minPrice}%2C%22max%22%3A${maxPrice}%7D%2C%22beds%22%3A%7B%22min%22%3A${minBedrooms}%7D%2C%22fore%22%3A%7B%22value%22%3Afalse%7D%2C%22mf%22%3A%7B%22value%22%3Afalse%7D%2C%22manu%22%3A%7B%22value%22%3Afalse%7D%2C%22land%22%3A%7B%22value%22%3Afalse%7D%2C%22ah%22%3A%7B%22value%22%3Atrue%7D%7D%2C%22isListVisible%22%3Atrue%7D`,
    },
    {
      source: "Realtor.com",
      label: "Search Realtor.com",
      url: `https://www.realtor.com/apartments/Woodland-Hills_CA/price-${minPrice}-${maxPrice}/beds-${minBedrooms}`,
    },
    {
      source: "Rent.com",
      label: "Search Rent.com",
      url: `https://www.rent.com/california/woodland-hills-apartments/price-${minPrice}-${maxPrice}`,
    },
    {
      source: "Apartments.com",
      label: "Search Apartments.com",
      url: `https://www.apartments.com/woodland-hills-ca/?bb=8nly8sj01Hmqw7jnB`,
    },
  ];
}
