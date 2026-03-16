import { useEffect, useState } from "react";
import { apiClient } from "../api/client";
import PageHeader from "../components/ui/PageHeader";
import DataTable from "../components/ui/DataTable";
import StatCard from "../components/ui/StatCard";
import AccessNotice from "../components/ui/AccessNotice";
import { hasPermission } from "../utils/permissions";

const orderStatuses = ["unpaid", "to_be_shipped", "shipped", "out_for_delivery", "completed", "cancelled", "returned"];
const paymentStatuses = ["pending", "paid", "failed", "refunded"];
const deliveryMethods = ["standard", "express", "pickup"];
const formatStatusLabel = (value) => {
  if (!value) {
    return "--";
  }

  return value
    .split("_")
    .join(" ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

const formatTimelineDate = (value) => {
  if (!value) {
    return "Just now";
  }

  return new Date(value).toLocaleString();
};

const formatDeliveryDate = (value) => {
  if (!value) {
    return "Not scheduled";
  }

  return new Date(value).toLocaleDateString();
};

const getStatusBadgeClassName = (value) => {
  switch (value) {
    case "unpaid":
    case "pending":
      return "status-badge status-badge--warning";
    case "to_be_shipped":
      return "status-badge status-badge--accent";
    case "shipped":
    case "out_for_delivery":
      return "status-badge status-badge--info";
    case "completed":
    case "paid":
      return "status-badge status-badge--success";
    case "cancelled":
    case "failed":
      return "status-badge status-badge--danger";
    case "returned":
    case "refunded":
      return "status-badge status-badge--muted";
    default:
      return "status-badge";
  }
};

const OrdersPage = () => {
  const canWrite = hasPermission("orders:write");
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState({
    status: "unpaid",
    paymentStatus: "pending",
    deliveryMethod: "standard",
    courierName: "",
    trackingNumber: "",
    courierTrackingUrl: "",
    estimatedDeliveryDate: "",
    fulfillmentNotes: "",
    internalNote: "",
    trackingUpdate: ""
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
      status: refreshed.status || "unpaid",
      paymentStatus: refreshed.paymentStatus || "pending",
      deliveryMethod: refreshed.deliveryMethod || "standard",
      courierName: refreshed.courierName || "",
      trackingNumber: refreshed.trackingNumber || "",
      courierTrackingUrl: refreshed.courierTrackingUrl || "",
      estimatedDeliveryDate: refreshed.estimatedDeliveryDate
        ? new Date(refreshed.estimatedDeliveryDate).toISOString().slice(0, 10)
        : "",
      fulfillmentNotes: refreshed.fulfillmentNotes || "",
      internalNote: refreshed.internalNote || "",
      trackingUpdate: ""
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

  const handleSaveTrackingUpdate = async () => {
    if (!selectedOrder?._id) {
      return;
    }

    await apiClient.patch(`/admin/orders/${selectedOrder._id}/status`, {
      status: draft.status,
      paymentStatus: draft.paymentStatus,
      customerUpdate: draft.trackingUpdate
    });

    await loadOrders();
  };

  const paidCount = orders.filter((order) => order.paymentStatus === "paid").length;
  const openCount = orders.filter((order) => ["unpaid", "to_be_shipped"].includes(order.status)).length;
  const shippedCount = orders.filter((order) => ["shipped", "out_for_delivery"].includes(order.status)).length;
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
        <StatCard label="In transit" value={shippedCount} accent="dark" />
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
                      {formatStatusLabel(status)}
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
                    <div className="status-cell">
                      <span className={getStatusBadgeClassName(row.status)}>{formatStatusLabel(row.status)}</span>
                      <select
                        disabled={!canWrite}
                        value={row.status}
                        onChange={(event) => handleStatusChange(row, { status: event.target.value })}
                      >
                        {orderStatuses.map((status) => (
                          <option key={status} value={status}>
                            {formatStatusLabel(status)}
                          </option>
                        ))}
                      </select>
                    </div>
                  )
                },
                {
                  key: "paymentStatus",
                  label: "Payment",
                  render: (row) => (
                    <div className="status-cell">
                      <span className={getStatusBadgeClassName(row.paymentStatus)}>{formatStatusLabel(row.paymentStatus)}</span>
                      <select
                        disabled={!canWrite}
                        value={row.paymentStatus}
                        onChange={(event) => handleStatusChange(row, { paymentStatus: event.target.value })}
                      >
                        {paymentStatuses.map((status) => (
                          <option key={status} value={status}>
                            {formatStatusLabel(status)}
                          </option>
                        ))}
                      </select>
                    </div>
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
                <div>
                  <span>Status</span>
                  <strong>
                    <span className={getStatusBadgeClassName(selectedOrder.status)}>{formatStatusLabel(selectedOrder.status)}</span>
                  </strong>
                </div>
                <div>
                  <span>Payment</span>
                  <strong>
                    <span className={getStatusBadgeClassName(selectedOrder.paymentStatus)}>{formatStatusLabel(selectedOrder.paymentStatus)}</span>
                  </strong>
                </div>
                <div>
                  <span>ETA</span>
                  <strong>{formatDeliveryDate(selectedOrder.estimatedDeliveryDate)}</strong>
                </div>
              </div>

              <div className="form-section">
                <div className="form-section__header">
                  <h4>Tracking & Status</h4>
                  <p>Control the customer-facing status, payment state, and timeline updates shown on order tracking.</p>
                </div>
                <div className="detail-section">
                  <div className="form-grid form-grid--single">
                    <label className="field-group">
                      <span>Fulfillment status</span>
                      <select
                        disabled={!canWrite}
                        value={draft.status}
                        onChange={(event) => setDraft((previous) => ({ ...previous, status: event.target.value }))}
                      >
                        {orderStatuses.map((status) => (
                          <option key={status} value={status}>
                            {formatStatusLabel(status)}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="field-group">
                      <span>Payment status</span>
                      <select
                        disabled={!canWrite}
                        value={draft.paymentStatus}
                        onChange={(event) => setDraft((previous) => ({ ...previous, paymentStatus: event.target.value }))}
                      >
                        {paymentStatuses.map((status) => (
                          <option key={status} value={status}>
                            {formatStatusLabel(status)}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="field-group">
                      <span>Customer-facing tracking update</span>
                      <textarea
                        disabled={!canWrite}
                        placeholder="Example: Courier picked up the parcel and delivery is expected tomorrow."
                        value={draft.trackingUpdate}
                        onChange={(event) => setDraft((previous) => ({ ...previous, trackingUpdate: event.target.value }))}
                      />
                    </label>
                  </div>
                  <div className="form-actions">
                    <button disabled={!canWrite} type="button" className="primary-button" onClick={handleSaveTrackingUpdate}>
                      Save tracking update
                    </button>
                  </div>
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
                    <div className="detail-list__item"><span>Delivery</span><strong>{formatStatusLabel(selectedOrder.deliveryMethod)}</strong></div>
                    <div className="detail-list__item"><span>Courier</span><strong>{selectedOrder.courierName || "--"}</strong></div>
                    <div className="detail-list__item"><span>Estimated delivery</span><strong>{formatDeliveryDate(selectedOrder.estimatedDeliveryDate)}</strong></div>
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
                      <span>Courier name</span>
                      <input
                        disabled={!canWrite}
                        placeholder="Example: DHL, G4S, Fargo"
                        value={draft.courierName}
                        onChange={(event) => setDraft((previous) => ({ ...previous, courierName: event.target.value }))}
                      />
                    </label>
                    <label className="field-group">
                      <span>Courier tracking link</span>
                      <input
                        disabled={!canWrite}
                        placeholder="https://courier.example/track/123"
                        value={draft.courierTrackingUrl}
                        onChange={(event) =>
                          setDraft((previous) => ({ ...previous, courierTrackingUrl: event.target.value }))
                        }
                      />
                    </label>
                    <label className="field-group">
                      <span>Estimated delivery date</span>
                      <input
                        disabled={!canWrite}
                        type="date"
                        value={draft.estimatedDeliveryDate}
                        onChange={(event) =>
                          setDraft((previous) => ({ ...previous, estimatedDeliveryDate: event.target.value }))
                        }
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
                        <div>
                          <strong>
                            <span className={getStatusBadgeClassName(item.status)}>{formatStatusLabel(item.status)}</span>
                          </strong>
                          <div className="muted-copy">{item.note || "Status updated"}</div>
                        </div>
                        <span>{formatTimelineDate(item.changedAt)}</span>
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
