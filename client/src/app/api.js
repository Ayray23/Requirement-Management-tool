const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(path) {
  const response = await fetch(`${API_URL}${path}`);

  if (!response.ok) {
    throw new Error(`Request failed for ${path}`);
  }

  return response.json();
}

export async function getDashboardData() {
  const payload = await request("/dashboard");
  return payload.data;
}

export async function getRequirementsData() {
  const payload = await request("/requirements");
  return payload.data;
}

export async function getAnalyticsData() {
  const payload = await request("/analytics");
  return payload.data;
}
