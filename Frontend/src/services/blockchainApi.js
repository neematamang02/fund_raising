function getToken() {
  return localStorage.getItem("token");
}

async function request(path, { method = "GET", body } = {}) {
  const token = getToken();
  if (!token) {
    throw new Error("Authentication token not found.");
  }

  const response = await fetch(path, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message || `Request failed (${response.status})`);
  }

  return payload;
}

export function getBlockchain(campaignId) {
  const query = campaignId ? `?campaignId=${encodeURIComponent(campaignId)}` : "";
  return request(`/api/blockchain${query}`);
}

export function verifyBlockchain(campaignId) {
  return request("/api/blockchain/verify", {
    method: "POST",
    body: { campaignId: campaignId || null },
  });
}

export function simulateBlockchainTampering(campaignId, blockIndex) {
  return request("/api/blockchain/simulate-tampering", {
    method: "POST",
    body: {
      campaignId: campaignId || null,
      blockIndex: typeof blockIndex === "number" ? blockIndex : undefined,
    },
  });
}
