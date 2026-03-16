const readStoredPermissions = () => {
  try {
    return JSON.parse(localStorage.getItem("admin_permissions") || "[]");
  } catch {
    return [];
  }
};

export const getAdminRole = () => localStorage.getItem("admin_role") || "";
export const getAdminPermissions = () => readStoredPermissions();
export const hasPermission = (permission) => readStoredPermissions().includes(permission);
