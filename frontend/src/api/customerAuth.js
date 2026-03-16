const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const getToken = () => localStorage.getItem("customer_token");

const request = async (path, options = {}) => {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  const token = getToken();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message || "Request failed");
  }

  return payload;
};

export const signupCustomer = (body) =>
  request("/customer/auth/signup", { method: "POST", body: JSON.stringify(body) });

export const loginCustomer = (body) =>
  request("/customer/auth/login", { method: "POST", body: JSON.stringify(body) });

export const fetchCustomerProfile = () => request("/customer/auth/me");

export const updateCustomerProfile = (body) =>
  request("/customer/auth/me", { method: "PUT", body: JSON.stringify(body) });

export const fetchMyOrders = () => request("/customer/orders/me");
export const fetchMyOrderById = (id) => request(`/customer/orders/me/${id}`);
export const trackOrder = ({ orderNumber, email }) =>
  request(`/orders/track?orderNumber=${encodeURIComponent(orderNumber)}&email=${encodeURIComponent(email)}`);
