# POS System - Restructured

## New Project Structure

The POS system has been restructured for better organization and maintainability.

### Directory Structure

```
├── app/
│   ├── page.tsx                    # Main billing page (/)
│   ├── stock/
│   │   └── page.tsx               # Stock/Inventory page (/stock)
│   └── admin/
│       └── page.tsx               # Admin panel page (/admin)
├── components/
│   ├── features/                  # Feature-specific components
│   │   ├── billing/
│   │   │   ├── billing-module.tsx
│   │   │   └── product-search-modal.tsx
│   │   ├── inventory/
│   │   │   └── inventory-module.tsx
│   │   └── admin/
│   │       ├── admin-module.tsx
│   │       ├── user-management.tsx
│   │       └── category-management.tsx
│   ├── layout/                    # Layout components
│   │   └── dashboard-layout.tsx
│   └── ui/                        # UI components (shadcn/ui)
├── lib/
│   ├── types/                     # Type definitions
│   │   └── index.ts
│   ├── data/                      # Sample data
│   │   └── sample-data.ts
│   └── utils/                     # Utility functions
│       └── cart-calculations.ts
```

### Features by Route

#### Root Route (/) - Billing/Facturar
- Main billing/invoicing functionality
- Shopping cart management
- Product search and barcode scanning
- Payment processing

#### /stock - Inventory Management
- Product CRUD operations
- Stock level monitoring
- Category filtering
- Low stock alerts

#### /admin - Administration Panel
- User management
- Category management
- System settings
- Reports (placeholder)

### Key Improvements

1. **Modular Architecture**: Each feature is now in its own module with related components
2. **Clean Routing**: Simple, intuitive URLs (`/`, `/stock`, `/admin`)
3. **Reusable Components**: Shared layout and utility components
4. **Type Safety**: Centralized type definitions
5. **Maintainable**: Clear separation of concerns

### Navigation

The application uses a sidebar navigation with the following structure:
- **Facturar** (🛒): Main billing interface
- **Stock** (📦): Inventory management with low stock alerts
- **Admin** (⚙️): Administrative functions

### Development

All components are now properly modularized and can be developed/tested independently. The dashboard layout provides consistent navigation and branding across all routes.
