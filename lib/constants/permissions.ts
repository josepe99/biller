export const permissions = [
  // Permisos de Gestión de Usuarios
  {
    name: "users:create",
    description: "Crear nuevos usuarios",
    resource: "users",
    action: "create",
    category: "Gestión de Usuarios",
  },
  {
    name: "users:read",
    description: "Ver usuarios y detalles de los usuarios",
    resource: "users",
    action: "read",
    category: "Gestión de Usuarios",
  },
  {
    name: "users:update",
    description: "Actualizar información y perfiles de usuarios",
    resource: "users",
    action: "update",
    category: "Gestión de Usuarios",
  },
  {
    name: "users:delete",
    description: "Eliminar o desactivar usuarios",
    resource: "users",
    action: "delete",
    category: "Gestión de Usuarios",
  },
  {
    name: "users:manage",
    description: "Acceso total a la gestión de usuarios",
    resource: "users",
    action: "manage",
    category: "Gestión de Usuarios",
  },

  // Permisos de Gestión de Productos
  {
    name: "products:create",
    description: "Agregar nuevos productos al inventario",
    resource: "products",
    action: "create",
    category: "Gestión de Productos",
  },
  {
    name: "products:read",
    description: "Ver productos y sus detalles",
    resource: "products",
    action: "read",
    category: "Gestión de Productos",
  },
  {
    name: "products:update",
    description: "Actualizar información, precios y detalles de productos",
    resource: "products",
    action: "update",
    category: "Gestión de Productos",
  },
  {
    name: "products:delete",
    description: "Eliminar o desactivar productos",
    resource: "products",
    action: "delete",
    category: "Gestión de Productos",
  },
  {
    name: "products:manage",
    description: "Acceso total a la gestión de productos",
    resource: "products",
    action: "manage",
    category: "Gestión de Productos",
  },

  // Permisos de Gestión de Categorías
  {
    name: "categories:create",
    description: "Crear nuevas categorías de productos",
    resource: "categories",
    action: "create",
    category: "Gestión de Categorías",
  },
  {
    name: "categories:read",
    description: "Ver categorías y sus detalles",
    resource: "categories",
    action: "read",
    category: "Gestión de Categorías",
  },
  {
    name: "categories:update",
    description: "Actualizar información de categorías",
    resource: "categories",
    action: "update",
    category: "Gestión de Categorías",
  },
  {
    name: "categories:delete",
    description: "Eliminar o desactivar categorías",
    resource: "categories",
    action: "delete",
    category: "Gestión de Categorías",
  },
  {
    name: "categories:manage",
    description: "Acceso total a la gestión de categorías",
    resource: "categories",
    action: "manage",
    category: "Gestión de Categorías",
  },

  // Permisos de Gestión de Clientes
  {
    name: "customers:create",
    description: "Agregar nuevos clientes al sistema",
    resource: "customers",
    action: "create",
    category: "Gestión de Clientes",
  },
  {
    name: "customers:read",
    description: "Ver clientes y sus detalles",
    resource: "customers",
    action: "read",
    category: "Gestión de Clientes",
  },
  {
    name: "customers:update",
    description: "Actualizar información de clientes",
    resource: "customers",
    action: "update",
    category: "Gestión de Clientes",
  },
  {
    name: "customers:delete",
    description: "Eliminar o desactivar clientes",
    resource: "customers",
    action: "delete",
    category: "Gestión de Clientes",
  },
  {
    name: "customers:manage",
    description: "Acceso total a la gestión de clientes",
    resource: "customers",
    action: "manage",
    category: "Gestión de Clientes",
  },

  // Permisos de Gestión de Ventas
  {
    name: "sales:create",
    description: "Registrar nuevas ventas y transacciones",
    resource: "sales",
    action: "create",
    category: "Gestión de Ventas",
  },
  {
    name: "sales:read",
    description: "Ver historial de ventas y detalles de transacciones",
    resource: "sales",
    action: "read",
    category: "Gestión de Ventas",
  },
  {
    name: "sales:update",
    description: "Modificar ventas existentes (escenarios limitados)",
    resource: "sales",
    action: "update",
    category: "Gestión de Ventas",
  },
  {
    name: "sales:delete",
    description: "Cancelar o anular transacciones de venta",
    resource: "sales",
    action: "delete",
    category: "Gestión de Ventas",
  },
  {
    name: "sales:refund",
    description: "Procesar reembolsos y devoluciones",
    resource: "sales",
    action: "refund",
    category: "Gestión de Ventas",
  },
  {
    name: "sales:discount",
    description: "Aplicar descuentos en ventas",
    resource: "sales",
    action: "discount",
    category: "Gestión de Ventas",
  },
  {
    name: "sales:manage",
    description: "Acceso total a la gestión de ventas",
    resource: "sales",
    action: "manage",
    category: "Gestión de Ventas",
  },

  // Permisos de Notas de Credito
  {
    name: "creditNotes:create",
    description: "Crear notas de credito para devoluciones",
    resource: "creditNotes",
    action: "create",
    category: "Gestion de Notas de Credito",
  },
  {
    name: "creditNotes:read",
    description: "Ver notas de credito y sus detalles",
    resource: "creditNotes",
    action: "read",
    category: "Gestion de Notas de Credito",
  },
  {
    name: "creditNotes:update",
    description: "Actualizar informacion y estado de notas de credito",
    resource: "creditNotes",
    action: "update",
    category: "Gestion de Notas de Credito",
  },
  {
    name: "creditNotes:delete",
    description: "Eliminar o anular notas de credito",
    resource: "creditNotes",
    action: "delete",
    category: "Gestion de Notas de Credito",
  },
  {
    name: "creditNotes:manage",
    description: "Acceso total a la gestion de notas de credito",
    resource: "creditNotes",
    action: "manage",
    category: "Gestion de Notas de Credito",
  },

  // Gestión de Cajas (cashRegister) - extendida
  {
    name: "cashRegister:create",
    description: "Crear una nueva caja",
    resource: "cashRegister",
    action: "create",
    category: "Gestión de Cajas",
  },
  {
    name: "cashRegister:update",
    description: "Actualizar información de la caja",
    resource: "cashRegister",
    action: "update",
    category: "Gestión de Cajas",
  },
  {
    name: "cashRegister:delete",
    description: "Eliminar o desactivar una caja",
    resource: "cashRegister",
    action: "delete",
    category: "Gestión de Cajas",
  },
  {
    name: "cashRegister:read",
    description: "Ver información y listado de cajas",
    resource: "cashRegister",
    action: "read",
    category: "Gestión de Cajas",
  },
  {
    name: "cashRegister:open",
    description: "Abrir una caja para iniciar operaciones",
    resource: "cashRegister",
    action: "open",
    category: "Gestión de Cajas",
  },
  {
    name: "cashRegister:close",
    description: "Cerrar una caja y registrar el arqueo final",
    resource: "cashRegister",
    action: "close",
    category: "Gestión de Cajas",
  },
  {
    name: "cashRegister:manage",
    description: "Acceso total a la gestión de cajas",
    resource: "cashRegister",
    action: "manage",
    category: "Gestión de Cajas",
  },
  // Permisos de Checkout (cobro en caja)
  {
    name: "checkout:start",
    description: "Iniciar un proceso de cobro en caja",
    resource: "checkout",
    action: "start",
    category: "Checkout",
  },
  {
    name: "checkout:add_items",
    description: "Agregar productos al carrito de venta",
    resource: "checkout",
    action: "add_items",
    category: "Checkout",
  },
  {
    name: "checkout:remove_items",
    description: "Eliminar productos del carrito de venta",
    resource: "checkout",
    action: "remove_items",
    category: "Checkout",
  },
  {
    name: "checkout:apply_discount",
    description: "Aplicar descuentos durante el proceso de cobro",
    resource: "checkout",
    action: "apply_discount",
    category: "Checkout",
  },
  {
    name: "checkout:apply_promotion",
    description: "Aplicar promociones disponibles al cobro",
    resource: "checkout",
    action: "apply_promotion",
    category: "Checkout",
  },
  {
    name: "checkout:select_payment",
    description: "Seleccionar el método de pago",
    resource: "checkout",
    action: "select_payment",
    category: "Checkout",
  },
  {
    name: "checkout:finalize",
    description: "Finalizar el cobro y generar el comprobante",
    resource: "checkout",
    action: "finalize",
    category: "Checkout",
  },
  {
    name: "checkout:cancel",
    description: "Cancelar el proceso de cobro en curso",
    resource: "checkout",
    action: "cancel",
    category: "Checkout",
  },
  {
    name: "checkout:manage",
    description: "Acceso total al proceso de checkout",
    resource: "checkout",
    action: "manage",
    category: "Checkout",
  },
  {
    name: "roles:create",
    description: "Crear un nuevo rol de usuario",
    resource: "roles",
    action: "create",
    category: "Gestión de Roles",
  },
  {
    name: "roles:update",
    description: "Actualizar información de roles",
    resource: "roles",
    action: "update",
    category: "Gestión de Roles",
  },
  {
    name: "roles:delete",
    description: "Eliminar o desactivar roles",
    resource: "roles",
    action: "delete",
    category: "Gestión de Roles",
  },
  {
    name: "roles:get",
    description: "Ver información y listado de roles",
    resource: "roles",
    action: "get",
    category: "Gestión de Roles",
  },
  {
    name: "roles:manage",
    description: "Acceso total a la gestión de roles",
    resource: "roles",
    action: "manage",
    category: "Gestión de Roles",
  },

  // Permisos de Gestión de Inventario
  {
    name: "inventory:create",
    description: "Agregar productos al inventario",
    resource: "inventory",
    action: "create",
    category: "Gestión de Inventario",
  },
  {
    name: "inventory:update",
    description: "Actualizar productos del inventario",
    resource: "inventory",
    action: "update",
    category: "Gestión de Inventario",
  },
  {
    name: "inventory:delete",
    description: "Eliminar productos del inventario",
    resource: "inventory",
    action: "delete",
    category: "Gestión de Inventario",
  },
  {
    name: "inventory:get",
    description: "Ver información y listado de inventario",
    resource: "inventory",
    action: "get",
    category: "Gestión de Inventario",
  },
  {
    name: "inventory:manage",
    description: "Acceso total a la gestión de inventario",
    resource: "inventory",
    action: "manage",
    category: "Gestión de Inventario",
  },

  // Permisos de Configuración del Sistema
  {
    name: "settings:create",
    description: "Crear nuevas configuraciones del sistema",
    resource: "settings",
    action: "create",
    category: "Configuración del Sistema",
  },
  {
    name: "settings:read",
    description: "Ver configuraciones del sistema",
    resource: "settings",
    action: "read",
    category: "Configuración del Sistema",
  },
  {
    name: "settings:update",
    description: "Actualizar configuraciones del sistema",
    resource: "settings",
    action: "update",
    category: "Configuración del Sistema",
  },
  {
    name: "settings:delete",
    description: "Eliminar configuraciones del sistema",
    resource: "settings",
    action: "delete",
    category: "Configuración del Sistema",
  },
  {
    name: "settings:manage",
    description: "Acceso total a la gestión de configuraciones",
    resource: "settings",
    action: "manage",
    category: "Configuración del Sistema",
  },

  // Permisos de Reportes
  {
    name: "reports:read",
    description: "Ver reportes del sistema",
    resource: "reports",
    action: "read",
    category: "Reportes",
  },
  {
    name: "reports:export",
    description: "Exportar reportes a diferentes formatos",
    resource: "reports",
    action: "export",
    category: "Reportes",
  },
  {
    name: "reports:manage",
    description: "Administrar configuraciones de reportes",
    resource: "reports",
    action: "manage",
    category: "Reportes",
  },
] as const;

// Funciones helper (no cambian porque son lógicas internas)
export const getPermissionsByCategory = (category: string) => {
  return permissions.filter((permission) => permission.category === category);
};

export const getPermissionsByResource = (resource: string) => {
  return permissions.filter((permission) => permission.resource === resource);
};

export const getCategories = () => {
  return [...new Set(permissions.map((permission) => permission.category))];
};

export const getResources = () => {
  return [...new Set(permissions.map((permission) => permission.resource))];
};

export const getActions = () => {
  return [...new Set(permissions.map((permission) => permission.action))];
};

// Tipos
export type PermissionName = (typeof permissions)[number]["name"];
export type PermissionResource = (typeof permissions)[number]["resource"];
export type PermissionAction = (typeof permissions)[number]["action"];
export type PermissionCategory = (typeof permissions)[number]["category"];

export interface Permission {
  name: string;
  description: string;
  resource: string;
  action: string;
  category: string;
}
