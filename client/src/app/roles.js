export const ROLE_ORDER = {
  user: 1,
  admin: 2,
  "super-admin": 3
};

export const ROLE_LABELS = {
  user: "User",
  admin: "Admin",
  "super-admin": "Super Admin"
};

export const USER_STATUS_LABELS = {
  active: "Active",
  suspended: "Suspended"
};

export function normalizeRole(role) {
  return ROLE_ORDER[role] ? role : "user";
}

export function normalizeStatus(status) {
  return status === "suspended" ? "suspended" : "active";
}

export function hasRequiredRole(userRole, allowedRoles = []) {
  if (allowedRoles.length === 0) {
    return true;
  }

  const normalizedRole = normalizeRole(userRole);
  return allowedRoles.some((role) => ROLE_ORDER[normalizedRole] >= ROLE_ORDER[normalizeRole(role)]);
}

export function canManageUsers(role) {
  return hasRequiredRole(role, ["admin"]);
}

export function canManageRoles(role) {
  return hasRequiredRole(role, ["super-admin"]);
}

export function canManageRequirements(role) {
  return hasRequiredRole(role, ["admin"]);
}

export function getRoleLabel(role) {
  return ROLE_LABELS[normalizeRole(role)];
}

export function getStatusLabel(status) {
  return USER_STATUS_LABELS[normalizeStatus(status)];
}
