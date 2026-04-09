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

export async function updateRequirement(requirementId, data) {
  const payload = await request(`/requirements/${requirementId}`, {
    method: "PATCH",
    body: JSON.stringify(data)
  });

  return payload.data;
}

export async function deleteRequirement(requirementId) {
  await request(`/requirements/${requirementId}`, {
    method: "DELETE"
  });
}

export async function downloadProjectSummaryReport() {
  const response = await fetch(`${API_URL}/reports/summary`);

  if (!response.ok) {
    throw new Error("Could not generate the project report.");
  }

  const reportContent = await response.text();
  const blob = new Blob([reportContent], { type: "text/markdown;charset=utf-8" });
  const downloadUrl = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = downloadUrl;
  anchor.download = "remt-project-summary.md";
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(downloadUrl);
}
