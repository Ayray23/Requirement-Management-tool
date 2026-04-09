const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

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

export async function getRequirementById(requirementId) {
  const payload = await request(`/requirements/${requirementId}`);
  return payload.data;
}

export async function getAnalyticsData() {
  const payload = await request("/analytics");
  return payload.data;
}

export async function createRequirement(data) {
  const payload = await request("/requirements", {
    method: "POST",
    body: JSON.stringify(data)
  });

  return payload.data;
}

export async function createRequirementComment(requirementId, data) {
  const payload = await request(`/requirements/${requirementId}/comments`, {
    method: "POST",
    body: JSON.stringify(data)
  });

  return payload.data;
}
