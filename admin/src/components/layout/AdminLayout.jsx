import { NavLink, Outlet, useNavigate } from "react-router-dom";
import "./admin-layout.css";
import { getAdminRole, hasPermission } from "../../utils/permissions";

const navItems = [
  { to: "/dashboard", label: "Overview", permission: "dashboard:read" },
  { to: "/products", label: "Products", permission: "products:read" },
  { to: "/categories", label: "Categories", permission: "categories:read" },
  { to: "/orders", label: "Orders", permission: "orders:read" },
  { to: "/customers", label: "Customers", permission: "customers:read" }
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const adminName = localStorage.getItem("admin_name") || "Admin";
  const adminRole = getAdminRole();
  const visibleItems = navItems.filter((item) => hasPermission(item.permission));

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_name");
    localStorage.removeItem("admin_email");
    localStorage.removeItem("admin_role");
    localStorage.removeItem("admin_permissions");
    navigate("/login");
  };

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div>
          <div className="brand-lockup">
            <span className="brand-pill">House of bore</span>
            <h1>Admin Console</h1>
            <p>Commerce operations, inventory, and performance in one place.</p>
          </div>
          <nav className="admin-nav">
            {visibleItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `admin-nav__link ${isActive ? "is-active" : ""}`}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="admin-sidebar__footer">
          <div className="admin-user-card">
            <strong>{adminName}</strong>
            <span>{adminRole ? adminRole.replace("_", " ") : "Store administrator"}</span>
          </div>
          <button type="button" className="ghost-button" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
