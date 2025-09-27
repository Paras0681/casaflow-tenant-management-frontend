let apiUrlCache = null;

export async function getApiUrl() {
  if (!apiUrlCache) {
    const response = await fetch("/config.json"); // Backend endpoint serving FRONTEND_API_URL
    if (!response.ok) throw new Error("Could not load API URL");
    const data = await response.json();
    apiUrlCache = data.API_URL;
  }
  return apiUrlCache;
}
