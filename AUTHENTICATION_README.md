# Sistema de Autenticación Completo

## Descripción General

El sistema de autenticación implementado protege toda la aplicación POS con las siguientes características:

### Características Principales

1. **Autenticación basada en sesiones** - Las sesiones se almacenan en cookies HTTP-only y localStorage
2. **Validación automática de sesiones** - Verifica la validez de las sesiones contra la base de datos cada 5 minutos
3. **Renovación automática de sesiones** - Extiende automáticamente las sesiones válidas
4. **Protección de rutas** - Protege automáticamente todas las rutas excepto las públicas
5. **Control de acceso basado en roles** - Diferentes niveles de acceso (ADMIN, MANAGER, CASHIER)
6. **Middleware avanzado** - Protección a nivel de servidor para rutas y APIs

## Arquitectura del Sistema

### Componentes Principales

#### 1. AuthProvider (`components/auth/auth-provider.tsx`)
- Maneja el estado global de autenticación
- Valida sesiones al iniciar la aplicación
- Proporciona contexto de autenticación a toda la app

#### 2. AuthWrapper (`components/auth/auth-wrapper.tsx`)
- Protege automáticamente todas las rutas
- Define rutas públicas, de administrador y de manager
- Aplica protección basada en roles

#### 3. ProtectedRoute (`components/auth/protected-route.tsx`)
- Componente para proteger rutas específicas
- Valida autenticación y autorización
- Redirige a login o página de no autorizado

#### 4. SessionManager (`lib/utils/session-manager.ts`)
- Maneja validación de sesiones en background
- Singleton para gestión centralizada de sesiones
- Valida sesiones cada 5 minutos automáticamente

#### 5. Middleware (`middleware.ts`)
- Protección a nivel de servidor
- Valida sesiones para cada request
- Controla acceso a APIs y páginas

### Flujo de Autenticación

1. **Login**:
   - Usuario ingresa credenciales
   - Se crea sesión en base de datos
   - Se establece cookie HTTP-only
   - Se guarda sessionId en localStorage
   - Se almacena información del usuario

2. **Validación Continua**:
   - Cada 5 minutos se valida la sesión
   - Se verifica contra la base de datos
   - Se extiende automáticamente si es válida
   - Se redirige a login si es inválida

3. **Logout**:
   - Se invalida la sesión en base de datos
   - Se limpia la cookie del servidor
   - Se elimina información del localStorage

## Rutas y Permisos

### Rutas Públicas (No requieren autenticación)
- `/` - Página de inicio
- `/login` - Página de login
- `/register` - Página de registro
- `/unauthorized` - Página de no autorizado

### Rutas Protegidas por Roles

#### Rutas de Administrador (Solo ADMIN)
- `/admin` - Panel de administración
- `/api/admin/*` - APIs de administración

#### Rutas de Manager+ (MANAGER y ADMIN)
- `/stock` - Gestión de inventario
- `/api/categories/*` - APIs de categorías
- `/api/products/*` - APIs de productos

#### Rutas Generales (Cualquier usuario autenticado)
- Todas las demás rutas requieren autenticación básica

## APIs de Autenticación

### POST `/api/auth/validate-session`
Valida una sesión específica contra la base de datos.

**Request:**
```json
{
  "sessionId": "session_id_string"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "name": "User Name",
    "email": "user@example.com",
    "role": "ADMIN"
  },
  "sessionExtended": true
}
```

### POST `/api/auth/refresh-session`
Extiende una sesión válida.

**Request:**
```json
{
  "sessionId": "session_id_string"
}
```

**Response:**
```json
{
  "success": true,
  "user": { ... },
  "message": "Session refreshed successfully"
}
```

## Hooks y Utilidades

### useSessionValidation()
Hook que maneja la validación automática de sesiones:
- Inicia validación automática cuando el usuario está autenticado
- Maneja redirecciones cuando la sesión es inválida
- Actualiza información del usuario cuando la sesión se renueva

### useAuth()
Hook para acceder al contexto de autenticación:
- `user` - Información del usuario actual
- `sessionId` - ID de la sesión actual
- `isAuthenticated` - Estado de autenticación
- `isLoading` - Estado de carga inicial
- `setAuthData()` - Establecer datos de autenticación
- `clearAuth()` - Limpiar autenticación
- `refreshAuth()` - Refrescar información de autenticación

## Configuración de Seguridad

### Cookies
- **HTTP-Only**: Las cookies no son accesibles desde JavaScript
- **Secure**: En producción, solo se envían por HTTPS
- **SameSite**: Protección contra ataques CSRF
- **Duración**: 1 hora, se renueva automáticamente

### Sesiones
- **Duración**: 1 hora desde la última actividad
- **Renovación**: Se renueva automáticamente al 80% del tiempo de vida
- **Validación**: Cada 5 minutos se valida contra la base de datos
- **Limpieza**: Las sesiones expiradas se pueden limpiar con trabajos programados

## Uso en Componentes

### Proteger una página completa:
```tsx
import { withProtectedRoute } from '@/components/auth/protected-route'

function AdminPage() {
  return <div>Panel de Administración</div>
}

export default withProtectedRoute(AdminPage, {
  requiredRoles: ['ADMIN']
})
```

### Proteger parte de un componente:
```tsx
import { ProtectedRoute } from '@/components/auth/protected-route'

function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <ProtectedRoute requiredRoles={['ADMIN']}>
        <AdminPanel />
      </ProtectedRoute>
    </div>
  )
}
```

### Usar información de autenticación:
```tsx
import { useAuth } from '@/components/auth/auth-provider'

function UserProfile() {
  const { user, isAuthenticated } = useAuth()
  
  if (!isAuthenticated) {
    return <div>No autenticado</div>
  }
  
  return <div>Hola, {user?.name}!</div>
}
```

## Mantenimiento

### Limpieza de Sesiones Expiradas
Se recomienda crear un trabajo programado para limpiar sesiones expiradas:

```javascript
// Ejemplo de trabajo programado (cron job)
async function cleanupExpiredSessions() {
  await prisma.session.deleteMany({
    where: {
      expiresAt: {
        lt: new Date()
      }
    }
  })
}
```

### Monitoreo
- Monitorear intentos de login fallidos
- Registrar accesos no autorizados
- Alertas para sesiones sospechosas

## Consideraciones de Seguridad

1. **Rate Limiting**: Implementar límites de intentos de login
2. **Bloqueo de Cuentas**: Bloquear cuentas después de múltiples intentos fallidos
3. **Auditoría**: Registrar accesos y cambios importantes
4. **Rotación de Secretos**: Cambiar claves de encriptación periódicamente
5. **Validación de Input**: Validar siempre las entradas del usuario
6. **HTTPS**: Usar HTTPS en producción para proteger cookies y datos

## Configuración de Entorno

Variables de entorno requeridas:
```
DATABASE_URL=mongodb://...
NEXTAUTH_SECRET=your-secret-key
NODE_ENV=production|development
```
