export const ROLES = {
  ENGINEER: 'engineer',
  MANAGER: 'manager',
  TEAM_LEAD: 'team_lead',
  ADMIN: 'admin',
};

export const ROLE_NAMES = {
  [ROLES.ENGINEER]: 'Инженер',
  [ROLES.MANAGER]: 'Менеджер',
  [ROLES.TEAM_LEAD]: 'Руководитель бригады',
  [ROLES.ADMIN]: 'Администратор',
};

export const PERMISSIONS = {
  VIEW_DEFECTS: 'view_defects',
  CREATE_DEFECTS: 'create_defects',
  EDIT_DEFECTS: 'edit_defects',
  DELETE_DEFECTS: 'delete_defects',
  ASSIGN_DEFECTS: 'assign_defects',

  VIEW_PROJECTS: 'view_projects',
  CREATE_PROJECTS: 'create_projects',
  EDIT_PROJECTS: 'edit_projects',
  DELETE_PROJECTS: 'delete_projects',

  VIEW_REPORTS: 'view_reports',
  EXPORT_DATA: 'export_data',

  MANAGE_USERS: 'manage_users',
  MANAGE_ACCESS: 'manage_access',

  ADD_COMMENTS: 'add_comments',
  VIEW_HISTORY: 'view_history',

  COORDINATE_WORK: 'coordinate_work',
  DISTRIBUTE_TASKS: 'distribute_tasks',

  VIEW_ANALYTICS: 'view_analytics',
};

export const ROLE_PERMISSIONS = {
  [ROLES.ENGINEER]: [
    PERMISSIONS.VIEW_DEFECTS,
    PERMISSIONS.VIEW_PROJECTS,
    PERMISSIONS.VIEW_HISTORY,
  ],

  [ROLES.MANAGER]: [
    PERMISSIONS.VIEW_DEFECTS,
    PERMISSIONS.CREATE_DEFECTS,
    PERMISSIONS.EDIT_DEFECTS,
    PERMISSIONS.ASSIGN_DEFECTS,
    PERMISSIONS.VIEW_PROJECTS,
    PERMISSIONS.CREATE_PROJECTS,
    PERMISSIONS.EDIT_PROJECTS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.EXPORT_DATA,
    PERMISSIONS.ADD_COMMENTS,
    PERMISSIONS.VIEW_HISTORY,
    PERMISSIONS.COORDINATE_WORK,
    PERMISSIONS.DISTRIBUTE_TASKS,
    PERMISSIONS.VIEW_ANALYTICS,
  ],

  [ROLES.TEAM_LEAD]: [
    PERMISSIONS.VIEW_DEFECTS,
    PERMISSIONS.EDIT_DEFECTS,
    PERMISSIONS.VIEW_PROJECTS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.ADD_COMMENTS,
    PERMISSIONS.VIEW_HISTORY,
    PERMISSIONS.VIEW_ANALYTICS,
  ],

  [ROLES.ADMIN]: [
    PERMISSIONS.VIEW_DEFECTS,
    PERMISSIONS.CREATE_DEFECTS,
    PERMISSIONS.EDIT_DEFECTS,
    PERMISSIONS.DELETE_DEFECTS,
    PERMISSIONS.ASSIGN_DEFECTS,
    PERMISSIONS.VIEW_PROJECTS,
    PERMISSIONS.CREATE_PROJECTS,
    PERMISSIONS.EDIT_PROJECTS,
    PERMISSIONS.DELETE_PROJECTS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.EXPORT_DATA,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.MANAGE_ACCESS,
    PERMISSIONS.ADD_COMMENTS,
    PERMISSIONS.VIEW_HISTORY,
    PERMISSIONS.COORDINATE_WORK,
    PERMISSIONS.DISTRIBUTE_TASKS,
    PERMISSIONS.VIEW_ANALYTICS,
  ],
};

export function hasPermission(userRole, permission) {
  if (!userRole || !permission) return false;
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  return permissions.includes(permission);
}

export function hasAnyPermission(userRole, permissions) {
  if (!userRole || !permissions || !Array.isArray(permissions)) return false;
  return permissions.some(permission => hasPermission(userRole, permission));
}

export function hasAllPermissions(userRole, permissions) {
  if (!userRole || !permissions || !Array.isArray(permissions)) return false;
  return permissions.every(permission => hasPermission(userRole, permission));
}

export function getRolePermissions(role) {
  return ROLE_PERMISSIONS[role] || [];
}

export function canViewDefects(userRole) {
  return hasPermission(userRole, PERMISSIONS.VIEW_DEFECTS);
}

export function canCreateDefects(userRole) {
  return hasPermission(userRole, PERMISSIONS.CREATE_DEFECTS);
}

export function canEditDefects(userRole) {
  return hasPermission(userRole, PERMISSIONS.EDIT_DEFECTS);
}

export function canDeleteDefects(userRole) {
  return hasPermission(userRole, PERMISSIONS.DELETE_DEFECTS);
}

export function canManageProjects(userRole) {
  return hasAnyPermission(userRole, [
    PERMISSIONS.CREATE_PROJECTS,
    PERMISSIONS.EDIT_PROJECTS,
    PERMISSIONS.DELETE_PROJECTS,
  ]);
}

export function canManageUsers(userRole) {
  return hasPermission(userRole, PERMISSIONS.MANAGE_USERS);
}

export function canExportData(userRole) {
  return hasPermission(userRole, PERMISSIONS.EXPORT_DATA);
}

export function canViewAnalytics(userRole) {
  return hasPermission(userRole, PERMISSIONS.VIEW_ANALYTICS);
}
