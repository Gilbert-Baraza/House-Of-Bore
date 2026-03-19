import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
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
  const location = useLocation();
  const navigate = useNavigate();
  const adminName = localStorage.getItem("admin_name") || "Admin";
  const adminRole = getAdminRole();
  const visibleItems = navItems.filter((item) => hasPermission(item.permission));
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_name");
    localStorage.removeItem("admin_email");
    localStorage.removeItem("admin_role");
    localStorage.removeItem("admin_permissions");
    navigate("/login");
  };

  const handleNavItemClick = () => {
    setIsMobileNavOpen(false);
  };

  return (
    <div className="admin-shell">
      <button
        type="button"
        className="admin-mobile-menu"
        onClick={() => setIsMobileNavOpen(true)}
        aria-label="Open navigation menu"
      >
        <span />
        <span />
        <span />
      </button>

      {isMobileNavOpen ? (
        <button
          type="button"
          className="admin-sidebar-backdrop"
          aria-label="Close navigation menu"
          onClick={() => setIsMobileNavOpen(false)}
        />
      ) : null}

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
                onClick={handleNavItemClick}
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
      <aside className={`admin-mobile-sidebar ${isMobileNavOpen ? "is-open" : ""}`} aria-hidden={!isMobileNavOpen}>
        <div>
          <div className="brand-lockup">
            <div className="admin-mobile-sidebar__header">
              <span className="brand-pill">House of bore</span>
              <button
                type="button"
                className="admin-mobile-close"
                onClick={() => setIsMobileNavOpen(false)}
                aria-label="Close navigation menu"
              >
                ×
              </button>
            </div>
            <h1>Admin Console</h1>
            <p>Commerce operations, inventory, and performance in one place.</p>
          </div>
          <nav className="admin-nav">
            {visibleItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `admin-nav__link ${isActive ? "is-active" : ""}`}
                onClick={handleNavItemClick}
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
