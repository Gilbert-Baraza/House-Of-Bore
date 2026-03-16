import { useEffect, useMemo, useState } from "react";
import { apiClient } from "../api/client";
import PageHeader from "../components/ui/PageHeader";
import DataTable from "../components/ui/DataTable";
import AccessNotice from "../components/ui/AccessNotice";
import { hasPermission } from "../utils/permissions";

const initialForm = {
  title: "",
  category: "",
  image: "",
  galleryImages: [],
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

const emptyColor = {
  name: "",
  value: "#111111"
};

const ProductsPage = () => {
  const canWrite = hasPermission("products:write");
  const canUpload = hasPermission("media:upload");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [colorDraft, setColorDraft] = useState(emptyColor);

  const loadProducts = async () => {
    const payload = await apiClient.get("/admin/products");
    setProducts(payload.data);
  };

  const loadCategories = async () => {
    const payload = await apiClient.get("/admin/categories");
    const categoryNames = (payload.data || []).map((category) => category.name);
    setCategories(categoryNames);
  };

  useEffect(() => {
    Promise.all([loadProducts(), loadCategories()]).catch(console.error);
  }, []);

  useEffect(() => {
    if (!form.category && categories.length) {
      setForm((previous) => ({ ...previous, category: categories[0] }));
    }
  }, [categories, form.category]);

  const categoryOptions = useMemo(() => {
    const optionSet = new Set(categories);

    if (form.category) {
      optionSet.add(form.category);
    }

    return Array.from(optionSet);
  }, [categories, form.category]);

  const resetForm = () => {
    setForm(initialForm);
    setEditingId("");
    setColorDraft(emptyColor);
  };

  const uploadAsset = async (file) => {
    const formData = new FormData();
    formData.append("image", file);
    const payload = await apiClient.postForm("/admin/uploads/image", formData);
    return payload.data.url;
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
      sizes: form.sizes,
      galleryImages: form.galleryImages
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
      sizes: product.sizes || [],
      galleryImages: product.galleryImages || []
    });
    setColorDraft(emptyColor);
  };

  const handleDelete = async (id) => {
    await apiClient.delete(`/admin/products/${id}`);
    await loadProducts();
  };

  const handlePrimaryUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setUploadingImage(true);

    try {
      const url = await uploadAsset(file);
      setForm((previous) => ({ ...previous, image: url }));
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  };

  const handleGalleryUpload = async (event) => {
    const files = Array.from(event.target.files || []);

    if (!files.length) {
      return;
    }

    setUploadingGallery(true);

    try {
      const uploadedUrls = [];

      for (const file of files) {
        const url = await uploadAsset(file);
        uploadedUrls.push(url);
      }

      setForm((previous) => ({
        ...previous,
        galleryImages: [...(previous.galleryImages || []), ...uploadedUrls]
      }));
    } finally {
      setUploadingGallery(false);
      event.target.value = "";
    }
  };

  const removeGalleryImage = (imageUrl) => {
    setForm((previous) => ({
      ...previous,
      galleryImages: (previous.galleryImages || []).filter((item) => item !== imageUrl)
    }));
  };

  const addColor = () => {
    if (!colorDraft.name.trim()) {
      return;
    }

    setForm((previous) => ({
      ...previous,
      colors: [
        ...(previous.colors || []),
        {
          name: colorDraft.name.trim(),
          value: colorDraft.value || "#111111"
        }
      ]
    }));
    setColorDraft(emptyColor);
  };

  const removeColor = (indexToRemove) => {
    setForm((previous) => ({
      ...previous,
      colors: (previous.colors || []).filter((_, index) => index !== indexToRemove)
    }));
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
          {!canWrite ? (
            <AccessNotice message="Your role can review catalog data, but only managers and super admins can change products." />
          ) : null}
          <div className="form-section">
            <div className="form-section__header">
              <h4>Basic Info</h4>
              <p>Name, category, and the core story of the product.</p>
            </div>
            <div className="form-grid">
              <label className="field-group">
                <span>Product title</span>
                <input disabled={!canWrite} placeholder="Enter product title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
              </label>
              <label className="field-group">
                <span>Category</span>
                {categoryOptions.length ? (
                  <select disabled={!canWrite} value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}>
                    {categoryOptions.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    disabled={!canWrite}
                    placeholder="Create a category first, or type one here"
                    value={form.category}
                    onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                  />
                )}
              </label>
              <label className="field-group field-group--full">
                <span>Description</span>
                <textarea disabled={!canWrite} placeholder="Write the product description" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
              </label>
            </div>
          </div>

          <div className="form-section">
            <div className="form-section__header">
              <h4>Pricing & Inventory</h4>
              <p>Set the customer-facing price, rating, and available stock.</p>
            </div>
            <div className="form-grid">
              <label className="field-group">
                <span>Product rating</span>
                <input disabled={!canWrite} placeholder="4.5" type="number" step="0.1" value={form.rating} onChange={(e) => setForm((p) => ({ ...p, rating: e.target.value }))} />
              </label>
              <label className="field-group">
                <span>Current price</span>
                <input disabled={!canWrite} placeholder="0" type="number" value={form.discountedPrice} onChange={(e) => setForm((p) => ({ ...p, discountedPrice: e.target.value }))} />
              </label>
              <label className="field-group">
                <span>Old price</span>
                <input disabled={!canWrite} placeholder="0" type="number" value={form.oldPrice} onChange={(e) => setForm((p) => ({ ...p, oldPrice: e.target.value }))} />
              </label>
              <label className="field-group">
                <span>Available stock</span>
                <input disabled={!canWrite} placeholder="0" type="number" value={form.stock} onChange={(e) => setForm((p) => ({ ...p, stock: e.target.value }))} />
              </label>
            </div>
          </div>

          <div className="form-section">
            <div className="form-section__header">
              <h4>Attributes</h4>
              <p>Capture the fit, care, sizes, and color options clearly.</p>
            </div>
            <div className="form-grid">
              <label className="field-group">
                <span>Material</span>
                <input disabled={!canWrite} placeholder="Enter material details" value={form.material} onChange={(e) => setForm((p) => ({ ...p, material: e.target.value }))} />
              </label>
              <label className="field-group">
                <span>Care instructions</span>
                <input disabled={!canWrite} placeholder="How to care for this product" value={form.care} onChange={(e) => setForm((p) => ({ ...p, care: e.target.value }))} />
              </label>
              <label className="field-group">
                <span>Fit</span>
                <input disabled={!canWrite} placeholder="Regular fit, slim fit, true to size" value={form.fit} onChange={(e) => setForm((p) => ({ ...p, fit: e.target.value }))} />
              </label>
              <label className="field-group">
                <span>Pattern</span>
                <input disabled={!canWrite} placeholder="Solid, textured, printed" value={form.pattern} onChange={(e) => setForm((p) => ({ ...p, pattern: e.target.value }))} />
              </label>
              <label className="field-group field-group--full">
                <span>Sizes</span>
                <input
                  disabled={!canWrite}
                  placeholder="Comma separated, e.g. S, M, L"
                  value={(form.sizes || []).join(", ")}
                  onChange={(e) => setForm((p) => ({ ...p, sizes: e.target.value.split(",").map((item) => item.trim()).filter(Boolean) }))}
                />
              </label>
            </div>

            <div className="detail-section">
              <h4>Colors</h4>
              <div className="color-editor">
                <label className="field-group">
                  <span>Color name</span>
                  <input
                    disabled={!canWrite}
                    placeholder="Black"
                    value={colorDraft.name}
                    onChange={(e) => setColorDraft((previous) => ({ ...previous, name: e.target.value }))}
                  />
                </label>
                <label className="field-group">
                  <span>Hex value</span>
                  <input
                    disabled={!canWrite}
                    type="color"
                    value={colorDraft.value}
                    onChange={(e) => setColorDraft((previous) => ({ ...previous, value: e.target.value }))}
                  />
                </label>
                <button disabled={!canWrite} type="button" className="secondary-button" onClick={addColor}>
                  Add color
                </button>
              </div>
              <div className="color-chip-list">
                {(form.colors || []).length === 0 ? (
                  <p className="muted-copy">No colors added yet.</p>
                ) : (
                  form.colors.map((color, index) => (
                    <div key={`${color.name}-${index}`} className="color-chip-card">
                      <div className="color-chip-label">
                        <span className="color-chip-swatch" style={{ backgroundColor: color.value }} />
                        <div>
                          <strong>{color.name}</strong>
                          <div className="muted-copy">{color.value}</div>
                        </div>
                      </div>
                      <button disabled={!canWrite} type="button" className="danger-button" onClick={() => removeColor(index)}>
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="form-section__header">
              <h4>Media</h4>
              <p>Manage the primary product image and supporting gallery shots.</p>
            </div>
            <div className="form-grid">
              <label className="field-group">
                <span>Primary image URL</span>
                <input disabled={!canWrite} placeholder="Paste image URL" value={form.image} onChange={(e) => setForm((p) => ({ ...p, image: e.target.value }))} />
              </label>
              <label className="upload-field">
                <span>Primary image upload</span>
                <input disabled={!canWrite || !canUpload} type="file" accept="image/*" onChange={handlePrimaryUpload} />
                <small>{!canUpload ? "Your role cannot upload media" : uploadingImage ? "Uploading image..." : "Upload a product cover image"}</small>
              </label>
            </div>
          </div>

          <div className="detail-section">
            <h4>Media gallery</h4>
            <label className="upload-field">
              <span>Gallery uploads</span>
              <input disabled={!canWrite || !canUpload} type="file" accept="image/*" multiple onChange={handleGalleryUpload} />
              <small>{!canUpload ? "Your role cannot upload media" : uploadingGallery ? "Uploading gallery images..." : "Upload detail shots and alternates"}</small>
            </label>
            <div className="image-grid">
              {form.image ? (
                <div className="image-card image-card--hero">
                  <img src={form.image} alt={form.title || "Primary product"} />
                  <span>Primary</span>
                </div>
              ) : null}
              {(form.galleryImages || []).map((imageUrl) => (
                <div key={imageUrl} className="image-card">
                  <img src={imageUrl} alt="Gallery product" />
                  <button disabled={!canWrite} type="button" className="danger-button" onClick={() => removeGalleryImage(imageUrl)}>
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="toggle-row">
            <label><input disabled={!canWrite} type="checkbox" checked={form.isNewArrival} onChange={(e) => setForm((p) => ({ ...p, isNewArrival: e.target.checked }))} /> New arrival</label>
            <label><input disabled={!canWrite} type="checkbox" checked={form.isTopSelling} onChange={(e) => setForm((p) => ({ ...p, isTopSelling: e.target.checked }))} /> Top selling</label>
          </div>
          <div className="form-actions">
            <button disabled={!canWrite} type="submit" className="primary-button">{editingId ? "Update product" : "Create product"}</button>
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
              { key: "gallery", label: "Media", render: (row) => 1 + (row.galleryImages?.length || 0) },
              { key: "discountedPrice", label: "Price", render: (row) => `$${row.discountedPrice}` },
              {
                key: "actions",
                label: "Actions",
                render: (row) => (
                  <div className="table-actions">
                    <button type="button" className="secondary-button" onClick={() => handleEdit(row)}>Edit</button>
                    <button disabled={!canWrite} type="button" className="danger-button" onClick={() => handleDelete(row._id)}>Delete</button>
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
