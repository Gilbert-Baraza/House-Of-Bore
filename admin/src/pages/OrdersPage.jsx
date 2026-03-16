import { useEffect, useState } from "react";
import { apiClient } from "../api/client";
import PageHeader from "../components/ui/PageHeader";
import DataTable from "../components/ui/DataTable";

const orderStatuses = ["pending", "paid", "processing", "shipped", "delivered", "cancelled"];
const paymentStatuses = ["pending", "paid", "failed", "refunded"];

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);

  const loadOrders = async () => {
    const payload = await apiClient.get("/admin/orders");
    setOrders(payload.data);
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

  return (
    <div className="page-stack">
      <PageHeader
        title="Orders"
        description="Monitor fulfillment, payment states, and customer purchase activity."
      />

      <div className="section-block">
        <h3>Order management</h3>
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
            { key: "itemCount", label: "Items", render: (row) => row.items?.length || 0 },
            { key: "totalAmount", label: "Total", render: (row) => `$${row.totalAmount}` },
            {
              key: "status",
              label: "Fulfillment",
              render: (row) => (
                <select
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
            }
          ]}
          rows={orders}
          emptyText="No orders yet. Seed sample orders to preview the workflow."
        />
      </div>
    </div>
  );
};

export default OrdersPage;
