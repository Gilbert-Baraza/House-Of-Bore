const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export const createOrder = async (payload) => {
  const token = localStorage.getItem("customer_token");
  const response = await fetch(`${API_BASE_URL}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Failed to place order");
  }

  return data;
};
