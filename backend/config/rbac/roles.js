/**
 * Definición de roles y permisos del sistema
 * Esto reemplaza la configuración dinámica de BD
 */

const PERMISSIONS = {
    // Apartamentos
    APARTMENTS_READ: 'apartments:read',
    APARTMENTS_CREATE: 'apartments:create',
    APARTMENTS_UPDATE: 'apartments:update',
    APARTMENTS_DELETE: 'apartments:delete',

    // Residentes
    TENANTS_READ: 'tenants:read',
    TENANTS_CREATE: 'tenants:create',
    TENANTS_UPDATE: 'tenants:update',
    TENANTS_DELETE: 'tenants:delete',

    // Propietarios
    OWNERS_READ: 'owners:read',
    OWNERS_CREATE: 'owners:create',
    OWNERS_UPDATE: 'owners:update',
    OWNERS_DELETE: 'owners:delete',

    // Paquetes
    PACKAGES_READ: 'packages:read',
    PACKAGES_CREATE: 'packages:create',
    PACKAGES_UPDATE: 'packages:update',
    PACKAGES_DELIVER: 'packages:deliver',

    // PQRS
    PQRS_READ: 'pqrs:read',
    PQRS_CREATE: 'pqrs:create',
    PQRS_UPDATE: 'pqrs:update',
    PQRS_RESOLVE: 'pqrs:resolve',

    // Reservas
    RESERVATIONS_READ: 'reservations:read',
    RESERVATIONS_CREATE: 'reservations:create',
    RESERVATIONS_APPROVE: 'reservations:approve',
    RESERVATIONS_CANCEL: 'reservations:cancel',

    // Visitantes
    VISITORS_READ: 'visitors:read',
    VISITORS_CREATE: 'visitors:create',
    VISITORS_AUTHORIZE: 'visitors:authorize',

    // Administración
    USERS_MANAGE: 'users:manage',
    SETTINGS_MANAGE: 'settings:manage',
    REPORTS_VIEW: 'reports:view',
};

const ROLES = {
    ADMIN: {
        name: 'admin',
        displayName: 'Administrador',
        permissions: Object.values(PERMISSIONS), // Todos los permisos
    },

    GUARD: {
        name: 'guard',
        displayName: 'Guardia',
        permissions: [
            PERMISSIONS.PACKAGES_READ,
            PERMISSIONS.PACKAGES_CREATE,
            PERMISSIONS.PACKAGES_UPDATE,
            PERMISSIONS.PACKAGES_DELIVER,
            PERMISSIONS.VISITORS_READ,
            PERMISSIONS.VISITORS_CREATE,
            PERMISSIONS.VISITORS_AUTHORIZE,
        ],
    },

    OWNER: {
        name: 'owner',
        displayName: 'Propietario',
        permissions: [
            PERMISSIONS.APARTMENTS_READ,
            PERMISSIONS.TENANTS_READ,
            PERMISSIONS.PACKAGES_READ,
            PERMISSIONS.PQRS_READ,
            PERMISSIONS.PQRS_CREATE,
            PERMISSIONS.RESERVATIONS_READ,
            PERMISSIONS.RESERVATIONS_CREATE,
            PERMISSIONS.VISITORS_READ,
            PERMISSIONS.VISITORS_CREATE,
        ],
    },
};

export default {
    PERMISSIONS,
    ROLES,

    /**
     * Obtiene permisos de un rol
     */
    getPermissionsByRole(roleName) {
        const role = Object.values(ROLES).find(r => r.name === roleName);
        return role ? role.permissions : [];
    },

    /**
     * Verifica si un rol tiene un permiso específico
     */
    hasPermission(roleName, permission) {
        const permissions = this.getPermissionsByRole(roleName);
        return permissions.includes(permission);
    },
};