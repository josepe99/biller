# Inventory Module Components

This directory contains the refactored inventory module, separated into smaller, more maintainable components for better code organization and understanding.

## Component Structure

### Main Component
- **`inventory-module.tsx`** - Main container component that manages state and orchestrates all child components

### UI Components

#### 1. `ProductFilters`
- **Purpose**: Handles search and filtering functionality
- **Features**:
  - Product search by name or barcode
  - Category filtering
  - Stock level filtering
  - Add product button
- **Props**:
  - `searchTerm`, `setSearchTerm`
  - `filterCategory`, `setFilterCategory`
  - `filterStock`, `setFilterStock`
  - `categories` - Array of available categories
  - `onAddProduct` - Callback to open add product modal

#### 2. `ProductForm`
- **Purpose**: Modal form for adding/editing products
- **Features**:
  - Form validation
  - Support for both add and edit modes
  - IVA percentage selection
- **Props**:
  - `isOpen`, `onOpenChange` - Modal visibility
  - `editingProduct` - Product being edited (null for add mode)
  - `onSubmit` - Form submission handler

#### 3. `ProductTable`
- **Purpose**: Displays products in a table format
- **Features**:
  - Responsive table layout
  - Stock level indicators with color coding
  - Price formatting
  - Empty state handling
- **Props**:
  - `products` - Array of products to display
  - `onEditProduct` - Callback for edit action
  - `onDeleteProduct` - Callback for delete action

#### 4. `ProductActions`
- **Purpose**: Action buttons for individual products
- **Features**:
  - Edit button
  - Delete button
  - Icon-based design
- **Props**:
  - `product` - Product object
  - `onEdit` - Edit callback
  - `onDelete` - Delete callback

#### 5. `DeleteConfirmDialog`
- **Purpose**: Confirmation modal for product deletion
- **Features**:
  - Safety confirmation
  - Product name display
  - Cancel/confirm actions
- **Props**:
  - `isOpen`, `onOpenChange` - Modal visibility
  - `product` - Product to be deleted
  - `onConfirm` - Deletion confirmation handler

## Benefits of This Structure

1. **Separation of Concerns**: Each component has a single responsibility
2. **Reusability**: Components can be reused in other parts of the application
3. **Maintainability**: Easier to locate and fix issues
4. **Testability**: Each component can be tested independently
5. **Readability**: Smaller files are easier to understand and review
6. **Type Safety**: Props are properly typed for better development experience

## Usage

```tsx
import { InventoryModule } from '@/components/features/inventory'

// In your page or parent component
<InventoryModule initialProducts={products} />
```

## File Organization

```
components/features/inventory/
├── index.ts                    # Export all components
├── inventory-module.tsx        # Main container component
├── product-filters.tsx         # Search and filtering
├── product-form.tsx           # Add/edit modal
├── product-table.tsx          # Product display table
├── product-actions.tsx        # Action buttons
└── delete-confirm-dialog.tsx  # Delete confirmation
```

This structure follows React best practices and makes the codebase more maintainable and scalable.
