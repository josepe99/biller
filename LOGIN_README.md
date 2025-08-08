# POS System Authentication with Server Actions

This document provides information about the server action-based authentication system for the POS application.

## Architecture Overview

The authentication system uses:
- **Server Actions**: For login/logout operations
- **localStorage**: For client-side session storage
- **HTTP-only Cookies**: For server-side session validation
- **React Context**: For global auth state management

## Components

### Server Actions
- `loginAction()` - Handles user authentication
- `logoutAction()` - Handles session termination

### Client Components
- `LoginForm` - Login interface with server action integration
- `LogoutButton` - Logout button component
- `AuthProvider` - Context provider for auth state
- `useAuth()` - Hook for accessing auth state

### Utilities
- `storage.ts` - localStorage management utilities
- `auth-provider.tsx` - Authentication context provider

## Authentication Flow

### Login Process
1. User submits credentials via `LoginForm`
2. `loginAction` server action validates credentials
3. Session created in database with HTTP-only cookie
4. Session ID and user data stored in localStorage
5. User redirected to intended page

### Session Management
- **Server-side**: HTTP-only cookie for middleware validation
- **Client-side**: localStorage for component state
- **Dual storage**: Ensures both server and client have session info

### Logout Process
1. User clicks `LogoutButton`
2. `logoutAction` invalidates server session
3. localStorage cleared
4. User redirected to login page

## Demo Accounts

| Role    | Email             | Password   | Permissions |
|---------|-------------------|------------|-------------|
| Admin   | admin@pos.com     | admin123   | Full system access |
| Manager | manager@pos.com   | manager123 | Manage products, categories, view reports |
| Cashier | cashier@pos.com   | cashier123 | Process sales, basic operations |

## Usage Examples

### Using Auth Context
```tsx
import { useAuth } from '@/components/auth/auth-provider'

function MyComponent() {
  const { user, isAuthenticated, isLoading } = useAuth()
  
  if (isLoading) return <div>Loading...</div>
  if (!isAuthenticated) return <div>Please login</div>
  
  return <div>Welcome, {user?.name}!</div>
}
```

### Using Logout Button
```tsx
import { LogoutButton } from '@/components/auth/logout-button'

function Header() {
  return (
    <header>
      <LogoutButton variant="outline" showIcon={true}>
        Sign Out
      </LogoutButton>
    </header>
  )
}
```

### Using Storage Utilities
```tsx
import { getSessionIdFromStorage, isAuthenticated } from '@/lib/utils/storage'

function checkAuth() {
  const sessionId = getSessionIdFromStorage()
  const authStatus = isAuthenticated()
  
  console.log('Session:', sessionId)
  console.log('Authenticated:', authStatus)
}
```

## Security Features

- **HTTP-only Cookies**: Prevents XSS attacks on server session
- **localStorage**: Enables client-side state management
- **Server Actions**: Type-safe, secure server-side operations
- **Middleware Protection**: Route-level authentication
- **Account Lockout**: Protection against brute force attacks
- **Session Expiration**: Automatic session timeout

## Middleware Protection

Routes are protected by Next.js middleware:

- **Public Routes**: `/`, `/login`
- **Admin Routes**: `/admin`, `/api/admin/*`
- **Manager Routes**: `/api/categories`, `/api/products`
- **Protected Routes**: All other routes require authentication

## File Structure

```
lib/
├── actions/
│   └── auth.ts              # Server actions for login/logout
├── utils/
│   ├── storage.ts           # localStorage utilities
│   ├── auth-edge.ts         # Edge-compatible auth functions
│   └── session-edge.ts      # Edge-compatible session functions
components/
├── auth/
│   ├── login-form.tsx       # Login form component
│   ├── logout-button.tsx    # Logout button component
│   └── auth-provider.tsx    # Auth context provider
hooks/
└── use-auth.ts              # Authentication hook
```

## Development

### Adding Auth to Components
1. Wrap your app with `AuthProvider` (already done in layout)
2. Use `useAuth()` hook to access auth state
3. Use `LogoutButton` for logout functionality

### Server Action Benefits
- **Type Safety**: Full TypeScript support
- **Performance**: No additional HTTP requests
- **Security**: Server-side validation and execution
- **Simplicity**: Direct function calls instead of fetch

### Testing Authentication
1. Navigate to `/login`
2. Use demo accounts to test different roles
3. Check localStorage in browser dev tools
4. Verify middleware protection on protected routes

## Troubleshooting

1. **Login Issues**: Check browser console for errors
2. **Session Problems**: Clear localStorage and cookies
3. **Permission Errors**: Verify user role and route access
4. **Server Action Issues**: Check server logs for errors

### Common Issues
- **localStorage not syncing**: Ensure client-side code runs after hydration
- **Server/client mismatch**: Use proper SSR/CSR boundaries
- **Session expired**: Implement refresh logic or redirect to login

For additional support, check the application logs or contact the development team.
