const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const getToken = () => localStorage.getItem("customer_token");

const request = async (path, options = {}) => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message || "Cart request failed");
  }

  return payload;
};

export const fetchMyCart = () => request("/customer/cart/me");
export const saveMyCart = (items) =>
  request("/customer/cart/me", {
    method: "PUT",
    body: JSON.stringify({ items })
  });
