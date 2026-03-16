import { useEffect, useState } from "react";
import { apiClient } from "../api/client";
import PageHeader from "../components/ui/PageHeader";
import DataTable from "../components/ui/DataTable";

const initialForm = {
  title: "",
  category: "Shoes",
  image: "",
  rating: 4,
  discountedPrice: 0,
  oldPrice: 0,
  description: "",
  material: "",
  care: "",
  fit: "",
  pattern: "",
  colors: [],
  sizes: [],
  isNewArrival: false,
  isTopSelling: false,
  stock: 0
};

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState("");

  const loadProducts = async () => {
    const payload = await apiClient.get("/admin/products");
    setProducts(payload.data);
  };

  useEffect(() => {
    loadProducts().catch(console.error);
  }, []);

  const resetForm = () => {
    setForm(initialForm);
    setEditingId("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      ...form,
      rating: Number(form.rating),
      discountedPrice: Number(form.discountedPrice),
      oldPrice: Number(form.oldPrice),
      stock: Number(form.stock),
      colors: form.colors,
      sizes: form.sizes
    };

    if (editingId) {
      await apiClient.put(`/admin/products/${editingId}`, payload);
    } else {
      await apiClient.post("/admin/products", payload);
    }

    resetForm();
    await loadProducts();
  };

  const handleEdit = (product) => {
    setEditingId(product._id);
    setForm({
      ...product,
      colors: product.colors || [],
      sizes: product.sizes || []
    });
  };

  const handleDelete = async (id) => {
    await apiClient.delete(`/admin/products/${id}`);
    await loadProducts();
  };

  return (
    <div className="page-stack">
      <PageHeader
        title="Products"
        description="Create, edit, and maintain the full product catalog."
      />

      <div className="management-grid">
        <form className="panel-card form-card" onSubmit={handleSubmit}>
          <div className="panel-card__header">
            <h3>{editingId ? "Edit product" : "Add product"}</h3>
          </div>
          <div className="form-grid">
            <input placeholder="Title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
            <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}>
              <option>Shoes</option>
              <option>Men</option>
              <option>Women</option>
              <option>Jeweleries</option>
            </select>
            <input placeholder="Image URL" value={form.image} onChange={(e) => setForm((p) => ({ ...p, image: e.target.value }))} />
            <input placeholder="Rating" type="number" step="0.1" value={form.rating} onChange={(e) => setForm((p) => ({ ...p, rating: e.target.value }))} />
            <input placeholder="Discounted price" type="number" value={form.discountedPrice} onChange={(e) => setForm((p) => ({ ...p, discountedPrice: e.target.value }))} />
            <input placeholder="Old price" type="number" value={form.oldPrice} onChange={(e) => setForm((p) => ({ ...p, oldPrice: e.target.value }))} />
            <input placeholder="Material" value={form.material} onChange={(e) => setForm((p) => ({ ...p, material: e.target.value }))} />
            <input placeholder="Care" value={form.care} onChange={(e) => setForm((p) => ({ ...p, care: e.target.value }))} />
            <input placeholder="Fit" value={form.fit} onChange={(e) => setForm((p) => ({ ...p, fit: e.target.value }))} />
            <input placeholder="Pattern" value={form.pattern} onChange={(e) => setForm((p) => ({ ...p, pattern: e.target.value }))} />
            <input placeholder="Stock" type="number" value={form.stock} onChange={(e) => setForm((p) => ({ ...p, stock: e.target.value }))} />
            <input
              placeholder="Sizes comma separated"
              value={(form.sizes || []).join(", ")}
              onChange={(e) => setForm((p) => ({ ...p, sizes: e.target.value.split(",").map((item) => item.trim()).filter(Boolean) }))}
            />
            <textarea placeholder="Description" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
            <textarea
              placeholder='Colors JSON e.g. [{"name":"Black","value":"#111111"}]'
              value={JSON.stringify(form.colors)}
              onChange={(e) => {
                try {
                  setForm((p) => ({ ...p, colors: JSON.parse(e.target.value || "[]") }));
                } catch {
                  return null;
                }
              }}
            />
          </div>
          <div className="toggle-row">
            <label><input type="checkbox" checked={form.isNewArrival} onChange={(e) => setForm((p) => ({ ...p, isNewArrival: e.target.checked }))} /> New arrival</label>
            <label><input type="checkbox" checked={form.isTopSelling} onChange={(e) => setForm((p) => ({ ...p, isTopSelling: e.target.checked }))} /> Top selling</label>
          </div>
          <div className="form-actions">
            <button type="submit" className="primary-button">{editingId ? "Update product" : "Create product"}</button>
            <button type="button" className="secondary-button" onClick={resetForm}>Reset</button>
          </div>
        </form>

        <div className="section-block">
          <h3>Catalog list</h3>
          <DataTable
            columns={[
              { key: "title", label: "Product" },
              { key: "category", label: "Category" },
              { key: "stock", label: "Stock" },
              { key: "discountedPrice", label: "Price", render: (row) => `$${row.discountedPrice}` },
              {
                key: "actions",
                label: "Actions",
                render: (row) => (
                  <div className="table-actions">
                    <button type="button" className="secondary-button" onClick={() => handleEdit(row)}>Edit</button>
                    <button type="button" className="danger-button" onClick={() => handleDelete(row._id)}>Delete</button>
                  </div>
                )
              }
            ]}
            rows={products}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
