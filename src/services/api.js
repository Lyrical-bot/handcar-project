const BLUEHANDS_DATA_URL = '/data/bluehands.json';

export async function fetchBluehandsData() {
  const response = await fetch(BLUEHANDS_DATA_URL);

  if (!response.ok) {
    throw new Error(`Failed to load bluehands data: ${response.status}`);
  }

  const data = await response.json();

  if (!Array.isArray(data)) {
    return [];
  }

  return data;
}
