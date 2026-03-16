import { NavLink, Outlet, useNavigate } from "react-router-dom";
import "./admin-layout.css";

const navItems = [
  { to: "/dashboard", label: "Overview" },
  { to: "/products", label: "Products" },
  { to: "/categories", label: "Categories" },
  { to: "/orders", label: "Orders" }
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const adminName = localStorage.getItem("admin_name") || "Admin";

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_name");
    localStorage.removeItem("admin_email");
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
            {navItems.map((item) => (
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
            <span>Store administrator</span>
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
