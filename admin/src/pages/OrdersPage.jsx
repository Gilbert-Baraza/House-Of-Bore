import { useEffect, useState } from "react";
import { apiClient } from "../api/client";
import PageHeader from "../components/ui/PageHeader";
import DataTable from "../components/ui/DataTable";
import StatCard from "../components/ui/StatCard";
import AccessNotice from "../components/ui/AccessNotice";
import { hasPermission } from "../utils/permissions";

const orderStatuses = ["pending", "paid", "processing", "packed", "shipped", "delivered", "cancelled"];
const paymentStatuses = ["pending", "paid", "failed", "refunded"];
const deliveryMethods = ["standard", "express", "pickup"];

const OrdersPage = () => {
  const canWrite = hasPermission("orders:write");
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState({
    deliveryMethod: "standard",
    trackingNumber: "",
    fulfillmentNotes: "",
    internalNote: ""
  });

  const loadOrders = async () => {
    const payload = await apiClient.get("/admin/orders");
    setOrders(payload.data);

    if (!selectedOrder && payload.data.length) {
      setSelectedOrder(payload.data[0]);
    }
  };

  useEffect(() => {
    loadOrders().catch(console.error);
  }, []);

  const handleStatusChange = async (order, nextValues) => {
    await apiClient.patch(`/admin/orders/${order._id}/status`, {
      status: nextValues.status ?? order.status,
      paymentStatus: nextValues.paymentStatus ?? order.paymentStatus
    });

    await loadOrders();
  };

  useEffect(() => {
    if (!selectedOrder?._id) {
      return;
    }

    const refreshed = orders.find((order) => order._id === selectedOrder._id) || selectedOrder;

    setSelectedOrder(refreshed);
    setDraft({
      deliveryMethod: refreshed.deliveryMethod || "standard",
      trackingNumber: refreshed.trackingNumber || "",
      fulfillmentNotes: refreshed.fulfillmentNotes || "",
      internalNote: refreshed.internalNote || ""
    });
  }, [orders, selectedOrder?._id]);

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === "all" ? true : order.status === statusFilter;
    const searchTerm = search.trim().toLowerCase();
    const matchesSearch = searchTerm
      ? `${order.orderNumber} ${order.customerName} ${order.customerEmail}`.toLowerCase().includes(searchTerm)
      : true;

    return matchesStatus && matchesSearch;
  });

  const handleSaveDetails = async () => {
    if (!selectedOrder?._id) {
      return;
    }

    await apiClient.patch(`/admin/orders/${selectedOrder._id}`, draft);
    await loadOrders();
  };

  const paidCount = orders.filter((order) => order.paymentStatus === "paid").length;
  const openCount = orders.filter((order) => ["pending", "processing", "packed"].includes(order.status)).length;
  const shippedCount = orders.filter((order) => order.status === "shipped").length;
  const orderRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

  return (
    <div className="page-stack">
      <PageHeader
        title="Orders"
        description="Monitor fulfillment, payment states, and customer purchase activity."
      />

      <div className="stats-grid">
        <StatCard label="Orders" value={orders.length} />
        <StatCard label="Paid" value={paidCount} accent="dark" />
        <StatCard label="Open fulfillment" value={openCount} />
        <StatCard label="Shipped" value={shippedCount} accent="dark" />
        <StatCard label="Revenue" value={`$${orderRevenue}`} />
      </div>

      <div className="content-grid">
        <section className="section-block">
          <div className="panel-card__header">
            <h3>Order management</h3>
          </div>
          {!canWrite ? (
            <AccessNotice title="Limited access" message="Your role can review orders, but fulfillment changes are restricted." />
          ) : null}

          <div className="form-section">
            <div className="form-section__header">
              <h4>Search & Filter</h4>
              <p>Quickly narrow the queue by customer, order number, or status.</p>
            </div>
            <div className="toolbar-row">
              <label className="field-group">
                <span>Search</span>
                <input
                  placeholder="Order number or customer"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </label>
              <label className="field-group">
                <span>Status filter</span>
                <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                  <option value="all">All statuses</option>
                  {orderStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="form-section">
            <div className="form-section__header">
              <h4>Order Queue</h4>
              <p>Review payment state, fulfillment progress, and open the full order workspace.</p>
            </div>
            <DataTable
              columns={[
                { key: "orderNumber", label: "Order" },
                {
                  key: "customer",
                  label: "Customer",
                  render: (row) => (
                    <div>
                      <strong>{row.customerName}</strong>
                      <div className="muted-copy">{row.customerEmail}</div>
                    </div>
                  )
                },
                { key: "itemCount", label: "Items", render: (row) => row.items?.reduce((sum, item) => sum + item.quantity, 0) || 0 },
                { key: "totalAmount", label: "Total", render: (row) => `$${row.totalAmount}` },
                {
                  key: "status",
                  label: "Fulfillment",
                  render: (row) => (
                    <select
                      disabled={!canWrite}
                      value={row.status}
                      onChange={(event) => handleStatusChange(row, { status: event.target.value })}
                    >
                      {orderStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  )
                },
                {
                  key: "paymentStatus",
                  label: "Payment",
                  render: (row) => (
                    <select
                      disabled={!canWrite}
                      value={row.paymentStatus}
                      onChange={(event) => handleStatusChange(row, { paymentStatus: event.target.value })}
                    >
                      {paymentStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  )
                },
                {
                  key: "actions",
                  label: "Actions",
                  render: (row) => (
                    <button type="button" className="secondary-button" onClick={() => setSelectedOrder(row)}>
                      Open
                    </button>
                  )
                }
              ]}
              rows={filteredOrders}
              emptyText="No orders yet. Seed sample orders to preview the workflow."
            />
          </div>
        </section>

        <aside className="panel-card detail-card">
          <div className="panel-card__header">
            <h3>{selectedOrder?.orderNumber || "Order details"}</h3>
            {selectedOrder ? <span>{selectedOrder.customerName}</span> : null}
          </div>

          {selectedOrder ? (
            <div className="detail-stack">
              <div className="detail-kpis">
                <div>
                  <span>Total</span>
                  <strong>${selectedOrder.totalAmount}</strong>
                </div>
                <div>
                  <span>Items</span>
                  <strong>{selectedOrder.items?.reduce((sum, item) => sum + item.quantity, 0) || 0}</strong>
                </div>
              </div>

              <div className="form-section">
                <div className="form-section__header">
                  <h4>Customer Snapshot</h4>
                  <p>Contact information and delivery mode for this purchase.</p>
                </div>
                <div className="detail-section">
                  <div className="detail-list">
                    <div className="detail-list__item"><span>Email</span><strong>{selectedOrder.customerEmail}</strong></div>
                    <div className="detail-list__item"><span>Phone</span><strong>{selectedOrder.customerPhone || "--"}</strong></div>
                    <div className="detail-list__item"><span>Delivery</span><strong>{selectedOrder.deliveryMethod}</strong></div>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <div className="form-section__header">
                  <h4>Fulfillment Controls</h4>
                  <p>Update delivery handling, tracking, and internal notes from one place.</p>
                </div>
                <div className="detail-section">
                  <div className="form-grid form-grid--single">
                    <label className="field-group">
                      <span>Delivery method</span>
                      <select
                        disabled={!canWrite}
                        value={draft.deliveryMethod}
                        onChange={(event) => setDraft((previous) => ({ ...previous, deliveryMethod: event.target.value }))}
                      >
                        {deliveryMethods.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="field-group">
                      <span>Tracking number</span>
                      <input
                        disabled={!canWrite}
                        placeholder="Enter courier tracking number"
                        value={draft.trackingNumber}
                        onChange={(event) => setDraft((previous) => ({ ...previous, trackingNumber: event.target.value }))}
                      />
                    </label>
                    <label className="field-group">
                      <span>Fulfillment notes</span>
                      <textarea
                        disabled={!canWrite}
                        placeholder="Packing and dispatch notes"
                        value={draft.fulfillmentNotes}
                        onChange={(event) =>
                          setDraft((previous) => ({ ...previous, fulfillmentNotes: event.target.value }))
                        }
                      />
                    </label>
                    <label className="field-group">
                      <span>Internal note</span>
                      <textarea
                        disabled={!canWrite}
                        placeholder="Private operations note"
                        value={draft.internalNote}
                        onChange={(event) => setDraft((previous) => ({ ...previous, internalNote: event.target.value }))}
                      />
                    </label>
                  </div>
                  <div className="form-actions">
                    <button disabled={!canWrite} type="button" className="primary-button" onClick={handleSaveDetails}>
                      Save order notes
                    </button>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <div className="form-section__header">
                  <h4>Shipping Address</h4>
                  <p>Destination details used for dispatch and delivery coordination.</p>
                </div>
                <div className="detail-section">
                  <p className="muted-copy">
                    {selectedOrder.shippingAddress?.fullName}
                    <br />
                    {selectedOrder.shippingAddress?.line1}
                    {selectedOrder.shippingAddress?.line2 ? `, ${selectedOrder.shippingAddress.line2}` : ""}
                    <br />
                    {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.region}
                    <br />
                    {selectedOrder.shippingAddress?.country} {selectedOrder.shippingAddress?.postalCode}
                  </p>
                </div>
              </div>

              <div className="form-section">
                <div className="form-section__header">
                  <h4>Ordered Items</h4>
                  <p>Line items included in this order with their quantities and unit prices.</p>
                </div>
                <div className="detail-section">
                  <div className="detail-list">
                    {(selectedOrder.items || []).map((item) => (
                      <div key={`${selectedOrder._id}-${item.title}`} className="detail-list__item">
                        <div>
                          <strong>{item.title}</strong>
                          <div className="muted-copy">Qty {item.quantity}</div>
                        </div>
                        <span>${item.unitPrice}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="form-section">
                <div className="form-section__header">
                  <h4>Status Timeline</h4>
                  <p>A running history of the order as it moves through operations.</p>
                </div>
                <div className="detail-section">
                  <div className="timeline-list">
                    {(selectedOrder.statusTimeline || []).map((item, index) => (
                      <div key={`${item.status}-${index}`} className="timeline-item">
                        <strong>{item.status}</strong>
                        <span>{item.note || "Status updated"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="muted-copy">Select an order to review fulfillment details.</p>
          )}
        </aside>
      </div>
    </div>
  );
};

export default OrdersPage;
