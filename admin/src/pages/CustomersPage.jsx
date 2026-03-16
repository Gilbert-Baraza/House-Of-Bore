import { useEffect, useState } from "react";
import { apiClient } from "../api/client";
import PageHeader from "../components/ui/PageHeader";
import StatCard from "../components/ui/StatCard";
import DataTable from "../components/ui/DataTable";
import AccessNotice from "../components/ui/AccessNotice";
import { hasPermission } from "../utils/permissions";

const formatStatusLabel = (value) => {
  if (!value) {
    return "--";
  }

  return value
    .split("_")
    .join(" ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

const emptyDraft = {
  tier: "new",
  isSubscribed: false,
  tagsText: "",
  notes: "",
  phone: ""
};

const CustomersPage = () => {
  const canWrite = hasPermission("customers:write");
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [draft, setDraft] = useState(emptyDraft);

  const loadCustomers = async () => {
    const payload = await apiClient.get("/admin/customers");
    setCustomers(payload.data);

    if (!selectedCustomer && payload.data.length) {
      setSelectedCustomer(payload.data[0]);
    }
  };

  useEffect(() => {
    loadCustomers().catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedCustomer?._id) {
      setCustomerOrders([]);
      return;
    }

    setDraft({
      tier: selectedCustomer.tier || "new",
      isSubscribed: Boolean(selectedCustomer.isSubscribed),
      tagsText: (selectedCustomer.tags || []).join(", "),
      notes: selectedCustomer.notes || "",
      phone: selectedCustomer.phone || ""
    });

    apiClient
      .get(`/admin/customers/${selectedCustomer._id}/orders`)
      .then((payload) => setCustomerOrders(payload.data))
      .catch(console.error);
  }, [selectedCustomer]);

  const handleSave = async () => {
    if (!selectedCustomer?._id) {
      return;
    }

    await apiClient.put(`/admin/customers/${selectedCustomer._id}`, {
      tier: draft.tier,
      isSubscribed: draft.isSubscribed,
      notes: draft.notes,
      phone: draft.phone,
      tags: draft.tagsText.split(",").map((item) => item.trim()).filter(Boolean)
    });

    await loadCustomers();
  };

  const totalCustomers = customers.length;
  const subscribedCount = customers.filter((customer) => customer.isSubscribed).length;
  const vipCount = customers.filter((customer) => customer.tier === "vip").length;
  const revenue = customers.reduce((sum, customer) => sum + (customer.totalSpent || 0), 0);

  return (
    <div className="page-stack">
      <PageHeader
        title="Customers"
        description="Track loyalty, subscriptions, and customer value from one relationship view."
      />

      <div className="stats-grid">
        <StatCard label="Customers" value={totalCustomers} />
        <StatCard label="Subscribed" value={subscribedCount} accent="dark" />
        <StatCard label="VIP" value={vipCount} />
        <StatCard label="Lifetime revenue" value={`$${revenue}`} accent="dark" />
      </div>

      <div className="content-grid">
        <section className="section-block">
          <div className="form-section">
            <div className="form-section__header">
              <h4>Customer Directory</h4>
              <p>Review customer value, loyalty tier, and open each profile for deeper context.</p>
            </div>
            <DataTable
              columns={[
                {
                  key: "customer",
                  label: "Customer",
                  render: (row) => (
                    <div>
                      <strong>{row.name}</strong>
                      <div className="muted-copy">{row.email}</div>
                    </div>
                  )
                },
                { key: "tier", label: "Tier" },
                { key: "orderCount", label: "Orders" },
                { key: "totalSpent", label: "Spent", render: (row) => `$${row.totalSpent || 0}` },
                {
                  key: "actions",
                  label: "Actions",
                  render: (row) => (
                    <button type="button" className="secondary-button" onClick={() => setSelectedCustomer(row)}>
                      View profile
                    </button>
                  )
                }
              ]}
              rows={customers}
              emptyText="No customer records yet."
            />
          </div>
        </section>

        <aside className="panel-card detail-card">
          <div className="panel-card__header">
            <h3>{selectedCustomer?.name || "Customer profile"}</h3>
            {selectedCustomer ? <span>{selectedCustomer.email}</span> : null}
          </div>
          {!canWrite ? (
            <AccessNotice title="Limited access" message="Your role can review customer history, but profile changes are restricted." />
          ) : null}

          {selectedCustomer ? (
            <div className="detail-stack">
              <div className="detail-kpis">
                <div>
                  <span>Total spent</span>
                  <strong>${selectedCustomer.totalSpent || 0}</strong>
                </div>
                <div>
                  <span>Orders</span>
                  <strong>{selectedCustomer.orderCount || 0}</strong>
                </div>
              </div>

              <div className="form-section">
                <div className="form-section__header">
                  <h4>Profile Settings</h4>
                  <p>Manage contact details, loyalty tier, and internal context for this customer.</p>
                </div>
                <div className="detail-section">
                  <div className="form-grid form-grid--single">
                    <label className="field-group">
                      <span>Phone</span>
                      <input
                        disabled={!canWrite}
                        placeholder="Enter customer phone number"
                        value={draft.phone}
                        onChange={(event) => setDraft((previous) => ({ ...previous, phone: event.target.value }))}
                      />
                    </label>
                    <label className="field-group">
                      <span>Loyalty tier</span>
                      <select
                        disabled={!canWrite}
                        value={draft.tier}
                        onChange={(event) => setDraft((previous) => ({ ...previous, tier: event.target.value }))}
                      >
                        <option value="new">New</option>
                        <option value="returning">Returning</option>
                        <option value="vip">VIP</option>
                      </select>
                    </label>
                    <label className="field-group">
                      <span>Tags</span>
                      <input
                        disabled={!canWrite}
                        placeholder="Comma separated tags"
                        value={draft.tagsText}
                        onChange={(event) => setDraft((previous) => ({ ...previous, tagsText: event.target.value }))}
                      />
                    </label>
                    <label className="field-group">
                      <span>Internal notes</span>
                      <textarea
                        disabled={!canWrite}
                        placeholder="Add service or sales context"
                        value={draft.notes}
                        onChange={(event) => setDraft((previous) => ({ ...previous, notes: event.target.value }))}
                      />
                    </label>
                  </div>

                  <div className="checkbox-row">
                    <label>
                      <input
                        disabled={!canWrite}
                        type="checkbox"
                        checked={draft.isSubscribed}
                        onChange={(event) =>
                          setDraft((previous) => ({ ...previous, isSubscribed: event.target.checked }))
                        }
                      />{" "}
                      Receive marketing updates
                    </label>
                  </div>

                  <div className="form-actions">
                    <button disabled={!canWrite} type="button" className="primary-button" onClick={handleSave}>
                      Save profile
                    </button>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <div className="form-section__header">
                  <h4>Recent Orders</h4>
                  <p>See the customer's recent buying history and current order states.</p>
                </div>
                <div className="detail-section">
                  <div className="detail-list">
                    {customerOrders.map((order) => (
                      <div key={order._id} className="detail-list__item">
                        <div>
                          <strong>{order.orderNumber}</strong>
                          <div className="muted-copy">
                            {formatStatusLabel(order.status)} / {formatStatusLabel(order.paymentStatus)}
                          </div>
                        </div>
                        <span>${order.totalAmount}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="muted-copy">Select a customer to open their profile.</p>
          )}
        </aside>
      </div>
    </div>
  );
};

export default CustomersPage;
