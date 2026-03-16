import { useEffect, useState } from "react";
import { apiClient } from "../api/client";
import PageHeader from "../components/ui/PageHeader";
import DataTable from "../components/ui/DataTable";

const initialForm = {
  name: "",
  description: "",
  isFeatured: false
};

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState("");

  const loadCategories = async () => {
    const payload = await apiClient.get("/admin/categories");
    setCategories(payload.data);
  };

  useEffect(() => {
    loadCategories().catch(console.error);
  }, []);

  const resetForm = () => {
    setForm(initialForm);
    setEditingId("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (editingId) {
      await apiClient.put(`/admin/categories/${editingId}`, form);
    } else {
      await apiClient.post("/admin/categories", form);
    }

    resetForm();
    await loadCategories();
  };

  const handleEdit = (category) => {
    setEditingId(category._id);
    setForm({
      name: category.name,
      description: category.description || "",
      isFeatured: Boolean(category.isFeatured)
    });
  };

  const handleDelete = async (id) => {
    await apiClient.delete(`/admin/categories/${id}`);
    await loadCategories();
  };

  return (
    <div className="page-stack">
      <PageHeader
        title="Categories"
        description="Shape your catalog structure and keep featured collections organized."
      />

      <div className="management-grid">
        <form className="panel-card form-card" onSubmit={handleSubmit}>
          <div className="panel-card__header">
            <h3>{editingId ? "Edit category" : "Create category"}</h3>
          </div>
          <div className="form-grid form-grid--single">
            <input
              placeholder="Category name"
              value={form.name}
              onChange={(event) => setForm((previous) => ({ ...previous, name: event.target.value }))}
            />
            <textarea
              placeholder="Category description"
              value={form.description}
              onChange={(event) => setForm((previous) => ({ ...previous, description: event.target.value }))}
            />
          </div>
          <div className="checkbox-row">
            <label>
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(event) => setForm((previous) => ({ ...previous, isFeatured: event.target.checked }))}
              />{" "}
              Feature on storefront
            </label>
          </div>
          <div className="form-actions">
            <button type="submit" className="primary-button">
              {editingId ? "Update category" : "Create category"}
            </button>
            <button type="button" className="secondary-button" onClick={resetForm}>
              Reset
            </button>
          </div>
        </form>

        <div className="section-block">
          <h3>Category list</h3>
          <DataTable
            columns={[
              { key: "name", label: "Category" },
              { key: "slug", label: "Slug" },
              {
                key: "isFeatured",
                label: "Featured",
                render: (row) => (row.isFeatured ? "Yes" : "No")
              },
              {
                key: "actions",
                label: "Actions",
                render: (row) => (
                  <div className="table-actions">
                    <button type="button" className="secondary-button" onClick={() => handleEdit(row)}>
                      Edit
                    </button>
                    <button type="button" className="danger-button" onClick={() => handleDelete(row._id)}>
                      Delete
                    </button>
                  </div>
                )
              }
            ]}
            rows={categories}
          />
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;
