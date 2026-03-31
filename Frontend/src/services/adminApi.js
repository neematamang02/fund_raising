const API_BASE_URL = import.meta.env.VITE_BACKEND_URL
  ? `${import.meta.env.VITE_BACKEND_URL}/api`
  : "/api";

const JSON_HEADERS = {
  "Content-Type": "application/json",
};

function getToken(tokenOverride) {
  if (tokenOverride) return tokenOverride;
  return localStorage.getItem("token") || "";
}

function buildUrl(path, queryParams = {}) {
  const url = new URL(`${API_BASE_URL}${path}`, window.location.origin);

  Object.entries(queryParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  return `${url.pathname}${url.search}`;
}

async function request(
  path,
  { method = "GET", body, queryParams, token, signal } = {},
) {
  const response = await fetch(buildUrl(path, queryParams), {
    method,
    headers: {
      ...(body ? JSON_HEADERS : {}),
      Authorization: `Bearer ${getToken(token)}`,
    },
    body: body ? JSON.stringify(body) : undefined,
    signal,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(payload.message || "Request failed");
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

export const adminQueryKeys = {
  dashboardStats: ["admin", "dashboard", "stats"],
  applications: ["admin", "applications"],
  activities: ({ page = 1, activityType = "", userId = "" } = {}) => [
    "admin",
    "activities",
    page,
    activityType,
    userId,
  ],
  campaigns: ({ page = 1, search = "" } = {}) => [
    "admin",
    "campaigns",
    page,
    search,
  ],
  campaignDetails: (campaignId) => [
    "admin",
    "campaigns",
    "details",
    campaignId,
  ],
  users: ({ page = 1, role = "all", search = "" } = {}) => [
    "admin",
    "users",
    page,
    role,
    search,
  ],
  userDetails: (userId) => ["admin", "users", "details", userId],
  userDonations: (userId) => ["admin", "users", "donations", userId],
  donations: ({ page = 1, status = "all" } = {}) => [
    "admin",
    "donations",
    page,
    status,
  ],
  withdrawals: (status) => ["admin", "withdrawals", status || "all"],
  withdrawalDetails: (withdrawalId) => [
    "admin",
    "withdrawals",
    "details",
    withdrawalId,
  ],
  organizerProfiles: ({ page = 1, status = "all", search = "" } = {}) => [
    "admin",
    "organizerProfiles",
    page,
    status,
    search,
  ],
};

export function getAdminDashboardStats(options = {}) {
  return request("/admin/dashboard/stats", options);
}

export function getAdminApplications(options = {}) {
  return request("/admin/applications", options);
}
export function approveOrganizerApplication(applicationId, options = {}) {
  return request(`/admin/applications/${applicationId}/approve`, {
    ...options,
    method: "PATCH",
  });
}
export function rejectOrganizerApplication(
  applicationId,
  rejectionReason,
  options = {},
) {
  return request(`/admin/applications/${applicationId}/reject`, {
    ...options,
    method: "PATCH",
    body: { rejectionReason },
  });
}
export function revokeOrganizerApplication(
  applicationId,
  reason = "",
  options = {},
) {
  return request(`/admin/applications/${applicationId}/revoke`, {
    ...options,
    method: "PATCH",
    body: { reason },
  });
}

export function getAdminActivities({
  page = 1,
  activityType = "",
  userId = "",
  ...options
} = {}) {
  return request("/admin/activities", {
    ...options,
    queryParams: {
      page,
      activityType,
      userId,
    },
  });
}

export function getAdminCampaigns({ page = 1, search = "", ...options } = {}) {
  return request("/admin/campaigns", {
    ...options,
    queryParams: {
      page,
      search,
    },
  });
}

export function getAdminCampaignDetails(campaignId, options = {}) {
  return request(`/admin/campaigns/${campaignId}`, options);
}

export function deleteAdminCampaign(campaignId, options = {}) {
  return request(`/admin/campaigns/${campaignId}`, {
    ...options,
    method: "DELETE",
  });
}

export function getAdminUsers({
  page = 1,
  role = "all",
  search = "",
  ...options
} = {}) {
  return request("/admin/users", {
    ...options,
    queryParams: {
      page,
      role: role === "all" ? undefined : role,
      search,
    },
  });
}

export function getAdminUserDetails(userId, options = {}) {
  return request(`/admin/users/${userId}`, options);
}

export function updateAdminUserStatus(userId, payload, options = {}) {
  return request(`/admin/users/${userId}/status`, {
    ...options,
    method: "PATCH",
    body: payload,
  });
}

export function getAdminUserDonations(userId, options = {}) {
  return request(`/admin/users/${userId}/donations`, options);
}

export function getAdminDonations({
  page = 1,
  status = "all",
  ...options
} = {}) {
  return request("/admin/donations", {
    ...options,
    queryParams: {
      page,
      status: status === "all" ? undefined : status,
    },
  });
}

export function getAdminWithdrawals({ status, ...options } = {}) {
  return request("/withdrawal-requests", {
    ...options,
    queryParams: { status },
  });
}

export function getAdminWithdrawalDetails(withdrawalId, options = {}) {
  return request(`/withdrawal-requests/${withdrawalId}`, options);
}

export function updateAdminWithdrawalStatus(
  withdrawalId,
  payload,
  options = {},
) {
  return request(`/withdrawal-requests/${withdrawalId}/status`, {
    ...options,
    method: "PATCH",
    body: payload,
  });
}

export function getAdminOrganizerProfiles({
  page = 1,
  status = "all",
  search = "",
  ...options
} = {}) {
  return request("/admin/organizer-profiles", {
    ...options,
    queryParams: {
      page,
      status: status === "all" ? undefined : status,
      search,
    },
  });
}

export function verifyAdminOrganizerProfile(
  organizerProfileId,
  payload,
  options = {},
) {
  return request(`/admin/organizer-profiles/${organizerProfileId}/verify`, {
    ...options,
    method: "PATCH",
    body: payload,
  });
}
