const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export const fetchCategories = async () => {
  const response = await fetch(`${API_BASE_URL}/categories`);

  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }

  const payload = await response.json();
  return payload.data || [];
};
