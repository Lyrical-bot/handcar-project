const AZURE_MAPS_KEY = process.env.AZURE_MAPS_KEY;

function getBestGeocodePosition(data) {
  const firstFeature = data?.features?.[0];

  if (firstFeature?.geometry?.coordinates?.length >= 2) {
    const [lng, lat] = firstFeature.geometry.coordinates;

    return {
      lat,
      lng,
      confidence: firstFeature?.properties?.confidence || null,
      formattedAddress: firstFeature?.properties?.address?.formattedAddress || null,
      raw: firstFeature,
    };
  }

  return null;
}

async function geocodeAddress(address) {
  if (!AZURE_MAPS_KEY) {
    throw new Error('AZURE_MAPS_KEY is not configured.');
  }

  if (!address || !address.trim()) {
    throw new Error('address is required.');
  }

  const url = new URL('https://atlas.microsoft.com/geocode');
  url.searchParams.set('api-version', '2023-06-01');
  url.searchParams.set('subscription-key', AZURE_MAPS_KEY);
  url.searchParams.set('query', address.trim());
  url.searchParams.set('countryRegion', 'KR');
  url.searchParams.set('top', '1');

  const response = await fetch(url.toString());

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Azure Maps geocode failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const position = getBestGeocodePosition(data);

  if (!position) {
    return {
      query: address,
      found: false,
      lat: null,
      lng: null,
      formattedAddress: null,
      confidence: null,
      raw: data,
    };
  }

  return {
    query: address,
    found: true,
    lat: position.lat,
    lng: position.lng,
    formattedAddress: position.formattedAddress,
    confidence: position.confidence,
    raw: data,
  };
}

module.exports = {
  geocodeAddress,
};
