import { useEffect, useState } from "react";
import { apiClient } from "../api/client";
import PageHeader from "../components/ui/PageHeader";
import DataTable from "../components/ui/DataTable";
import AccessNotice from "../components/ui/AccessNotice";
import { hasPermission } from "../utils/permissions";

const initialForm = {
  name: "",
  description: "",
  isFeatured: false
};

const requiredIndicator = <span className="field-label-required">*</span>;
const focusField = (fieldName) => {
  if (!fieldName || typeof document === "undefined") {
    return;
  }

  const element = document.querySelector(`[data-field="${fieldName}"]`);

  if (!element) {
    return;
  }

  element.scrollIntoView({ behavior: "smooth", block: "center" });
  element.focus?.();
};

const CategoriesPage = () => {
  const canWrite = hasPermission("categories:write");
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState("");
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [fieldErrors, setFieldErrors] = useState({});

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
    setFieldErrors({});
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFeedback({ type: "", message: "" });
    const nextErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = "Category name is required.";
    }

    if (Object.keys(nextErrors).length) {
      setFieldErrors(nextErrors);
      setFeedback({ type: "error", message: "Please fill in all required fields." });
      focusField(Object.keys(nextErrors)[0]);
      return;
    }

    setFieldErrors({});

    try {
      if (editingId) {
        await apiClient.put(`/admin/categories/${editingId}`, form);
      } else {
        await apiClient.post("/admin/categories", form);
      }

      setFeedback({
        type: "success",
        message: editingId ? "Category updated successfully." : "Category created successfully."
      });
      resetForm();
      await loadCategories();
    } catch (error) {
      setFeedback({ type: "error", message: error.message || "Unable to save category." });
    }
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
    setFeedback({ type: "", message: "" });

    try {
      await apiClient.delete(`/admin/categories/${id}`);
      setFeedback({ type: "success", message: "Category deleted successfully." });
      await loadCategories();
    } catch (error) {
      setFeedback({ type: "error", message: error.message || "Unable to delete category." });
    }
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
          {!canWrite ? (
            <AccessNotice message="Your role can view categories, but only managers and super admins can change them." />
          ) : null}
          {feedback.message ? <div className={`feedback-banner feedback-banner--${feedback.type}`}>{feedback.message}</div> : null}
          <div className="form-grid form-grid--single">
            <label className="field-group">
              <span>Category name{requiredIndicator}</span>
              <input
                data-field="name"
                className={fieldErrors.name ? "field-input-invalid" : ""}
                disabled={!canWrite}
                placeholder="Category name"
                value={form.name}
                onChange={(event) => {
                  setForm((previous) => ({ ...previous, name: event.target.value }));
                  setFieldErrors((previous) => ({ ...previous, name: "" }));
                }}
              />
              {fieldErrors.name ? <div className="field-error">{fieldErrors.name}</div> : null}
            </label>
            <label className="field-group">
              <span>Category description</span>
              <textarea
                disabled={!canWrite}
                placeholder="Category description"
                value={form.description}
                onChange={(event) => setForm((previous) => ({ ...previous, description: event.target.value }))}
              />
            </label>
          </div>
          <div className="checkbox-row">
            <label>
              <input
                disabled={!canWrite}
                type="checkbox"
                checked={form.isFeatured}
                onChange={(event) => setForm((previous) => ({ ...previous, isFeatured: event.target.checked }))}
              />{" "}
              Feature on storefront
            </label>
          </div>
          <div className="form-actions">
            <button disabled={!canWrite} type="submit" className="primary-button">
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
                    <button disabled={!canWrite} type="button" className="secondary-button" onClick={() => handleEdit(row)}>
                      Edit
                    </button>
                    <button disabled={!canWrite} type="button" className="danger-button" onClick={() => handleDelete(row._id)}>
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
