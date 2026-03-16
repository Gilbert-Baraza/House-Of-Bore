import { useEffect, useState } from "react";
import { LineChart, Line, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { apiClient } from "../api/client";
import PageHeader from "../components/ui/PageHeader";
import StatCard from "../components/ui/StatCard";
import DataTable from "../components/ui/DataTable";

const formatStatusLabel = (value) => {
  if (!value) {
    return "--";
  }

  return value
    .split("_")
    .join(" ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

const revenueTrend = [
  { month: "Jan", sales: 1200 },
  { month: "Feb", sales: 1800 },
  { month: "Mar", sales: 2100 },
  { month: "Apr", sales: 2800 },
  { month: "May", sales: 2600 },
  { month: "Jun", sales: 3400 }
];

const DashboardPage = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const payload = await apiClient.get("/admin/dashboard/stats");
        setStats(payload.data);
      } catch (error) {
        console.error(error);
      }
    };

    loadStats();
  }, []);

  return (
    <div className="page-stack">
      <PageHeader
        title="Dashboard overview"
        description="Track sales, inventory, and operations at a glance."
      />

      <div className="stats-grid">
        <StatCard label="Products" value={stats?.cards?.products ?? "--"} />
        <StatCard label="Categories" value={stats?.cards?.categories ?? "--"} accent="dark" />
        <StatCard label="Orders" value={stats?.cards?.orders ?? "--"} />
        <StatCard label="Customers" value={stats?.cards?.customers ?? "--"} accent="dark" />
        <StatCard label="Revenue" value={`$${stats?.cards?.revenue ?? 0}`} />
      </div>

      <div className="content-grid">
        <section className="panel-card chart-panel">
          <div className="panel-card__header">
            <h3>Sales momentum</h3>
            <span>Last 6 months</span>
          </div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eceef4" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="sales" stroke="#f68b1e" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="panel-card">
          <div className="panel-card__header">
            <h3>Operational snapshot</h3>
          </div>
          <div className="mini-stat-list">
            <div><span>Paid orders</span><strong>{stats?.cards?.paidOrders ?? "--"}</strong></div>
            <div><span>Unpaid orders</span><strong>{stats?.cards?.unpaidOrders ?? "--"}</strong></div>
            <div><span>Subscribed customers</span><strong>{stats?.cards?.subscribedCustomers ?? "--"}</strong></div>
            <div><span>Low stock alerts</span><strong>{stats?.lowStockProducts?.length ?? 0}</strong></div>
          </div>
        </section>
      </div>

      <div className="content-grid">
        <section>
          <div className="section-block">
            <h3>Recent orders</h3>
            <DataTable
              columns={[
                { key: "orderNumber", label: "Order" },
                { key: "customerName", label: "Customer" },
                { key: "status", label: "Status", render: (row) => formatStatusLabel(row.status) },
                { key: "totalAmount", label: "Total", render: (row) => `$${row.totalAmount}` }
              ]}
              rows={stats?.recentOrders || []}
            />
          </div>
        </section>

        <section>
          <div className="section-block">
            <h3>Low stock products</h3>
            <DataTable
              columns={[
                { key: "title", label: "Product" },
                { key: "category", label: "Category" },
                { key: "stock", label: "Stock" }
              ]}
              rows={stats?.lowStockProducts || []}
            />
          </div>
        </section>
      </div>
    </div>
  );
};

export default DashboardPage;
