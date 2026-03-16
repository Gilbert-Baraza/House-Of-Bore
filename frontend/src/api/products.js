const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const normalizeProduct = (product) => ({
  ...product,
  id: product.id || product._id
});

const buildQueryString = (params) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "" && value !== "All") {
      query.append(key, value);
    }
  });

  const queryString = query.toString();
  return queryString ? `?${queryString}` : "";
};

export const fetchProducts = async (params = {}) => {
  const response = await fetch(`${API_BASE_URL}/products${buildQueryString(params)}`);

  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }

  const payload = await response.json();
  return (payload.data || []).map(normalizeProduct);
};

export const fetchProductById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/products/${id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch product");
  }

  const payload = await response.json();
  return normalizeProduct(payload.data);
};
