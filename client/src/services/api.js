const API_URL = import.meta.env.VITE_API_URL;

const request = async (path, options = {}) => {
  const token = localStorage.getItem("token");
  const headers = { "Content-Type": "application/json", ...options.headers };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "Something went wrong");
  }
  return data;
};

export const getVenues = () => request("/api/venues");
export const getMe = () => request("/api/auth/me");
export const getQueueStatus = (queueId) => request(`/api/queues/${queueId}/status`);
export const joinQueue = (queueId) => request(`/api/queues/${queueId}/join`, { method: "POST" });
export const leaveQueue = (queueId) => request(`/api/queues/${queueId}/leave`, { method: "DELETE" });

export const getAdminQueueDetail = (queueId) => request(`/api/admin/queues/${queueId}`);
export const serveNext = (queueId) => request(`/api/admin/queues/${queueId}/serve`, { method: "PATCH" });
export const skipNext = (queueId) => request(`/api/admin/queues/${queueId}/skip`, { method: "PATCH" });
export const togglePause = (queueId) => request(`/api/admin/queues/${queueId}/pause`, { method: "PATCH" });

export const googleLoginUrl = `${API_URL}/api/auth/google`;
